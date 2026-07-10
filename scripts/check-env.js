const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const FRONTEND = path.join(ROOT, 'frontend');

function checkNodeVersion() {
  const version = process.versions.node;
  const major = parseInt(version.split('.')[0]);
  if (major < 18) {
    console.error(`\n❌ Node.js >= 18 required. You have v${version}`);
    console.error('   Install from: https://nodejs.org/\n');
    process.exit(1);
  }
  console.log(`✓ Node.js v${version}`);
}

function checkNpmVersion() {
  try {
    const version = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✓ npm v${version}`);
  } catch {
    console.error('\n❌ npm not found. Install Node.js from https://nodejs.org/\n');
    process.exit(1);
  }
}

function ensureDepsInstalled(dir, name) {
  const nodeModules = path.join(dir, 'node_modules');
  if (!fs.existsSync(nodeModules)) {
    console.log(`⏳ Installing ${name} dependencies...`);
    try {
      execSync('npm install', { cwd: dir, stdio: 'inherit' });
      console.log(`✓ ${name} dependencies installed`);
    } catch (e) {
      console.error(`\n❌ Failed to install ${name} dependencies`);
      console.error(`   Try manually: cd ${dir} && npm install\n`);
      process.exit(1);
    }
  } else {
    console.log(`✓ ${name} dependencies ready`);
  }
}

console.log('\n🔍 BhejDo - Checking environment...\n');

checkNodeVersion();
checkNpmVersion();
ensureDepsInstalled(BACKEND, 'Backend');
ensureDepsInstalled(FRONTEND, 'Frontend');

console.log('\n✅ All good! Starting BhejDo...\n');
console.log('   Frontend → http://localhost:5173');
console.log('   Backend  → http://localhost:3001');
console.log('');
