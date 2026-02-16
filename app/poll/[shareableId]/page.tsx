'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface PollData {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  totalVotes: number;
  shareableId: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export default function PollPage() {
  const params = useParams();
  const router = useRouter();
  const shareableId = params.shareableId as string;
  const [poll, setPoll] = useState<PollData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const voterFingerprintRef = useRef<string>('');
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Generate a simple fingerprint
    if (typeof window !== 'undefined' && !voterFingerprintRef.current) {
      const stored = localStorage.getItem(`poll_${shareableId}_voted`);
      if (stored) {
        setHasVoted(true);
        voterFingerprintRef.current = stored;
      } else {
        voterFingerprintRef.current = `fp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
    }
  }, [shareableId]);

  useEffect(() => {
    fetchPoll();

    // Set up polling for real-time updates (every 2 seconds)
    pollIntervalRef.current = setInterval(() => {
      fetchPoll();
    }, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [shareableId, hasVoted]);

  const fetchPoll = async () => {
    try {
      const response = await fetch(`/api/polls?shareableId=${shareableId}`);
      const data = await response.json();

      if (data.success) {
        setPoll(data.poll);
        setIsLoading(false);
      } else {
        if (data.error === 'Poll not found' || response.status === 404) {
          setError(data.error || 'Poll not found');
          setIsLoading(false);
        }
        // Don't set error for expired polls if we already have poll data
        if (response.status === 410 && poll) {
          setPoll({ ...poll, isActive: false });
        }
      }
    } catch (err) {
      if (!poll) {
        setError('Failed to load poll');
        setIsLoading(false);
      }
    }
  };

  const handleVote = async () => {
    if (!selectedOption || hasVoted) return;

    setIsVoting(true);
    setError('');

    try {
      const response = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shareableId,
          option: selectedOption,
          voterFingerprint: voterFingerprintRef.current,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPoll(data.poll);
        setHasVoted(true);
        localStorage.setItem(`poll_${shareableId}_voted`, voterFingerprintRef.current);
      } else {
        setError(data.error || 'Failed to vote');
        if (data.error?.includes('already voted')) {
          setHasVoted(true);
        }
      }
    } catch (err) {
      setError('Failed to vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/poll/${shareableId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPercentage = (votes: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Grabbing your poll…</p>
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">We couldn’t load that poll</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error || 'The link might be wrong, expired, or the poll was removed.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create New Poll
          </button>
        </div>
      </div>
    );
  }

  if (!poll) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {poll.question}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  {poll.totalVotes === 0
                    ? 'No votes yet'
                    : `${poll.totalVotes} ${poll.totalVotes === 1 ? 'vote' : 'votes'} so far`}
                </span>
                {poll.expiresAt && (
                  <span>
                    Closes on {new Date(poll.expiresAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                <span className="font-semibold">Heads up: </span>
                {error}
              </div>
            )}

            {!hasVoted && poll.isActive ? (
              <div className="space-y-4 mb-6">
                {poll.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedOption(option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedOption === option
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <span className="text-gray-900 dark:text-white">{option}</span>
                  </button>
                ))}
                <button
                  onClick={handleVote}
                  disabled={!selectedOption || isVoting}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVoting ? 'Sending your vote…' : 'Submit my vote'}
                </button>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {poll.options.map((option) => {
                  const votes = poll.votes[option] || 0;
                  const percentage = getPercentage(votes, poll.totalVotes);
                  return (
                    <div key={option} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 dark:text-white font-medium">
                          {option}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          {votes} votes ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div
                          className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                {hasVoted && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                    ✓ You’ve already voted on this poll. Sit back and watch the results update.
                  </p>
                )}
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={copyLink}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {copied ? '✓ Link copied' : 'Copy link to this poll'}
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create New Poll
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
