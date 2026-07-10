#!/bin/bash
set -e

echo ""
echo "=========================================="
echo "  BhejDo - Logistics Marketplace"
echo "=========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found!"
    echo ""
    echo "Install Node.js (v18+) from one of:"
    echo "  • https://nodejs.org/ (official installer)"
    echo "  • brew install node (macOS)"
    echo "  • nvm install 18 (using nvm)"
    echo "  • sudo apt install nodejs npm (Ubuntu/Debian)"
    echo "  • sudo dnf install nodejs npm (Fedora)"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js v18+ required. You have $(node -v)"
    echo "   Update: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"
echo "✓ npm $(npm -v) detected"
echo ""

# Install root deps (concurrently)
if [ ! -d "node_modules" ]; then
    echo "⏳ Installing root dependencies..."
    npm install
fi

# Install backend deps
if [ ! -d "backend/node_modules" ]; then
    echo "⏳ Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Install frontend deps
if [ ! -d "frontend/node_modules" ]; then
    echo "⏳ Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "Starting servers..."
echo "  Frontend → http://localhost:5173"
echo "  Backend  → http://localhost:3001"
echo ""
echo "Demo logins:"
echo "  sender@bhejdo.com / password123"
echo "  traveler@bhejdo.com / password123"
echo "  agent@bhejdo.com / password123"
echo "  admin@bhejdo.com / password123"
echo ""
echo "=========================================="
echo ""

npm start
