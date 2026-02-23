/**
 * Deploy script - Usage
 * 
 * Local Docker:
 *   npm run deploy:docker
 * 
 * Vercel:
 *   npm run deploy:vercel
 * 
 * Standalone (Node.js):
 *   npm run deploy:standalone
 */

const { execSync } = require('child_process');

function run(command, label) {
  console.log(`\n🚀 ${label}`);
  console.log(`Running: ${command}\n`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${label} complete`);
  } catch (error) {
    console.error(`❌ ${label} failed`);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const target = args[0] || 'docker';

switch (target) {
  case 'docker':
    run('docker build -f Dockerfile.prod -t creomotion:latest .', 'Building Docker image');
    break;
    
  case 'vercel':
    run('npx vercel --prod', 'Deploying to Vercel');
    break;
    
  case 'standalone':
    run('npm run build', 'Building for standalone');
    console.log('\n📦 Output in .next/standalone/');
    console.log('Run: node .next/standalone/server.js');
    break;
    
  default:
    console.log('Usage: node deploy.js [docker|vercel|standalone]');
    process.exit(1);
}
