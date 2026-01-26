# Deploy API

Quick guide to redeploy the API to EC2.

---

## Prerequisites

- SSH access to EC2
- Node.js 18+ installed locally
- PEM key file

---

## Connection Info

```bash
# SSH into EC2
ssh -i /Users/amitojsinghahuja/Downloads/myfitminder-backend.pem ec2-user@35.92.144.61
```

---

## Quick Deploy (Copy & Paste)

### On your Mac (Local):

```bash
# 1. Build locally
cd /Users/amitojsinghahuja/Desktop/idealot/apps/api
npm run build

# 2. Create archive
cd /Users/amitojsinghahuja/Desktop/idealot
tar --exclude='node_modules' -czvf /tmp/idealot-api.tar.gz \
    apps/api/dist \
    apps/api/package.json \
    apps/api/package-lock.json

# 3. Upload to EC2
scp -i /Users/amitojsinghahuja/Downloads/myfitminder-backend.pem \
    /tmp/idealot-api.tar.gz \
    ec2-user@35.92.144.61:/tmp/
```

### On EC2:

```bash
# 4. SSH in
ssh -i /Users/amitojsinghahuja/Downloads/myfitminder-backend.pem ec2-user@35.92.144.61

# 5. Extract and update
cd /var/www/idealot-api
rm -rf apps/api/dist
tar -xzvf /tmp/idealot-api.tar.gz

# 6. Install dependencies (if package.json changed)
cd apps/api
npm install --production

# 7. Restart
pm2 restart idealot-api

# 8. Check logs
pm2 logs idealot-api --lines 20
```

---

## Step-by-Step

### 1. Build Locally

```bash
cd /Users/amitojsinghahuja/Desktop/idealot/apps/api
npm install
npm run build
```

### 2. Create Deployment Archive

```bash
cd /Users/amitojsinghahuja/Desktop/idealot

tar --exclude='node_modules' -czvf /tmp/idealot-api.tar.gz \
    apps/api/dist \
    apps/api/package.json \
    apps/api/package-lock.json
```

### 3. Upload to EC2

```bash
scp -i /Users/amitojsinghahuja/Downloads/myfitminder-backend.pem \
    /tmp/idealot-api.tar.gz \
    ec2-user@35.92.144.61:/tmp/
```

### 4. SSH into EC2

```bash
ssh -i /Users/amitojsinghahuja/Downloads/myfitminder-backend.pem ec2-user@35.92.144.61
```

### 5. Extract Files

```bash
cd /var/www/idealot-api
rm -rf apps/api/dist
tar -xzvf /tmp/idealot-api.tar.gz
```

### 6. Install Dependencies (if needed)

Only needed if `package.json` changed:

```bash
cd /var/www/idealot-api/apps/api
npm install --production
```

### 7. Restart API

```bash
pm2 restart idealot-api
```

### 8. Verify

```bash
# Check status
pm2 status

# Check logs
pm2 logs idealot-api --lines 20

# Test health endpoint
curl http://localhost:3001/health
```

---

## Deployment Info

| Setting | Value |
|---------|-------|
| EC2 IP | `35.92.144.61` |
| API Path | `/var/www/idealot-api/apps/api` |
| Port | `3001` |
| Domain | `https://api.ideasapp.zensthub.com` |
| Process Manager | PM2 |
| PM2 App Name | `idealot-api` |

---

## Environment Variables

Location on EC2: `/var/www/idealot-api/apps/api/.env`

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://ideasapp.zensthub.com
GOOGLE_AI_API_KEY=your_key
```

To edit:

```bash
nano /var/www/idealot-api/apps/api/.env
pm2 restart idealot-api
```

---

## Useful Commands

```bash
# Check PM2 status
pm2 status

# View logs (live)
pm2 logs idealot-api

# View last 100 lines
pm2 logs idealot-api --lines 100

# Restart API
pm2 restart idealot-api

# Stop API
pm2 stop idealot-api

# Start API
pm2 start idealot-api

# Check what's running on port 3001
sudo netstat -tlnp | grep 3001

# Check Nginx status
sudo systemctl status nginx

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### API not responding

```bash
pm2 status
pm2 logs idealot-api --lines 50
```

### Port already in use

```bash
sudo netstat -tlnp | grep 3001
# Kill the process if needed
pm2 delete idealot-api
pm2 start /var/www/idealot-api/apps/api/dist/apps/api/src/index.js --name "idealot-api"
```

### CORS errors on web app

1. Check `FRONTEND_URL` in `.env` matches exactly: `https://ideasapp.zensthub.com`
2. Restart: `pm2 restart idealot-api`

### SSL certificate expired

```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Nginx config issues

```bash
sudo nginx -t
sudo systemctl reload nginx
```
