import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
  pollId: string;
  option: string;
  voterIp: string;
  voterFingerprint: string;
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>({
  pollId: {
    type: String,
    required: true,
    index: true,
  },
  option: {
    type: String,
    required: true,
  },
  voterIp: {
    type: String,
    required: true,
    index: true,
  },
  voterFingerprint: {
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 * 30, // Auto-delete after 30 days
  },
});

// Compound index to prevent duplicate votes
VoteSchema.index({ pollId: 1, voterIp: 1, voterFingerprint: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);
