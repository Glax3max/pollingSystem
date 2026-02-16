import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Poll from '@/models/Poll';

// Configure runtime for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const shareableId = searchParams.get('shareableId');

    if (!shareableId) {
      return NextResponse.json(
        { success: false, error: 'shareableId is required' },
        { status: 400 }
      );
    }

    const poll = await Poll.findOne({ shareableId, isActive: true });

    if (!poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Convert votes map to object
    const votesObject: Record<string, number> = {};
    poll.votes.forEach((value, key) => {
      votesObject[key] = value;
    });

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
  } catch (error) {
    console.error('Error fetching poll results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch poll results' },
      { status: 500 }
    );
  }
}
