# Vercel Deployment Checklist ✅

## Pre-Deployment

- [x] MongoDB connection optimized for serverless
- [x] API routes configured with proper runtime
- [x] IP detection works with Vercel headers
- [x] vercel.json configured with function timeouts
- [x] Environment variables documented

## Deployment Steps

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. **Connect to Vercel**
   - Go to vercel.com
   - Import your repository
   - Vercel auto-detects Next.js

3. **Add Environment Variables**
   - `MONGODB_URI` (required)
   - `NEXT_PUBLIC_BASE_URL` (optional - auto-set by Vercel)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Test your deployment

## Post-Deployment Testing

- [ ] Create a new poll
- [ ] Vote on the poll
- [ ] Share the poll link
- [ ] Check real-time updates
- [ ] Verify MongoDB connection in logs

## Common Issues & Solutions

### Issue: Database connection timeout
**Solution:** Check MongoDB Atlas network access (allow `0.0.0.0/0`)

### Issue: Build fails
**Solution:** Check build logs, ensure all dependencies are in package.json

### Issue: API routes return 500
**Solution:** Check function logs in Vercel dashboard, verify MONGODB_URI is set

### Issue: CORS errors
**Solution:** Not applicable - Next.js handles this automatically

## Files Modified for Vercel

- ✅ `lib/mongodb.ts` - Optimized connection pooling
- ✅ `app/api/**/*.ts` - Added runtime configuration
- ✅ `next.config.js` - Added Vercel optimizations
- ✅ `vercel.json` - Function timeout configuration
- ✅ IP detection - Works with Vercel headers

## Notes

- Vercel automatically sets `NEXT_PUBLIC_BASE_URL` in production
- MongoDB Atlas recommended for production
- Function timeout set to 10 seconds (sufficient for DB operations)
- Connection pooling optimized for serverless cold starts
