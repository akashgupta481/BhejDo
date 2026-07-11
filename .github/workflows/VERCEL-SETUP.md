# Disable Vercel Auto-Deploy

## Problem
Vercel is automatically deploying to production on every push to `main`, even before the Deploy PR is merged. This bypasses our controlled release process.

## Solution
Disable Vercel's automatic Git deployments and only deploy through GitHub Actions.

## Steps to Fix

### Step 1: Disable All Git Auto-Deploy Toggles

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select the **BhejDo** project
3. Go to **Settings** → **Git**
4. Turn **OFF** all these toggles:
   - ❌ Pull Request Comments
   - ❌ Commit Comments
   - ❌ deployment_status Events
   - ❌ repository_dispatch Events
   - ❌ Commit Status
   - ❌ Consolidated Commit Status

### Step 2: Configure Production Branch (if available)

Look for **"Production Branch"** section (may be in Settings → General or Settings → Git):
1. Either change it to a non-existent branch like `vercel-disabled`
2. Or uncheck "Automatically deploy all commits from this branch"

### Step 3: Verify Configuration Files

The following files are already configured in your repo:
- ✅ `vercel.json` - Sets `git.deploymentEnabled: false`
- ✅ `vercel-ignore-build.sh` - Blocks auto-deploys via ignore command

These will take effect on the next commit.

### Step 4: Alternative - Change Production Branch

If the above doesn't work, change your production branch:

1. Go to **Settings** → **General** (or **Domains** section)
2. Find **Production Branch** setting
3. Change from `main` to `vercel-production` (a branch that doesn't exist)
4. This prevents auto-deploys from main

**Important**: With our GitHub Actions workflow, we deploy using Vercel CLI with the `--prod` flag, which will still deploy to production domain regardless of the production branch setting.

### Option 2: Use Vercel Ignored Build Step

Add a `vercel-build.sh` script that prevents auto-deploys:

1. Create `vercel-build.sh` in the root:
   ```bash
   #!/bin/bash
   # Only allow deployments from GitHub Actions
   if [[ "$VERCEL_GIT_COMMIT_REF" == "deploy/"* ]] || [[ -n "$GITHUB_ACTIONS" ]]; then
     exit 1  # Proceed with build
   else
     exit 0  # Cancel build
   fi
   ```

2. Update `vercel.json`:
   ```json
   {
     "git": {
       "deploymentEnabled": false
     }
   }
   ```

### Option 3: Remove Git Integration (Most Restrictive)

1. Go to Vercel Dashboard → Project Settings → Git
2. Click **Disconnect** to remove Git integration
3. Deploy only through Vercel CLI in GitHub Actions (already configured in `deploy.yml`)

## Verification

After disabling auto-deploy:

1. Push a commit to `main`
2. Verify Vercel does NOT create a new deployment
3. Merge a Deploy PR
4. Verify GitHub Actions deploys to Vercel

## Why This Matters

Our workflow requires controlled deployments:
- ✅ Feature/Fix PR merged → Release PR created
- ✅ Release PR merged → Deploy PR created
- ✅ Deploy PR merged → **ONLY THEN** deploy to production
- ❌ Should NOT deploy on every main commit

## Current Workflow Status

- ✅ GitHub Actions workflows are configured correctly
- ✅ Release PR workflow works
- ✅ Deploy PR workflow works
- ❌ Vercel auto-deploy bypasses Deploy PR gate
- 🎯 **Fix**: Disable Vercel auto-deploy (use Option 1 or 2)
