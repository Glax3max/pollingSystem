# Polling System

A modern polling system built with Next.js, TypeScript, Tailwind CSS, and MongoDB. Features include poll creation, shareable links, real-time result updates, and anti-abuse mechanisms.

## Features

- ✅ **Poll Creation**: Create polls with custom questions and multiple options
- ✅ **Shareable Links**: Each poll gets a unique shareable link
- ✅ **Real-time Updates**: Poll results update automatically every 2 seconds
- ✅ **Anti-abuse Mechanisms**: 
  - IP-based duplicate vote prevention
  - Rate limiting (max 10 votes per IP per hour)
  - Browser fingerprinting for additional protection
- ✅ **Persistent Data Storage**: All polls and votes are stored in MongoDB
- ✅ **Expiration Support**: Optional expiration dates for polls
- ✅ **Beautiful UI**: Modern, responsive design with Tailwind CSS

## Prerequisites

- Node.js 18+ installed
- MongoDB instance running (local or cloud)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/polling-system
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```
   
   For MongoDB Atlas (cloud), use:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/polling-system
   ```

3. **Start MongoDB** (if running locally)
   ```bash
   # On Windows
   mongod
   
   # On macOS/Linux
   sudo systemctl start mongod
   # or
   brew services start mongodb-community
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open Your Browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Create a Poll**
   - Enter your poll question
   - Add at least 2 options (up to 10)
   - Optionally set an expiration date
   - Click "Create Poll"

2. **Share Your Poll**
   - After creating, you'll be redirected to the poll page
   - Click "Copy Shareable Link" to share with others

3. **Vote on a Poll**
   - Select an option
   - Click "Vote"
   - Results update in real-time

4. **View Results**
   - Results are displayed with vote counts and percentages
   - Visual progress bars show distribution
   - Updates automatically every 2 seconds

## Project Structure

```
├── app/
│   ├── api/
│   │   └── polls/
│   │       ├── route.ts          # Create and fetch polls
│   │       ├── vote/
│   │       │   └── route.ts      # Vote endpoint
│   │       └── results/
│   │           └── route.ts      # Get poll results
│   ├── poll/
│   │   └── [shareableId]/
│   │       └── page.tsx          # Poll viewing/voting page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (poll creation)
├── lib/
│   └── mongodb.ts                # MongoDB connection
├── models/
│   ├── Poll.ts                   # Poll model
│   └── Vote.ts                   # Vote model
└── package.json
```

## API Endpoints

### POST `/api/polls`
Create a new poll.

**Request Body:**
```json
{
  "question": "What's your favorite color?",
  "options": ["Red", "Blue", "Green"],
  "expiresAt": "2024-12-31T23:59:59" // Optional
}
```

### GET `/api/polls?shareableId={id}`
Get poll details by shareable ID.

### POST `/api/polls/vote`
Submit a vote.

**Request Body:**
```json
{
  "shareableId": "abc123def456",
  "option": "Red",
  "voterFingerprint": "fp-1234567890-xyz" // Optional
}
```

### GET `/api/polls/results?shareableId={id}`
Get poll results.

## Anti-abuse Features

1. **Duplicate Vote Prevention**: Uses IP address and browser fingerprinting
2. **Rate Limiting**: Maximum 10 votes per IP address per hour
3. **Vote Tracking**: All votes are stored with IP and fingerprint for audit
4. **Poll Expiration**: Optional expiration dates prevent old polls from being voted on

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **Zod**: Schema validation

## License

MIT
