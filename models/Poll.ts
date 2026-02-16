import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPoll extends Document {
  question: string;
  options: string[];
  votes: Map<string, number>;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  shareableId: string;
  totalVotes: number;
}

const PollSchema = new Schema<IPoll>({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (options: string[]) => options.length >= 2 && options.length <= 10,
      message: 'Poll must have between 2 and 10 options',
    },
  },
  votes: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  shareableId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  totalVotes: {
    type: Number,
    default: 0,
  },
});

// Ensure votes map is initialized
PollSchema.pre('save', function (next) {
  if (!this.votes) {
    this.votes = new Map();
  }
  // Initialize vote counts for all options
  this.options.forEach((option) => {
    if (!this.votes.has(option)) {
      this.votes.set(option, 0);
    }
  });
  next();
});

export default mongoose.models.Poll || mongoose.model<IPoll>('Poll', PollSchema);
