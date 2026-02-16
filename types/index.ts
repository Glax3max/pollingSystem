export interface Poll {
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

export interface CreatePollRequest {
  question: string;
  options: string[];
  expiresAt?: string;
}

export interface VoteRequest {
  shareableId: string;
  option: string;
  voterFingerprint?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  poll?: T;
  details?: any;
}
