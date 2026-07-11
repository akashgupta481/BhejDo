#!/bin/bash

# Vercel Ignored Build Step
# This script prevents automatic deployments from Git pushes
# Only allows deployments triggered by GitHub Actions

echo "Checking if build should proceed..."

# Allow builds from GitHub Actions (our deploy.yml workflow)
if [[ -n "$GITHUB_ACTIONS" ]]; then
  echo "✅ Build triggered by GitHub Actions - proceeding"
  exit 1
fi

# Allow builds from deploy/* branches (Deploy PRs)
if [[ "$VERCEL_GIT_COMMIT_REF" == deploy/* ]]; then
  echo "✅ Build from deploy branch - proceeding"
  exit 1
fi

# Block all other builds (automatic Git deployments)
echo "❌ Automatic Git deployment blocked"
echo "Deploy through GitHub Actions workflow only"
echo "Merge a Deploy PR to trigger production deployment"
exit 0
