# Disable Vercel Auto-Deploy

## Problem
Vercel is automatically deploying to production on every push to `main`, even before the Deploy PR is merged. This bypasses our controlled release process.

## Solution
Disable Vercel's automatic Git deployments and only deploy through GitHub Actions.

## Steps to Fix

### Option 1: Disable Auto-Deploy in Vercel Dashboard (Recommended)

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select the **BhejDo** project
3. Go to **Settings** → **Git**
4. Find **Production Branch** section
5. **Uncheck** or disable "Automatically deploy all commits from this branch"
6. Alternatively, set Production Branch to a non-existent branch like `vercel-production-disabled`

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
