# 🚀 BhejDo Deployment Checklist

## ✅ Pre-Deployment Setup

- [ ] Push all code to GitHub (main branch)
- [ ] Ensure v1.0.0 tag exists: `git tag -l`
- [ ] Setup GitHub labels: `./scripts/setup-labels.sh` (requires GitHub CLI)

## ✅ Backend Deployment (Choose One)

### Option A: Render
- [ ] Sign up at https://dashboard.render.com/
- [ ] Create new Blueprint from GitHub repo
- [ ] Wait for deployment (~5 minutes)
- [ ] Copy backend URL
- [ ] Test health check: `curl https://your-backend.onrender.com/api/health`

### Option B: Railway
- [ ] Sign up at https://railway.app/
- [ ] Deploy from GitHub repo
- [ ] Set `JWT_SECRET` environment variable
- [ ] Copy backend URL
- [ ] Test health check: `curl https://your-backend.railway.app/api/health`

## ✅ Frontend Deployment

- [ ] Sign up at https://vercel.com/
- [ ] Import GitHub repo
- [ ] Set environment variable: `VITE_API_URL` = your backend URL
- [ ] Deploy
- [ ] Copy Vercel URL
- [ ] Test frontend: Open URL in browser

## ✅ Update CORS

- [ ] Edit `backend/index.js` line ~31
- [ ] Add your Vercel URL to CORS origins
- [ ] Commit and push: `git add . && git commit -m "chore: update CORS" && git push`
- [ ] Backend auto-redeploys

## ✅ Setup Auto-Releases (GitHub Actions)

### Get Vercel Credentials:
- [ ] Go to Vercel → Settings → Tokens → Create Token
- [ ] Copy token
- [ ] Go to your Vercel project → Settings → General
- [ ] Copy Project ID
- [ ] Go to your Vercel team settings → Copy Org ID

### Add GitHub Secrets:
- [ ] Go to GitHub repo → Settings → Secrets and variables → Actions
- [ ] Click "New repository secret" for each:
  - [ ] `VERCEL_TOKEN` = (token from above)
  - [ ] `VERCEL_PROJECT_ID` = (from project settings)
  - [ ] `VERCEL_ORG_ID` = (from team settings)

## ✅ Test Auto-Release

### Create a test PR:
```bash
git checkout -b test-deployment
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "feat: test auto-release"
git push origin test-deployment
```

- [ ] Go to GitHub → Create Pull Request
- [ ] Add label: `feature` or `minor`
- [ ] Merge PR
- [ ] Wait ~2 minutes
- [ ] Check Actions tab for workflow runs
- [ ] Check Releases tab for new release
- [ ] Verify Vercel deployment

## ✅ Verify Everything Works

- [ ] Open your Vercel URL
- [ ] Try logging in with demo accounts (see README)
- [ ] Create a test parcel
- [ ] Check browser console for errors
- [ ] Verify API calls work

## 🎉 Done!

Your app is now live and auto-deploys on every PR merge!

---

## 📊 What Happens on PR Merge?

1. **Auto-Release workflow** (`.github/workflows/auto-release.yml`):
   - Checks PR title/labels
   - Bumps version in `package.json`
   - Creates git tag (e.g., `v1.1.0`)
   - Generates changelog
   - Creates GitHub Release

2. **Deploy workflow** (`.github/workflows/deploy.yml`):
   - Triggered by new release/tag
   - Builds frontend
   - Deploys to Vercel production
   - Comments on release with deployment status

---

## 🔧 Useful Commands

```bash
# Check current version
cat package.json | grep version

# List all tags
git tag -l

# Create manual release (if needed)
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1

# Setup labels (requires gh CLI)
./scripts/setup-labels.sh

# Test backend locally
cd backend && npm start

# Test frontend locally
cd frontend && npm run dev

# Build frontend locally
cd frontend && npm run build

# Check Vercel deployments
vercel ls

# View Vercel logs
vercel logs
```

---

## 📱 Share Your App

Once deployed, share these URLs:

- **Live App**: https://your-app.vercel.app
- **API**: https://your-backend.onrender.com
- **Health Check**: https://your-backend.onrender.com/api/health
- **GitHub Releases**: https://github.com/akashgupta481/BhejDo/releases
- **Source Code**: https://github.com/akashgupta481/BhejDo

---

## 🆘 Troubleshooting

**Workflows not running?**
- Check Settings → Actions → General → "Allow all actions"
- Verify branch protection doesn't block workflow commits

**Deployment fails?**
- Check GitHub Actions logs
- Verify all secrets are set correctly
- Check Vercel deployment logs

**CORS errors?**
- Update `backend/index.js` CORS origins
- Redeploy backend

**Backend sleeping?**
- Normal on free tier (Render/Railway)
- First request wakes it up (~30 seconds)
- Consider Railway for better uptime

Need more help? Check `docs/DEPLOYMENT.md`
