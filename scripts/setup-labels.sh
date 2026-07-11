#!/bin/bash

# Setup GitHub Labels for Auto-Versioning
# Requires: GitHub CLI (gh) - Install from https://cli.github.com/

set -e

echo "🏷️  Setting up GitHub labels for auto-versioning..."
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "📦 Install it from: https://cli.github.com/"
    echo ""
    echo "Or install via:"
    echo "  macOS:   brew install gh"
    echo "  Linux:   See https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo "  Windows: winget install GitHub.cli"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "🔐 Not authenticated with GitHub. Running gh auth login..."
    gh auth login
fi

echo "Creating labels..."
echo ""

# Version bump labels
gh label create "major" --color "d73a4a" --description "Major version bump (breaking changes)" --force 2>/dev/null && echo "✅ Created: major" || echo "ℹ️  Label 'major' already exists"
gh label create "minor" --color "0e8a16" --description "Minor version bump (new features)" --force 2>/dev/null && echo "✅ Created: minor" || echo "ℹ️  Label 'minor' already exists"
gh label create "patch" --color "fbca04" --description "Patch version bump (bug fixes)" --force 2>/dev/null && echo "✅ Created: patch" || echo "ℹ️  Label 'patch' already exists"

# Feature and enhancement
gh label create "feature" --color "a2eeef" --description "New feature" --force 2>/dev/null && echo "✅ Created: feature" || echo "ℹ️  Label 'feature' already exists"
gh label create "enhancement" --color "a2eeef" --description "Enhancement to existing feature" --force 2>/dev/null && echo "✅ Created: enhancement" || echo "ℹ️  Label 'enhancement' already exists"

# Bug fixes
gh label create "bug" --color "d73a4a" --description "Bug fix" --force 2>/dev/null && echo "✅ Created: bug" || echo "ℹ️  Label 'bug' already exists"
gh label create "fix" --color "d73a4a" --description "Bug fix" --force 2>/dev/null && echo "✅ Created: fix" || echo "ℹ️  Label 'fix' already exists"

# Breaking changes
gh label create "breaking" --color "d73a4a" --description "Breaking change" --force 2>/dev/null && echo "✅ Created: breaking" || echo "ℹ️  Label 'breaking' already exists"

# Documentation and chores
gh label create "docs" --color "0075ca" --description "Documentation only" --force 2>/dev/null && echo "✅ Created: docs" || echo "ℹ️  Label 'docs' already exists"
gh label create "chore" --color "fef2c0" --description "Maintenance tasks" --force 2>/dev/null && echo "✅ Created: chore" || echo "ℹ️  Label 'chore' already exists"

echo ""
echo "✨ Labels setup complete!"
echo ""
echo "📋 Label Guide:"
echo "  • major/breaking → X.0.0 (breaking changes)"
echo "  • feature/enhancement/minor → x.X.0 (new features)"
echo "  • bug/fix/docs/chore/patch → x.x.X (fixes & maintenance)"
echo ""
echo "🎯 Apply these labels to your PRs for automatic version bumping!"
