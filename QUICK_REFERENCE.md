# 🚀 Quick Reference Card

## One-Command Deployment

```bash
# Interactive deployment wizard (recommended for first-time)
./scripts/deploy-helper.sh
```

---

## Push This Branch

```bash
# Push deployment changes to GitHub
git push origin akashg2/deploy

# Then create PR on GitHub with label "feature" and merge
```

---

## Deployment URLs

### Free Hosting Platforms
- **Vercel** (Frontend): https://vercel.com/new
- **Render** (Backend): https://dashboard.render.com/
- **Railway** (Backend Alternative): https://railway.app/dashboard

### Your Repository
- **GitHub Actions**: https://github.com/akashgupta481/BhejDo/actions
- **Releases**: https://github.com/akashgupta481/BhejDo/releases

---

## Setup Commands

```bash
# Setup GitHub labels for version control
./scripts/setup-labels.sh

# Check current version
cat package.json | grep version

# Test backend health (replace URL)
curl https://your-backend.onrender.com/api/health

# View Vercel logs (requires Vercel CLI)
vercel logs
```

---

## Manual Deployment Steps

### 1. Backend (Render)
1. Go to: https://dashboard.render.com/
2. New Blueprint → Connect BhejDo repo
3. Click Apply → Wait ~2 minutes
4. Copy backend URL

### 2. Frontend (Vercel)  
1. Go to: https://vercel.com/new
2. Import BhejDo repo
3. Add env: `VITE_API_URL` = backend URL
4. Deploy → Copy frontend URL

### 3. Update CORS
```javascript
// backend/index.js line ~31
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend.vercel.app'  // Add this
  ],
  credentials: true
}));
```

### 4. GitHub Secrets (for auto-deploy)
Go to: Settings → Secrets and variables → Actions

Add:
- `VERCEL_TOKEN` (from https://vercel.com/account/tokens)
- `VERCEL_PROJECT_ID` (from project settings)
- `VERCEL_ORG_ID` (from team settings)

---

## Version Bumping Cheat Sheet

| Want to bump to | Add PR label | Or use PR title |
|----------------|--------------|-----------------|
| 2.0.0 (major) | `major` or `breaking` | "BREAKING CHANGE: ..." |
| 1.1.0 (minor) | `feature` or `enhancement` | "feat: ..." |
| 1.0.1 (patch) | `bug` or `fix` | "fix: ..." |

---

## Test Auto-Release

```bash
# 1. Create test branch
git checkout -b test-release

# 2. Make change
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "feat: test auto release"

# 3. Push & create PR
git push origin test-release

# 4. On GitHub: Add "feature" label → Merge
# 5. Watch Actions tab for workflows
```

---

## Environment Variables

### Backend (Render/Railway)
```env
NODE_ENV=production
JWT_SECRET=<random-secret-key>
PORT=3001
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.onrender.com
```

### GitHub Actions Secrets
```
VERCEL_TOKEN=<token>
VERCEL_PROJECT_ID=<project-id>
VERCEL_ORG_ID=<org-id>
```

---

## Troubleshooting

### CORS Error
→ Add Vercel URL to `backend/index.js` CORS config

### Backend 500 Error
→ Check Render/Railway logs → Verify JWT_SECRET is set

### Frontend Can't Connect
→ Check `VITE_API_URL` in Vercel env vars

### Workflow Not Running
→ Check Settings → Actions → Allow all actions

### Build Fails
→ Check GitHub Actions logs → Verify all secrets are set

---

## Documentation Files

| File | Purpose |
|------|---------|
| `DEPLOYMENT_SUMMARY.md` | Complete overview with flow diagram |
| `DEPLOY_CHECKLIST.md` | Step-by-step deployment checklist |
| `docs/DEPLOYMENT.md` | Comprehensive deployment guide |
| `docs/ENVIRONMENT_VARIABLES.md` | All environment variables |
| `docs/LABELS.md` | GitHub labels guide |
| `README.md` | Updated with deployment section |

---

## Quick Links

- 📖 **Start Here**: `DEPLOYMENT_SUMMARY.md`
- ✅ **Checklist**: `DEPLOY_CHECKLIST.md`
- 🔧 **Interactive**: `./scripts/deploy-helper.sh`
- 🏷️ **Labels**: `./scripts/setup-labels.sh`

---

## Support

Need help?
1. Check the documentation above
2. View workflow logs in GitHub Actions
3. Check Vercel/Render dashboard logs
4. Open issue on GitHub

---

💡 **Tip**: Bookmark this file for quick access to deployment commands!
