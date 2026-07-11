# Manual Approval CI/CD Workflow

## 🎯 Overview

This project uses a **3-stage manual approval process** for releases and deployments:

```
Feature PR merged to main
         ↓ (automatic)
Release PR created: "Release vX.X.X"
         ↓ (YOU REVIEW & APPROVE)
Release PR merged → Version tag created
         ↓ (automatic)
Deploy PR created: "Deploy vX.X.X"
         ↓ (YOU REVIEW & APPROVE)
Deploy PR merged → Production deployment
```

**Key Point**: You have **2 manual approval gates** before anything goes to production!

---

## 📋 Complete Workflow

### Stage 1: Feature Development (Manual)

**Developer creates and merges feature PR:**

```bash
git checkout -b feature/new-feature
# ... make changes ...
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

1. Create PR to `main`
2. Add label: `feature`, `bug`, `major`, etc.
3. Review and merge PR

---

### Stage 2: Release PR (Automatic Creation)

**After feature PR is merged:**

✅ **GitHub Actions automatically:**
1. Calculates new version based on PR label
2. Creates branch `release/vX.X.X`
3. Updates `package.json` with new version
4. Creates PR: **"Release vX.X.X"**
5. Adds changelog with all changes

**⏸️ WORKFLOW PAUSES - Waiting for YOUR approval!**

---

### Stage 3: Review Release PR (Manual Approval #1)

**You review the Release PR:**

Go to: https://github.com/akashgupta481/BhejDo/pulls

Look for PR titled: **"Release vX.X.X"**

**Review checklist:**
- [ ] Version number is correct
- [ ] Changelog includes all changes
- [ ] Ready to create release

**Then:**
- ✅ Merge the Release PR

---

### Stage 4: Tag & Deploy PR (Automatic Creation)

**After Release PR is merged:**

✅ **GitHub Actions automatically:**
1. Creates git tag `vX.X.X`
2. Creates GitHub Release with changelog
3. Creates branch `deploy/vX.X.X`
4. Creates PR: **"Deploy vX.X.X to Production"**

**⏸️ WORKFLOW PAUSES AGAIN - Waiting for YOUR approval!**

---

### Stage 5: Review Deploy PR (Manual Approval #2)

**You review the Deploy PR:**

Go to: https://github.com/akashgupta481/BhejDo/pulls

Look for PR titled: **"Deploy vX.X.X to Production"**

**Pre-deployment checklist:**
- [ ] Release notes reviewed
- [ ] All tests passing
- [ ] Ready to deploy to production

**Then:**
- ✅ Merge the Deploy PR

---

### Stage 6: Production Deployment (Automatic)

**After Deploy PR is merged:**

✅ **GitHub Actions automatically:**
1. Builds frontend
2. Deploys to Vercel Production
3. Backend auto-deploys from main (Render)
4. Comments deployment URL on PR

**🎉 Your app is now LIVE with the new version!**

---

## 🎯 Example Flow

### Day 1: Feature Development

**Developer creates feature:**
```bash
git checkout -b feature/payment-integration
# ... implement payment feature ...
git commit -m "feat: add payment gateway integration"
git push
```

**Create PR:**
- Title: "feat: add payment gateway integration"
- Label: `feature`
- Review → **Merge to main**

---

### Day 1: Automatic Release PR Created

**GitHub Actions automatically creates:**

**PR #123: "Release v1.2.0"**
- Branch: `release/v1.2.0`
- Changes: Updates version 1.1.0 → 1.2.0
- Changelog:
  ```
  - feat: add payment gateway integration (abc123)
  - fix: resolve login timeout (def456)
  ```

**⏸️ YOU REVIEW:**
- Check version bump is correct (minor for feature)
- Review all changes in changelog
- ✅ **Merge Release PR #123**

---

### Day 1: Automatic Tag & Deploy PR Created

**GitHub Actions automatically:**
1. Creates tag: `v1.2.0`
2. Creates release: https://github.com/.../releases/tag/v1.2.0

**PR #124: "Deploy v1.2.0 to Production"**
- Branch: `deploy/v1.2.0`
- Links to release
- Pre-deployment checklist

**⏸️ YOU DECIDE WHEN TO DEPLOY:**

Maybe you wait until:
- End of day
- After QA testing
- After stakeholder approval
- Monday morning (if it's Friday)

**When ready:**
- ✅ **Merge Deploy PR #124**

---

### Day 1 (or Day 2): Automatic Deployment

**GitHub Actions automatically:**
- Deploys to Vercel
- Users see v1.2.0
- PR comment: "🚀 Deployment successful!"

---

## 🔧 Version Bumping Rules

The Release PR version is calculated based on the merged PR's label:

| PR Label | Version Bump | Example |
|----------|--------------|---------|
| `major`, `breaking` | X.0.0 | 1.5.3 → **2.0.0** |
| `feature`, `enhancement`, `minor` | x.X.0 | 1.5.3 → **1.6.0** |
| `bug`, `fix`, `patch`, `docs`, `chore` | x.x.X | 1.5.3 → **1.5.4** |

---

## 📊 PR Labels

| Label | Color | Purpose |
|-------|-------|---------|
| `major` | Red | Breaking changes |
| `breaking` | Red | Breaking changes |
| `feature` | Blue | New features |
| `enhancement` | Blue | Improvements |
| `minor` | Blue | Minor version bump |
| `bug` | Red | Bug fixes |
| `fix` | Red | Bug fixes |
| `patch` | Yellow | Patch version bump |
| `docs` | Blue | Documentation |
| `chore` | Yellow | Maintenance |
| `release` | Dark Blue | Release PRs (auto-added) |
| `deployment` | Purple | Deploy PRs (auto-added) |

---

## 🎛️ Control Points

You have **full control** at two stages:

### Control Point #1: Release PR
**Question**: "Is this ready to be tagged as a release?"

You can:
- ✅ Merge immediately
- 🔧 Request changes to the code first
- ⏸️ Wait for QA/testing
- ❌ Close and create manual release later

### Control Point #2: Deploy PR
**Question**: "Is this ready to go to production?"

You can:
- ✅ Deploy immediately
- ⏸️ Wait for off-peak hours
- ⏸️ Wait for stakeholder approval
- ⏸️ Schedule for later
- ❌ Close and deploy manually

---

## 🚀 Quick Reference

### Current PRs
```bash
# View all open PRs
gh pr list

