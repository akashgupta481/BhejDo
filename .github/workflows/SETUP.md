# GitHub Actions Setup

## Required Secrets

To enable automated release and deploy PR creation, you need to set up a Personal Access Token (PAT).

### Creating a PAT_TOKEN

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Or visit: https://github.com/settings/tokens

2. Click "Generate new token (classic)"

3. Configure the token:
   - **Note**: `BhejDo Release Automation`
   - **Expiration**: Choose based on your security policy (recommend: 90 days or 1 year)
   - **Scopes**: Select the following:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)

4. Click "Generate token" and **copy the token immediately** (you won't see it again)

5. Add the token to your repository secrets:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - **Name**: `PAT_TOKEN`
   - **Value**: Paste your token
   - Click "Add secret"

### Why is this needed?

GitHub Actions' default `GITHUB_TOKEN` cannot create or approve pull requests to prevent infinite workflow loops. A PAT with appropriate permissions is required for workflows to:
- Create release PRs automatically
- Create deploy PRs automatically
- Trigger subsequent workflows from pushed commits

### Security Note

The PAT will have access to your repositories. Keep it secure:
- Never commit the token to your repository
- Only store it in GitHub Secrets
- Set an appropriate expiration date
- Regenerate periodically
- Use fine-grained tokens when they support workflow triggers (GitHub is working on this)

## Workflows

### 1. Create Release PR (`auto-release.yml`)
- **Trigger**: When a PR is merged to `main` (except release/* and deploy/* branches)
- **Actions**:
  - Determines version bump (major/minor/patch) based on PR title, body, and labels
  - Creates a release branch with updated version
  - Generates changelog from git history
  - Opens a Release PR to `main`

### 2. Create Deploy PR (`create-deploy-pr.yml`)
- **Trigger**: When a Release PR is merged to `main`
- **Actions**:
  - Creates a deploy branch
  - Opens a Deploy PR to `main`

### 3. Deploy (`deploy.yml`)
- **Trigger**: When a Deploy PR is merged to `main`
- **Actions**: (Add your deployment steps here)

## Troubleshooting

### Error: "GitHub Actions is not permitted to create or approve pull requests"
- The `PAT_TOKEN` secret is missing or invalid
- Follow the setup steps above to create and add the token

### Workflow doesn't trigger
- Check that the triggering event matches (e.g., PR merged to `main`)
- Ensure the workflow file exists on the `main` branch
- Check workflow run logs in Actions tab
