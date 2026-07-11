# BhejDo Deployment Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Deploy Backend (Choose One)

#### Option A: Render (Recommended)
1. Go to https://dashboard.render.com/
2. Sign up/Login with GitHub
3. Click **"New +"** → **"Blueprint"**
4. Connect your `BhejDo` repository
5. Render will auto-detect `render.yaml`
6. Click **"Apply"** and wait for deployment
7. Copy your backend URL (e.g., `https://bhejdo-backend.onrender.com`)

**Important:** Free tier sleeps after 15 minutes of inactivity. First request takes ~30 seconds to wake up.

#### Option B: Railway
1. Go to https://railway.app/
2. Sign up/Login with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select `BhejDo` repository
5. Railway will use `railway.json` configuration
6. Add environment variable: `JWT_SECRET` = any random string (e.g., `my-super-secret-key-123`)
7. Copy your backend URL from Railway dashboard

### Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com/
2. Sign up/Login with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your `BhejDo` repository
5. Vercel will auto-detect settings from `vercel.json`
6. Add **Environment Variable**:
   - Key: `VITE_API_URL`
   - Value: Your backend URL (from Step 1)
7. Click **"Deploy"**
8. Copy your Vercel URL (e.g., `https://bhejdo.vercel.app`)

### Step 3: Update Backend CORS

1. Edit `backend/index.js` line 31-34:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    'https://bhejdo.vercel.app'  // Add your Vercel URL here
  ],
  credentials: true
}));
```

2. Commit and push:
```bash
git add backend/index.js
git commit -m "chore: update CORS for production"
git push origin main
```

3. Backend will auto-redeploy on Render/Railway

### Step 4: Setup Auto-Release with GitHub Actions

1. Go to your Vercel Dashboard → Settings → Tokens
2. Create new token, copy it
3. In Vercel Project Settings → General:
   - Copy **Project ID**
   - Go to your team/account settings → copy **Org ID**

4. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
5. Add these secrets:
   - `VERCEL_TOKEN`: (token from step 2)
   - `VERCEL_PROJECT_ID`: (from step 3)
   - `VERCEL_ORG_ID`: (from step 3)

**Done!** Now whenever you merge a PR to main:
- Version will auto-bump based on PR labels/title
- GitHub release will be created
- App will auto-deploy to Vercel

---

## 📦 How Auto-Versioning Works

When you merge a PR to `main`, version bumps automatically:

| PR Title/Labels | Version Bump | Example |
|----------------|--------------|---------|
| Contains "BREAKING CHANGE" or has `major` label | Major | 1.0.0 → 2.0.0 |
| Contains "feat"/"feature" or has `feature` label | Minor | 1.0.0 → 1.1.0 |
| Everything else (fix, docs, chore) | Patch | 1.0.0 → 1.0.1 |

### Examples:

**Feature PR:**
```
Title: feat: add payment gateway integration
Labels: feature, enhancement
→ Bumps to 1.1.0
```

**Bug Fix PR:**
```
Title: fix: resolve login timeout issue
Labels: bug
→ Bumps to 1.0.1
```

**Breaking Change PR:**
```
Title: refactor: change API response format (BREAKING CHANGE)
Labels: breaking
→ Bumps to 2.0.0
```

---

## 🔧 Troubleshooting

### Backend Issues

**Problem:** Backend returns 500 errors
- Check Render/Railway logs in dashboard
- Ensure `JWT_SECRET` environment variable is set
- Verify database initialized correctly

**Problem:** CORS errors in browser
- Update `backend/index.js` CORS to include your Vercel URL
- Redeploy backend

### Frontend Issues

**Problem:** API calls fail with network error
- Check `VITE_API_URL` environment variable in Vercel
- Verify backend is running (visit `https://your-backend/api/health`)
- Check browser console for CORS errors

**Problem:** Build fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles locally: `cd frontend && npm run build`

### GitHub Actions Issues

**Problem:** Auto-release workflow fails
- Check Actions tab in GitHub for error logs
- Verify branch protection rules allow workflows to push
- Ensure secrets are correctly set

**Problem:** Deployment workflow fails
- Verify `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` are set
- Check token hasn't expired
- Review Vercel deployment logs

---

## 💰 Cost Breakdown (FREE!)

| Service | Free Tier | Limitations |
|---------|-----------|-------------|
| **Vercel** | Unlimited deployments | 100GB bandwidth/month, hobby projects only |
| **Render** | 750 hours/month | Sleeps after 15 min inactivity, 512 MB RAM |
| **Railway** | $5 credit/month | ~500 hours of uptime, sleeps when idle |
| **GitHub Actions** | 2000 minutes/month | More than enough for auto-releases |

**Total Cost: $0/month** ✅

---

## 🎯 Next Steps

1. **Custom Domain:** Add your own domain in Vercel settings
2. **Database Upgrade:** Consider PostgreSQL on Railway/Render for production
3. **Monitoring:** Add Sentry or LogRocket for error tracking
4. **Analytics:** Integrate Google Analytics or Plausible
5. **CI/CD:** Add tests to GitHub Actions before deployment

---

## 📚 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)

---

## 🆘 Need Help?

- Open an issue on GitHub
- Check logs in Vercel/Render/Railway dashboard
- Review GitHub Actions workflow runs
- Visit `/api/health` on your backend to verify it's running
