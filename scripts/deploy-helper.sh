#!/bin/bash

# BhejDo Deployment Helper Script
# This script guides you through the deployment process

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "========================================"
echo "🚀 BhejDo Deployment Helper"
echo "========================================"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

if command_exists git; then
    print_success "Git is installed"
else
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed ($NODE_VERSION)"
else
    print_error "Node.js is not installed. Please install Node.js >= 22.5.0"
    exit 1
fi

if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm is installed ($NPM_VERSION)"
else
    print_error "npm is not installed"
    exit 1
fi

echo ""
echo "========================================"
echo "📋 Deployment Checklist"
echo "========================================"
echo ""

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_info "Current version: v$CURRENT_VERSION"
echo ""

# Check if on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "You're on branch: $CURRENT_BRANCH (not main)"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "Step 1: Backend Deployment"
echo "─────────────────────────────────────"
echo ""
echo "Choose your backend hosting platform:"
echo "  1) Render (Recommended - Free tier, persistent storage)"
echo "  2) Railway (Alternative - $5 credit/month)"
echo "  3) Skip (I've already deployed the backend)"
echo ""
read -p "Enter your choice (1-3): " BACKEND_CHOICE

case $BACKEND_CHOICE in
    1)
        print_info "Opening Render dashboard..."
        sleep 1
        open "https://dashboard.render.com/" 2>/dev/null || xdg-open "https://dashboard.render.com/" 2>/dev/null || echo "Please open: https://dashboard.render.com/"
        echo ""
        print_info "Follow these steps in Render:"
        echo "  1. Click 'New +' → 'Blueprint'"
        echo "  2. Connect your BhejDo repository"
        echo "  3. Render will auto-detect render.yaml"
        echo "  4. Click 'Apply' and wait for deployment"
        echo ""
        read -p "Press Enter when backend is deployed..."
        echo ""
        read -p "Enter your Render backend URL (e.g., https://bhejdo-backend.onrender.com): " BACKEND_URL
        ;;
    2)
        print_info "Opening Railway dashboard..."
        sleep 1
        open "https://railway.app/dashboard" 2>/dev/null || xdg-open "https://railway.app/dashboard" 2>/dev/null || echo "Please open: https://railway.app/dashboard"
        echo ""
        print_info "Follow these steps in Railway:"
        echo "  1. Click 'New Project' → 'Deploy from GitHub repo'"
        echo "  2. Select BhejDo repository"
        echo "  3. Add environment variable: JWT_SECRET = (any random string)"
        echo "  4. Wait for deployment"
        echo ""
        read -p "Press Enter when backend is deployed..."
        echo ""
        read -p "Enter your Railway backend URL (e.g., https://bhejdo-backend.railway.app): " BACKEND_URL
        ;;
    3)
        read -p "Enter your existing backend URL: " BACKEND_URL
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_success "Backend URL saved: $BACKEND_URL"
echo ""

# Test backend health
print_info "Testing backend health..."
if command_exists curl; then
    HEALTH_CHECK="${BACKEND_URL}/api/health"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK" || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Backend is healthy! (HTTP $HTTP_CODE)"
    else
        print_warning "Backend health check returned HTTP $HTTP_CODE"
        print_info "This might be normal if backend is still starting up (Render takes ~1 min)"
    fi
else
    print_warning "curl not found, skipping health check"
fi

echo ""
echo "Step 2: Frontend Deployment"
echo "─────────────────────────────────────"
echo ""

read -p "Have you deployed frontend to Vercel yet? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Opening Vercel dashboard..."
    sleep 1
    open "https://vercel.com/new" 2>/dev/null || xdg-open "https://vercel.com/new" 2>/dev/null || echo "Please open: https://vercel.com/new"
    echo ""
    print_info "Follow these steps in Vercel:"
    echo "  1. Click 'Add New' → 'Project'"
    echo "  2. Import your BhejDo repository"
    echo "  3. Vercel will auto-detect settings from vercel.json"
    echo "  4. Add environment variable:"
    echo "     Key: VITE_API_URL"
    echo "     Value: $BACKEND_URL"
    echo "  5. Click 'Deploy'"
    echo ""
    read -p "Press Enter when frontend is deployed..."
