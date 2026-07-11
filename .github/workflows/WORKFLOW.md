# BhejDo Deployment Workflow

## Complete Flow Diagram

```
Feature PR Merge
       ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STEP 1: auto-release.yml triggers
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       ↓
   Creates Release PR (release/vX.Y.Z)
   - Bumps version in package.json
   - Generates changelog
   - Opens PR to main
       ↓
   [WAIT: Manual Review & Merge]
       ↓
Release PR Merge
       ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STEP 2: create-deploy-pr.yml triggers
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       ↓
   Creates Git Tag (vX.Y.Z)
       ↓
   Creates GitHub Release
       ↓
   Creates Deploy PR (deploy/vX.Y.Z)
   - Adds .deploy-version marker
   - Opens PR to main
       ↓
   [WAIT: Manual Review & Merge]
       ↓
Deploy PR Merge
       ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STEP 3: deploy.yml triggers
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       ↓
   Deploys to Vercel Production
   - Builds frontend from ./frontend
   - Deploys to production
       ↓
   🚀 LIVE IN PRODUCTION
```

## Workflow Details

### 1. auto-release.yml - Create Release PR
**Trigger**: PR merged to `main` (excludes release/* and deploy/* branches)

**Actions**:
1. Determines version bump type (major/minor/patch) based on:
   - PR title (feat, fix, BREAKING CHANGE)
   - PR body (BREAKING CHANGE)
   - PR labels (feature, enhancement, breaking, major, minor)
2. Calculates new version from root `package.json`
3. Creates release branch `release/vX.Y.Z`
4. Updates version in `package.json` and `package-lock.json`
5. Generates changelog from git history
6. Opens Release PR to main

**Branch**: `release/vX.Y.Z` → `main`

### 2. create-deploy-pr.yml - Create Deploy PR
**Trigger**: Release PR merged to `main` (branch starts with release/)

**Actions**:
1. Reads version from root `package.json`
2. Creates Git tag `vX.Y.Z`
3. Generates release notes from commits
4. Creates GitHub Release with the tag
5. Creates deploy branch `deploy/vX.Y.Z`
6. Adds `.deploy-version` marker file
7. Opens Deploy PR to main

**Branch**: `deploy/vX.Y.Z` → `main`

### 3. deploy.yml - Deploy to Production
**Trigger**: Deploy PR merged to `main` (branch starts with deploy/)

**Actions**:
1. Reads version from `.deploy-version` file
2. Installs Vercel CLI
3. Pulls Vercel environment info
4. Builds frontend from `./frontend` directory
5. Deploys to Vercel production
6. Comments deployment URL on PR

**Deployment**: Frontend → Vercel Production

## Critical Flow Rules

### ✅ What triggers workflows:
1. **Feature/Fix PR merge** → Triggers Release PR creation
2. **Release PR merge** → Triggers Deploy PR creation + GitHub Release
3. **Deploy PR merge** → Triggers Production deployment

### 🛑 What prevents infinite loops:
- `auto-release.yml` excludes `release/*` and `deploy/*` branches
- `create-deploy-pr.yml` only triggers on `release/*` branches
- `deploy.yml` only triggers on `deploy/*` branches

### 🔒 What prevents premature deployments:
- **Manual review required** at each step
- Release PR must be manually merged
- Deploy PR must be manually merged
- No automatic deployments until Deploy PR is merged

## Version Bump Logic

### Major (X.0.0)
- PR title/body contains "BREAKING CHANGE"
- PR has labels: "breaking" or "major"
- Example: 1.2.3 → 2.0.0

### Minor (X.Y.0)
- PR title starts with "feat:" or "feature:"
- PR has labels: "feature", "enhancement", or "minor"
- Example: 1.2.3 → 1.3.0

### Patch (X.Y.Z)
- Default for everything else (fixes, docs, chores)
- Example: 1.2.3 → 1.2.4

## Prerequisites

### Required Secrets
- `PAT_TOKEN` - Personal Access Token with `repo` and `workflow` scopes
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

See `.github/workflows/SETUP.md` for setup instructions.

## Example Flow

### Scenario: Merging a new feature

1. **Developer merges feature PR**:
   ```
   PR #42: feat: Add payment gateway integration
   Branch: feature/payment-gateway → main
   ```

2. **Auto-release workflow runs**:
   - Detects "feat:" in title → Minor bump
   - Current version: 1.2.3 → New version: 1.3.0
   - Creates `release/v1.3.0` branch
   - Opens Release PR #43

3. **Team reviews Release PR #43**:
   - Reviews changelog
   - Verifies version bump
   - Manually merges to main

4. **Create deploy workflow runs**:
   - Creates tag `v1.3.0`
   - Creates GitHub Release
   - Creates `deploy/v1.3.0` branch
   - Opens Deploy PR #44

5. **Team reviews Deploy PR #44**:
   - Confirms ready for production
   - Manually merges to main

6. **Deploy workflow runs**:
   - Builds frontend from `./frontend`
   - Deploys to Vercel production
   - Comments deployment URL

7. **🚀 Version 1.3.0 is now LIVE**

## Safety Features

### No Accidental Deployments
- Two manual approval gates (Release PR + Deploy PR)
- Clear separation between versioning and deployment
- Each step requires explicit merge

### No Workflow Loops
- Branch name filtering prevents workflows from triggering themselves
- Release/Deploy PRs won't trigger new Release PRs

### Rollback Support
- All versions are tagged in Git
- GitHub Releases provide history
- Can revert by merging previous version

## Troubleshooting

### Release PR not created
- Check if PAT_TOKEN secret is set
- Verify PR was merged to main (not closed)
- Check workflow logs in Actions tab

### Deploy PR not created
- Ensure Release PR was merged (not just closed)
- Verify branch name starts with `release/`
- Check PAT_TOKEN is valid

### Deployment fails
- Verify all Vercel secrets are set
- Check that `./frontend` directory exists
- Review Vercel build logs

### Wrong version bump
- Ensure PR title follows conventional commits
- Use labels: feature, enhancement, breaking, major, minor
- Add "BREAKING CHANGE" in title/body for major bumps
