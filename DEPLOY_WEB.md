# Deploy Web App

Quick guide to redeploy the web app to S3 + CloudFront.

---

## Prerequisites

- AWS CLI configured (`aws configure`)
- Node.js 18+ installed

---

## Quick Deploy (Copy & Paste)

```bash
cd /Users/amitojsinghahuja/Desktop/idealot/apps/web
npm run build
aws s3 sync dist/ s3://idealot-web-app --delete
```

---

## Step-by-Step

### 1. Navigate to Web App

```bash
cd /Users/amitojsinghahuja/Desktop/idealot/apps/web
```

### 2. Install Dependencies (if needed)

```bash
npm install
```

### 3. Update Environment Variables (if needed)

Edit `.env.production`:

```bash
nano .env.production
```

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# API URL
VITE_API_URL=https://api.ideasapp.zensthub.com

# Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID=
VITE_META_PIXEL_ID=
```

### 4. Build

```bash
npm run build
```

This creates the `dist/` folder with static files.

### 5. Upload to S3

```bash
aws s3 sync dist/ s3://idealot-web-app --delete
```

### 6. Invalidate CloudFront Cache (Optional)

If changes aren't showing, invalidate the cache:

```bash
aws cloudfront create-invalidation --distribution-id E3GXL3H1DGVZWR --paths "/*"
```

> Replace `YOUR_DISTRIBUTION_ID` with your actual CloudFront distribution ID.

---

## Deployment Info

| Setting | Value |
|---------|-------|
| S3 Bucket | `idealot-web-app` |
| CloudFront Domain | `https://ideasapp.zensthub.com` |
| Build Output | `dist/` |
| API URL | `https://api.ideasapp.zensthub.com` |

---

## Troubleshooting

### Build fails with TypeScript errors

```bash
npm run lint
```

Fix any errors, then rebuild.

### API calls failing (CORS errors)

1. Check `VITE_API_URL` is correct in `.env.production`
2. Check API's `FRONTEND_URL` env var matches `https://ideasapp.zensthub.com`
3. Restart API: `pm2 restart idealot-api`

### Auth not working

1. Check Supabase Dashboard → Authentication → URL Configuration
2. Site URL should be: `https://ideasapp.zensthub.com`
3. Redirect URLs should include:
   - `https://ideasapp.zensthub.com`
   - `https://ideasapp.zensthub.com/**`

### Changes not showing after deploy

1. Clear browser cache
2. Invalidate CloudFront cache (Step 6)
3. Wait 5-10 minutes for propagation

### Blank page or routing issues

Make sure CloudFront has error pages configured:
- 403 → `/index.html` → 200
- 404 → `/index.html` → 200
