# Deploy Landing Page

Quick guide to redeploy the landing page to S3 + CloudFront.

---

## Prerequisites

- AWS CLI configured (`aws configure`)
- Node.js 18+ installed

---

## Quick Deploy (Copy & Paste)

```bash
cd /Users/amitojsinghahuja/Desktop/idealot/apps/landing
npm run build
aws s3 sync out/ s3://idealot-landing --delete
```

---

## Step-by-Step

### 1. Navigate to Landing Page

```bash
cd /Users/amitojsinghahuja/Desktop/idealot/apps/landing
```

### 2. Install Dependencies (if needed)

```bash
npm install
```

### 3. Update Environment Variables (if needed)

Edit `.env`:

```bash
nano .env
```

```env
NEXT_PUBLIC_SITE_URL=https://ideas.zensthub.com
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
NEXT_PUBLIC_META_PIXEL_ID=
```

### 4. Build

```bash
npm run build
```

This creates the `out/` folder with static files.

### 5. Upload to S3

```bash
aws s3 sync out/ s3://idealot-landing --delete
```

### 6. Invalidate CloudFront Cache (Optional)

If changes aren't showing, invalidate the cache:

```bash
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

> Replace `YOUR_DISTRIBUTION_ID` with your actual CloudFront distribution ID.

---

## Deployment Info

| Setting | Value |
|---------|-------|
| S3 Bucket | `idealot-landing` |
| CloudFront Domain | `https://ideas.zensthub.com` |
| Build Output | `out/` |

---

## Troubleshooting

### Build fails with "output: 'export'" error

Make sure `next.config.js` has:

```javascript
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
}
```

### Changes not showing after deploy

1. Clear browser cache
2. Invalidate CloudFront cache (Step 6)
3. Wait 5-10 minutes for propagation

### Lint errors preventing build

Fix any ESLint errors first:

```bash
npm run lint
```
