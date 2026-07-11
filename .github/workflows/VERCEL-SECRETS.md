# Setting Up Vercel Secrets for GitHub Actions

## Problem
The deploy workflow failed because Vercel secrets are missing or empty.

## Required Secrets

You need to add 3 secrets to GitHub:

1. **VERCEL_TOKEN** - Authentication token for Vercel CLI
2. **VERCEL_ORG_ID** - Your Vercel organization/team ID
3. **VERCEL_PROJECT_ID** - Your BhejDo project ID

## Step-by-Step Setup

### 1. Get VERCEL_TOKEN

1. Go to https://vercel.com/account/tokens
2. Click **Create Token**
3. Name it: `GitHub Actions BhejDo`
4. Set expiration: Choose based on your preference (recommend: No Expiration for automation)
5. Click **Create**
6. **Copy the token immediately** (you won't see it again)

### 2. Get VERCEL_ORG_ID

#### Method 1: From Vercel Dashboard
1. Go to https://vercel.com/account
2. Look at your team/username in the URL: `vercel.com/<team-name>`
3. Your Org ID might be visible in Settings → General

#### Method 2: Using Vercel CLI
```bash
cd BhejDo
npx vercel link
# Follow the prompts to link your project
# This creates .vercel/project.json with the IDs
cat .vercel/project.json
```

The file will show:
```json
{
  "orgId": "team_xxxxx",
  "projectId": "prj_xxxxx"
}
```

### 3. Get VERCEL_PROJECT_ID

From the same sources as VERCEL_ORG_ID:
- **.vercel/project.json** (after running `vercel link`)
- **Vercel Dashboard** → Project Settings → General → Project ID

You already saw it: `prj_DZwFPijANe2QfmdoCJ8cAS4HWIyS`

### 4. Add Secrets to GitHub

1. Go to your GitHub repository: https://github.com/akashgupta481/BhejDo
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:

**Secret 1:**
- Name: `VERCEL_TOKEN`
- Value: [your token from step 1]

**Secret 2:**
- Name: `VERCEL_ORG_ID`
- Value: [your org ID from step 2]

**Secret 3:**
- Name: `VERCEL_PROJECT_ID`
- Value: `prj_DZwFPijANe2QfmdoCJ8cAS4HWIyS`

## Reconnecting Vercel (If Disconnected)

### You DON'T need to reconnect GitHub to Vercel!

The workflow uses **Vercel CLI** which deploys directly using tokens, not GitHub integration.

However, if you want Vercel dashboard to show GitHub info:

1. Go to Vercel Dashboard → Your Project → Settings → Git
2. Click **Connect Git Repository**
3. Select `akashgupta481/BhejDo`
4. **Turn OFF all auto-deploy toggles** (as shown in VERCEL-SETUP.md)

This gives you the best of both worlds:
- ✅ Vercel shows GitHub commit info
- ✅ Vercel shows branch names
- ❌ Vercel does NOT auto-deploy
- ✅ Only GitHub Actions can deploy

## Testing

After adding the secrets:

1. Go to the failed workflow run: https://github.com/akashgupta481/BhejDo/actions
2. Click on the failed "Deploy to Production" run
3. Click **Re-run failed jobs**

Or create a new test deployment:
```bash
# Create a new feature PR, merge it, and follow the release process
```

## Verification

After deployment succeeds, you should see:
- ✅ Workflow shows green checkmark
- ✅ Vercel dashboard shows new deployment
- ✅ PR has a comment with deployment URL
- ✅ Your app is live at the production URL

## Security Notes

- Never commit these tokens to your repository
- Only store them in GitHub Secrets
- Tokens have full access to your Vercel account
- Use expiring tokens if possible
- Regenerate tokens if compromised
