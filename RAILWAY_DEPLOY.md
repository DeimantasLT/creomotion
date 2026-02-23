# CreoMotion - Railway Deployment Guide

## 🚀 Quick Deploy

### 1. Connect Railway to GitHub
1. Go to https://railway.app
2. Sign in with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select `DeimantasLT/creomotion`

### 2. Add Services

Your project needs 3 services:

#### A. PostgreSQL Database
- Click **New** → **Database** → **PostgreSQL**
- Railway will auto-provision
- Copy the `DATABASE_URL` from variables

#### B. Redis
- Click **New** → **Data** → **Redis**
- Railway will auto-provision
- Copy the `REDIS_URL` from variables

#### C. App Service
- Click **New** → **GitHub Repo** → `creomotion`
- Railway will detect `Dockerfile.prod`

### 3. Set Environment Variables

In Railway dashboard → Variables → Add these:

```bash
# Database (from Railway PostgreSQL)
DATABASE_URL=postgresql://...

# Redis (from Railway Redis)
REDIS_URL=redis://...

# Auth
NEXTAUTH_URL=https://your-project.up.railway.app
NEXTAUTH_SECRET=<generate-random-string>

# App
NODE_ENV=production

# Google Drive (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
```

### 4. Deploy
- Railway will auto-build and deploy
- First deploy takes ~5-10 minutes
- Check **Deployments** tab for logs

### 5. Run Migrations
After first deploy, run in Railway Shell:

```bash
npx prisma migrate deploy
npx prisma generate
npm run db:seed:cms
```

---

## 🔧 Troubleshooting

### Build Fails
- Check **Deployments** tab for logs
- Ensure `Dockerfile.prod` exists
- Verify `package.json` scripts

### Database Errors
- Run `npx prisma generate` in Railway Shell
- Check `DATABASE_URL` is correct
- Run `npx prisma migrate deploy`

### Redis Errors
- Ensure Redis service is added
- Check `REDIS_URL` variable

---

## 💰 Estimated Cost

- **PostgreSQL:** Free tier (512MB)
- **Redis:** Free tier (256MB)
- **App:** ~$5-10/mėn (depends on usage)
- **Total:** ~$5-15/mėn

---

## 🔄 Auto-Deploy

Railway auto-deploys on every push to `master`:

```bash
git add .
git commit -m "Fix something"
git push
# Railway builds automatically!
```

---

## 📊 Monitoring

- **Logs:** Railway Dashboard → Deployments → View Logs
- **Metrics:** Railway Dashboard → Metrics
- **Shell:** Railway Dashboard → Shell (for DB commands)

---

**Deployed!** 🎉
