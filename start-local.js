import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Eventix Local Development...\n');

// Start minting service
const mintingService = spawn('node', ['minting-server.js'], {
  cwd: path.join(__dirname, 'minting-service'),
  stdio: 'inherit'
});

// Start backend server
const backendServer = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

// Start frontend server
const frontendServer = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'eventix'),
  stdio: 'inherit'
});

console.log('✅ Minting Service: http://localhost:3002');
console.log('✅ Backend API: http://localhost:3001');
console.log('✅ Frontend: http://localhost:8080\n');

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down services...');
  mintingService.kill();
  backendServer.kill();
  frontendServer.kill();
  process.exit();
});