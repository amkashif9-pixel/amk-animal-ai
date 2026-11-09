const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const targetDist = path.resolve(__dirname, 'dist');
const sourceDist = path.resolve(rootDir, 'dist');

console.log('[AMK Animal AI Bridge] Starting bridge build for Vercel...');
console.log('[AMK Animal AI Bridge] Root directory:', rootDir);

// Ensure root dependencies are installed
if (!fs.existsSync(path.resolve(rootDir, 'node_modules', 'vite'))) {
  console.log('[AMK Animal AI Bridge] Installing root dependencies...');
  try {
    execSync('npm install --include=dev', {
      cwd: rootDir,
      stdio: 'inherit'
    });
  } catch (err) {
    console.error('[AMK Animal AI Bridge] Dependency installation failed:', err.message);
    process.exit(1);
  }
}

// Run production build in root
try {
  console.log('[AMK Animal AI Bridge] Executing build in root...');
  execSync('npm run build', {
    cwd: rootDir,
    stdio: 'inherit',
    env: { ...process.env, VERCEL: '1' }
  });
} catch (err) {
  console.error('[AMK Animal AI Bridge] Build failed in root directory:', err.message);
  process.exit(1);
}

// Ensure target dist exists and copy artifacts
console.log('[AMK Animal AI Bridge] Copying build artifacts from', sourceDist, 'to', targetDist);
if (fs.existsSync(targetDist)) {
  fs.rmSync(targetDist, { recursive: true, force: true });
}
fs.cpSync(sourceDist, targetDist, { recursive: true });

console.log('[AMK Animal AI Bridge] Build bridge complete! Output ready at:', targetDist);
