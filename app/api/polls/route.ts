import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Poll from '@/models/Poll';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Configure runtime for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createPollSchema = z.object({
  question: z.string().min(1).max(500),
  options: z.array(z.string().min(1).max(200)).min(2).max(10),
  expiresAt: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = createPollSchema.parse(body);

    const shareableId = uuidv4().replace(/-/g, '').substring(0, 12);

    const pollData: any = {
      question: validatedData.question,
      options: validatedData.options,
      shareableId,
      votes: new Map(),
      totalVotes: 0,
    };

    if (validatedData.expiresAt) {
      pollData.expiresAt = new Date(validatedData.expiresAt);
    }

    const poll = new Poll(pollData);
    await poll.save();

    // Initialize vote counts
    validatedData.options.forEach((option) => {
      poll.votes.set(option, 0);
    });
    await poll.save();

    return NextResponse.json(
      {
        success: true,
        poll: {
          id: poll._id.toString(),
          question: poll.question,
          options: poll.options,
          shareableId: poll.shareableId,
          createdAt: poll.createdAt,
          expiresAt: poll.expiresAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating poll:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create poll' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const shareableId = searchParams.get('shareableId');

    if (shareableId) {
      const poll = await Poll.findOne({ shareableId, isActive: true });

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

      // Convert votes map to object
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
          createdAt: poll.createdAt,
          expiresAt: poll.expiresAt,
          isActive: poll.isActive,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'shareableId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching poll:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch poll' },
      { status: 500 }
    );
  }
}
