#!/bin/bash
set -e

echo "Building frontend..."
cd frontend
npm ci
npm run build
cd ..

echo "Creating Vercel output structure..."
mkdir -p .vercel/output/static
cp -r frontend/dist/* .vercel/output/static/

echo "Creating config.json..."
cat > .vercel/output/config.json << 'EOF'
{
  "version": 3,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOF

echo "Build complete! Output in .vercel/output/static"
ls -la .vercel/output/static/