fi

echo ""
read -p "Enter your Vercel URL (e.g., https://bhejdo.vercel.app): " FRONTEND_URL

echo ""
print_success "Frontend URL saved: $FRONTEND_URL"

echo ""
echo "Step 3: Update CORS Configuration"
echo "─────────────────────────────────────"
echo ""

print_info "You need to add your Vercel URL to backend CORS configuration"
print_warning "Edit backend/index.js around line 31"
echo ""
echo "Add this to CORS origins array:"
echo "  '$FRONTEND_URL'"
echo ""

read -p "Have you updated CORS in backend/index.js? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Do you want to commit and push this change? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add backend/index.js
        git commit -m "chore: add $FRONTEND_URL to CORS origins"
        git push origin main
        print_success "CORS configuration updated and pushed!"
    fi
else
    print_warning "Remember to update CORS later, or frontend won't be able to call backend!"
fi

echo ""
echo "Step 4: Setup Auto-Deployment (Optional)"
echo "─────────────────────────────────────"
echo ""

read -p "Do you want to setup automatic deployment with GitHub Actions? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "You need to add 3 secrets to GitHub repository"
    echo ""
    echo "1. Get VERCEL_TOKEN:"
    echo "   → https://vercel.com/account/tokens"
    echo ""
    echo "2. Get VERCEL_PROJECT_ID:"
    echo "   → Vercel Dashboard → Your Project → Settings → General"
    echo ""
    echo "3. Get VERCEL_ORG_ID:"
    echo "   → Vercel Dashboard → Account Settings"
    echo ""
    
    print_info "Opening GitHub secrets page..."
    sleep 1
    REPO_URL=$(git config --get remote.origin.url)
    REPO_NAME=$(basename -s .git "$REPO_URL")
    REPO_OWNER=$(basename $(dirname "$REPO_URL" | sed 's/.*://'))
    GITHUB_SECRETS_URL="https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
    open "$GITHUB_SECRETS_URL" 2>/dev/null || xdg-open "$GITHUB_SECRETS_URL" 2>/dev/null || echo "Please open: $GITHUB_SECRETS_URL"
    
    echo ""
    print_info "Add these 3 secrets in GitHub:"
    echo "  • VERCEL_TOKEN"
    echo "  • VERCEL_PROJECT_ID"
    echo "  • VERCEL_ORG_ID"
    echo ""
    read -p "Press Enter when secrets are added..."
    print_success "Auto-deployment configured!"
else
    print_info "Skipping auto-deployment setup"
fi

echo ""
echo "Step 5: Setup GitHub Labels (Optional)"
echo "─────────────────────────────────────"
echo ""

read -p "Do you want to setup GitHub labels for version control? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command_exists gh; then
        print_info "Running label setup script..."
        ./scripts/setup-labels.sh
    else
        print_warning "GitHub CLI (gh) not installed"
        print_info "Install from: https://cli.github.com/"
        echo "Then run: ./scripts/setup-labels.sh"
    fi
else
    print_info "Skipping label setup"
fi

echo ""
echo "========================================"
echo "✨ Deployment Complete!"
echo "========================================"
echo ""

print_success "Your BhejDo app is now live!"
echo ""
echo "📱 URLs:"
echo "  Frontend: $FRONTEND_URL"
echo "  Backend:  $BACKEND_URL"
echo "  Health:   ${BACKEND_URL}/api/health"
echo ""

echo "📋 Next Steps:"
echo "  1. Test your app: open $FRONTEND_URL"
echo "  2. Try logging in with demo accounts (see README)"
echo "  3. Check browser console for any errors"
echo "  4. Verify API calls are working"
echo ""

echo "📚 Documentation:"
echo "  • Quick Guide:  DEPLOY_CHECKLIST.md"
echo "  • Full Guide:   docs/DEPLOYMENT.md"
echo "  • Summary:      DEPLOYMENT_SUMMARY.md"
echo ""

print_info "Need help? Check the documentation or open an issue on GitHub"
echo ""
