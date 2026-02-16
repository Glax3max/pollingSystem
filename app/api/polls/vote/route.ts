import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Poll from '@/models/Poll';
import Vote from '@/models/Vote';
import { z } from 'zod';

// Configure runtime for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const voteSchema = z.object({
  shareableId: z.string(),
  option: z.string(),
  voterFingerprint: z.string().optional(),
});

function getClientIp(request: NextRequest): string {
  // Vercel uses x-forwarded-for header
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback for local development
  return request.ip || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = voteSchema.parse(body);

    const poll = await Poll.findOne({
      shareableId: validatedData.shareableId,
      isActive: true,
    });

    if (!poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Check if poll has expired
    if (poll.expiresAt && new Date() > poll.expiresAt) {
      poll.isActive = false;
      await poll.save();
      return NextResponse.json(
        { success: false, error: 'Poll has expired' },
        { status: 410 }
      );
    }

    // Validate option exists
    if (!poll.options.includes(validatedData.option)) {
      return NextResponse.json(
        { success: false, error: 'Invalid option' },
        { status: 400 }
      );
    }

    const voterIp = getClientIp(request);
    const voterFingerprint = validatedData.voterFingerprint || `ip-${voterIp}`;

    // Check for duplicate vote (anti-abuse)
    const existingVote = await Vote.findOne({
      pollId: poll._id.toString(),
      voterIp,
      voterFingerprint,
    });

    if (existingVote) {
      return NextResponse.json(
        { success: false, error: 'You have already voted on this poll' },
        { status: 403 }
      );
    }

    // Rate limiting: Check votes from same IP in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentVotes = await Vote.countDocuments({
      voterIp,
      createdAt: { $gte: oneHourAgo },
    });

    if (recentVotes >= 10) {
      return NextResponse.json(
        { success: false, error: 'Too many votes. Please try again later.' },
        { status: 429 }
      );
    }

    // Record the vote
    const vote = new Vote({
      pollId: poll._id.toString(),
      option: validatedData.option,
      voterIp,
      voterFingerprint,
    });
    await vote.save();

    // Update poll vote count
    const currentVotes = poll.votes.get(validatedData.option) || 0;
    poll.votes.set(validatedData.option, currentVotes + 1);
    poll.totalVotes = (poll.totalVotes || 0) + 1;
    await poll.save();

    // Convert votes map to object for response
    const votesObject: Record<string, number> = Object.fromEntries(
      Array.from(poll.votes.entries())
    ) as Record<string, number>;

    return NextResponse.json({
      success: true,
      poll: {
        id: poll._id.toString(),
        question: poll.question,
        options: poll.options,
        votes: votesObject,
        totalVotes: poll.totalVotes,
        shareableId: poll.shareableId,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      // Duplicate vote detected
      return NextResponse.json(
        { success: false, error: 'You have already voted on this poll' },
        { status: 403 }
      );
    }

    console.error('Error voting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}
