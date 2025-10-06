#!/usr/bin/env node

/**
 * Script to help deploy the websocket server with updated Prisma client
 * This ensures the websocket server has the latest database schema
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing websocket server deployment...');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Deploy migrations
  console.log('🗄️ Deploying database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('✅ Prisma client generated and migrations deployed');
  console.log('📋 Next steps:');
  console.log('   1. Commit and push your changes to GitHub');
  console.log('   2. Redeploy your websocket server on Render/Railway');
  console.log('   3. The websocket server will now have access to profile picture fields');
  
} catch (error) {
  console.error('❌ Error preparing deployment:', error.message);
  process.exit(1);
}
