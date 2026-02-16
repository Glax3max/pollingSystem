# Deploying to Vercel

This guide will help you deploy your polling system to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A MongoDB database (local or MongoDB Atlas)
- Your code pushed to GitHub, GitLab, or Bitbucket

## Step-by-Step Deployment

### 1. Push Your Code to Git

Make sure your code is in a Git repository:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js

### 3. Configure Environment Variables

In the Vercel project settings, add these environment variables:

**Required:**
- `MONGODB_URI` - Your MongoDB connection string
  - Local: `mongodb://localhost:27017/polling-system`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/polling-system`

**Optional:**
- `NEXT_PUBLIC_BASE_URL` - Your Vercel deployment URL (usually auto-set)

### 4. Deploy

1. Click "Deploy"
2. Vercel will build and deploy your app
3. Once deployed, you'll get a URL like `https://your-app.vercel.app`

### 5. Update MongoDB Connection (if using Atlas)

If you're using MongoDB Atlas:
1. Go to your Atlas cluster
2. Click "Network Access"
3. Add `0.0.0.0/0` to allow connections from anywhere (or Vercel's IP ranges)
4. Make sure your database user has proper permissions

## MongoDB Atlas Setup

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist IP addresses (add `0.0.0.0/0` for Vercel)
5. Get your connection string and add it to Vercel environment variables

## Troubleshooting

### Database Connection Issues

- **Error: "MONGODB_URI not defined"**
  - Make sure you've added the environment variable in Vercel project settings
  - Redeploy after adding environment variables

- **Error: "Connection timeout"**
  - Check MongoDB Atlas network access settings
  - Ensure your IP is whitelisted (or use `0.0.0.0/0`)

- **Error: "Authentication failed"**
  - Verify your MongoDB username and password
  - Check database user permissions

### Build Issues

- **Build fails with TypeScript errors**
  - Run `npm run build` locally to check for errors
  - Fix any TypeScript errors before deploying

- **Module not found errors**
  - Ensure all dependencies are in `package.json`
  - Run `npm install` locally to verify

### Runtime Issues

- **API routes timing out**
  - Check Vercel function logs in the dashboard
  - Ensure MongoDB connection is properly configured
  - The `vercel.json` sets max duration to 10 seconds

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `NEXT_PUBLIC_BASE_URL` | No | Base URL for the app | `https://your-app.vercel.app` |

## Post-Deployment

After deployment:

1. Test creating a poll
2. Test voting on a poll
3. Test sharing links
4. Check Vercel function logs for any errors
5. Monitor MongoDB Atlas for connection activity

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Continuous Deployment

Vercel automatically deploys when you push to your main branch. For other branches:
- Push to a branch → Vercel creates a preview deployment
- Merge to main → Vercel creates a production deployment

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
