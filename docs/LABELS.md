# Labels for Auto-Versioning

## Version Bump Labels

Apply these labels to PRs to control version bumping:

### Major Version (X.0.0)
- `major` - Breaking changes that require major version bump
- `breaking` - Breaking API changes

Use when:
- Removing or renaming API endpoints
- Changing database schema in incompatible way
- Removing features or changing behavior significantly

### Minor Version (x.X.0)
- `feature` - New features
- `enhancement` - Improvements to existing features
- `minor` - Minor version bump

Use when:
- Adding new features
- Adding new API endpoints
- Enhancing existing functionality

### Patch Version (x.x.X)
- `bug` - Bug fixes
- `fix` - Bug fixes
- `docs` - Documentation changes
- `chore` - Maintenance tasks
- `patch` - Patch version bump

Use when:
- Fixing bugs
- Updating documentation
- Refactoring code without behavior changes
- Updating dependencies

## Creating Labels

Run this in your terminal to create all labels:

```bash
gh label create "major" --color "d73a4a" --description "Major version bump (breaking changes)"
gh label create "minor" --color "0e8a16" --description "Minor version bump (new features)"
gh label create "patch" --color "fbca04" --description "Patch version bump (bug fixes)"
gh label create "feature" --color "a2eeef" --description "New feature"
gh label create "enhancement" --color "a2eeef" --description "Enhancement to existing feature"
gh label create "bug" --color "d73a4a" --description "Bug fix"
gh label create "breaking" --color "d73a4a" --description "Breaking change"
gh label create "docs" --color "0075ca" --description "Documentation only"
gh label create "chore" --color "fef2c0" --description "Maintenance tasks"
```

Or manually create them in: GitHub Repo → Issues → Labels → New Label
