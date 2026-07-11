# Frequently Asked Questions

## Q: Once I merge a PR, will it automatically go live?

**For the FIRST PR (this deployment PR):**
- ❌ NO - Not automatically
- The auto-release workflow WILL create a version and GitHub release
- But the deploy workflow WILL FAIL (needs one-time setup first)
- You need to:
  1. Deploy backend to Render (5 mins)
  2. Deploy frontend to Vercel (3 mins)
  3. Update CORS in backend (2 mins)
  4. Add GitHub secrets (3 mins)

**For ALL FUTURE PRs (after one-time setup):**
- ✅ YES - 100% automatic!
- Just merge PR → wait 2-3 minutes → app is live with new version
- No manual steps needed

---

## Q: Will version automatically change when I merge PRs?

✅ **YES!** Version bumps automatically based on PR labels:

| PR Label | Version Change | Example |
|----------|----------------|---------|
| `feature`, `enhancement`, `minor` | Minor bump | 1.0.0 → 1.1.0 |
| `bug`, `fix`, `patch`, `docs`, `chore` | Patch bump | 1.0.0 → 1.0.1 |
| `major`, `breaking` | Major bump | 1.0.0 → 2.0.0 |
| No label | Patch bump (default) | 1.0.0 → 1.0.1 |

---

## Q: Will my app stay live when I deploy updates?

✅ **YES!** 
- Vercel does **zero-downtime deployments**
- Users on the site continue without interruption
- New visitors get the latest version immediately
- Old version stays up until new version is ready

---

## Q: What happens after I merge a PR?

**Automatic workflow (after one-time setup):**

```
1. Merge PR to main
   ↓ (30 seconds)
2. Version auto-bumps based on label
   ↓ (instantly)
3. Git tag created (e.g., v1.1.0)
   ↓ (instantly)
4. GitHub Release created with changelog
   ↓ (triggers deployment)
5. Vercel builds and deploys frontend
   ↓ (2 minutes)
6. ✅ App is LIVE with new version!
```

**Total time: ~2-3 minutes, fully automatic**

---

## Q: Do I need to manually create releases?

❌ **NO!** 
- GitHub Actions automatically creates releases
- Changelog is auto-generated from commit messages
- Release notes include all changes since last version
- You never need to manually create tags or releases

---

## Q: How much does this cost?

💰 **$0/month - Completely FREE!**

| Service | Cost | Limitations |
|---------|------|-------------|
| Vercel (Frontend) | Free | 100GB bandwidth/month |
| Render (Backend) | Free | Sleeps after 15 min inactivity |
| Railway (Alternative) | $5 credit/month | ~500 hours uptime |
| GitHub Actions | Free | 2000 minutes/month |

---

## Q: What if I want to skip auto-deployment for a PR?

**Option 1:** Don't add a label
- Still creates release but with patch bump only
- Still auto-deploys

**Option 2:** Add `[skip ci]` to commit message
- Skips GitHub Actions workflows
- No release, no deployment

**Option 3:** Merge to a different branch first
- Only merges to `main` trigger workflows
- Test on staging branch, then merge to main

---

## Q: Can I rollback to a previous version?

✅ **YES!** Two ways:

**Method 1: Via Vercel Dashboard**
- Go to Vercel → Deployments
- Find previous deployment
- Click "Promote to Production"
- Takes ~10 seconds

**Method 2: Via Git**
```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or checkout specific tag
git checkout v1.0.0
git checkout -b hotfix
# ... fix issue ...
git push
```

---

## Q: How do I test before deploying to production?

**Option 1: Preview Deployments (Vercel)**
- Every PR automatically gets a preview URL
- Test on the preview before merging
- Example: `https://bhejdo-pr-7.vercel.app`

**Option 2: Staging Branch**
- Create a `staging` branch
- Merge to staging first, test
- Then merge to main for production

**Option 3: Manual Testing**
```bash
# Test locally before pushing
npm run build
npm run preview
```

---

## Q: What if the deployment fails?

**Check these:**

1. **View GitHub Actions logs**
   - Go to: Actions tab on GitHub
   - Click the failed workflow
   - Read error messages

2. **Common issues:**
   - Missing secrets → Add them in Settings → Secrets
   - Build errors → Check build logs in Vercel
   - Backend issues → Check Render/Railway logs
   - CORS errors → Update backend/index.js

3. **Get help:**
   - Check `docs/DEPLOYMENT.md` troubleshooting section
   - Review workflow logs
   - Open issue on GitHub

---

## Q: Can I customize the versioning rules?

✅ **YES!** Edit `.github/workflows/auto-release.yml`

Current logic (line ~30):
```yaml
# Check PR title, body, and labels to determine bump type
```

You can change:
- Which labels trigger which bumps
- Default bump type (currently patch)
- Whether to require labels
- Custom version schemes

---

## Q: How do I monitor my deployments?

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- View deployments, logs, analytics
- Get alerts on build failures

**Render:**
- Dashboard: https://dashboard.render.com/
- View logs, metrics, events
- Configure health checks

**GitHub:**
- Actions tab: View workflow runs
- Releases tab: See all versions
- Enable notifications for failures

---

## Q: Do I need to do anything special for database migrations?

⚠️ **YES - Important!**

Current setup uses SQLite (file-based database):
- Not ideal for production
- Render free tier may lose data on restarts

**Recommended:**
1. Upgrade to PostgreSQL on Render/Railway
2. Run migrations before deploying code changes
3. Add migration step to deployment workflow

**For now (SQLite):**
- Database resets when Render service restarts
- Good for testing, not production
- See `docs/DEPLOYMENT.md` for PostgreSQL setup

---

## Q: Can team members deploy without knowing all this?

✅ **YES!** After your one-time setup:

**For developers:**
1. Create branch
2. Make changes
3. Create PR
4. Add appropriate label
5. Merge PR
6. Done! (automatic from here)

They don't need to know about:
- Vercel/Render
- GitHub secrets
- Deployment workflows
- Version bumping logic

**Just:** "Add label → Merge → Wait 2 minutes"

---

## Q: Where can I find more information?

📚 **Documentation:**
- **Quick Start**: `DEPLOYMENT_SUMMARY.md`
- **Step-by-Step**: `DEPLOY_CHECKLIST.md`
- **Commands**: `QUICK_REFERENCE.md`
- **Full Guide**: `docs/DEPLOYMENT.md`
- **Environment Vars**: `docs/ENVIRONMENT_VARIABLES.md`
- **Labels**: `docs/LABELS.md`

🔧 **Tools:**
- Interactive setup: `./scripts/deploy-helper.sh`
- Label setup: `./scripts/setup-labels.sh`

🔗 **Links:**
- PR: https://github.com/akashgupta481/BhejDo/pull/7
- Vercel: https://vercel.com/dashboard
- Render: https://dashboard.render.com/
- Actions: https://github.com/akashgupta481/BhejDo/actions

---

## Q: What's next after merging this PR?

**Immediate next steps:**

1. ✅ **Merge PR #7**
   - Go to: https://github.com/akashgupta481/BhejDo/pull/7
   - Click "Merge pull request"

2. 🔧 **Run one-time setup**
   ```bash
   cd /Users/akash/workspace/BhejDo
   ./scripts/deploy-helper.sh
   ```
   OR follow: `DEPLOY_CHECKLIST.md`

3. ✅ **Test your live app**
   - Visit your Vercel URL
   - Try logging in with demo accounts
   - Verify everything works

4. 🎉 **You're done!**
   - All future PRs deploy automatically
   - Share your live URL with users

---

**Need more help?** Check the documentation or open an issue!
