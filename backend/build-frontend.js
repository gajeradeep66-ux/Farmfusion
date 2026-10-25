import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- Starting FarmFusion Frontend Build ---');
const frontendDir = path.resolve(__dirname, '../frontend');
const distDir = path.resolve(frontendDir, 'dist');
const publicDir = path.resolve(__dirname, 'public');

try {
  console.log(`Installing frontend dependencies in: ${frontendDir}`);
  execSync('npm install --include=dev', {
    cwd: frontendDir,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
  });

  console.log(`Compiling Vite frontend...`);
  execSync('npm run build', {
    cwd: frontendDir,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  });

  if (fs.existsSync(distDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
    fs.mkdirSync(publicDir, { recursive: true });
    fs.cpSync(distDir, publicDir, { recursive: true });
    console.log('✓ Frontend compiled and copied to backend/public successfully.');
  }
} catch (error) {
  console.warn('Frontend compilation encountered an error:', error.message);
  if (fs.existsSync(path.join(publicDir, 'index.html'))) {
    console.log('✓ Pre-existing frontend build found in backend/public, proceeding with deployment.');
  } else {
    console.error('Fatal: No frontend build available.');
    process.exit(1);
  }
}
