#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(' Starting Eventix Full Stack Demo...\n');

// Start minting service
console.log('🏭 Starting minting service on port 3002...');
const mintingService = spawn('node', ['minting-service/minting-server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// Wait a bit then start backend
setTimeout(() => {
  console.log(' Starting backend server on port 3001...');
  const backend = spawn('node', ['backend/server.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });
}, 2000);

// Wait a bit more then start frontend server
setTimeout(() => {
  console.log(' Starting frontend server on port 8080...');
  const frontend = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'eventix'),
    stdio: 'inherit'
  });
}, 4000);

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down all services...');
  mintingService.kill();
  process.exit(0);
});

console.log('\n Services starting up:');
console.log('   Minting Service: http://localhost:3002');
console.log('   Backend API: http://localhost:3001');
console.log('   Frontend: http://localhost:8080');
console.log('\n Please wait for all services to start...');
console.log(' Open http://localhost:8080 in your browser when ready!');
console.log('\n All logs will appear below:');
console.log('=' .repeat(60));