# View only release PRs
gh pr list --label release

# View only deploy PRs
gh pr list --label deployment
```

### Manual Operations

**Create manual release:**
```bash
# If you need to create a release manually
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

**Skip workflow:**
```bash
# Add [skip ci] to commit message
git commit -m "docs: update README [skip ci]"
```

---

## 📝 Workflow Files

| File | Purpose |
|------|---------|
| `.github/workflows/auto-release.yml` | Creates Release PR when feature PR merges |
| `.github/workflows/create-deploy-pr.yml` | Creates Deploy PR when Release PR merges |
| `.github/workflows/deploy.yml` | Deploys to production when Deploy PR merges |

---

## 🆘 Troubleshooting

### Release PR not created?
**Check:**
- Was the PR merged (not closed)?
- Does the branch NOT start with `release/` or `deploy/`?
- Check GitHub Actions logs

### Deploy PR not created?
**Check:**
- Was the Release PR merged?
- Does the branch start with `release/`?
- Check if tag was created: `git tag -l`

### Deployment failed?
**Check:**
- Are GitHub secrets set? (VERCEL_TOKEN, etc.)
- Check Vercel deployment logs
- Verify Deploy PR was merged

---

## 💡 Benefits of This Workflow

✅ **Two approval gates** before production
✅ **Review changes** before creating release
✅ **Control deployment timing** independently of release
✅ **Safe rollback**: Just revert the deploy PR
✅ **Audit trail**: Every release and deployment is a PR
✅ **Team-friendly**: Clear process for everyone
✅ **Prevents accidents**: No accidental deployments

---

## 🎯 Summary

**For Developers:**
1. Create feature branch
2. Create PR with appropriate label
3. Merge when approved
4. ✅ Done! (Release and Deploy PRs are automatic)

**For Release Managers:**
1. Review Release PR (check version & changelog)
2. Merge when ready to tag release
3. Review Deploy PR (check pre-deployment checklist)
4. Merge when ready to go live
5. ✅ Done! (Deployment is automatic)

**Result**: Full control with minimal manual work! 🚀
