#!/usr/bin/env node

/**
 * Force production database migrations to run
 * This ensures all migrations are applied to the production database
 */

const { execSync } = require('child_process');

async function forceMigrateProduction() {
  console.log('🔄 Forcing production database migrations...');
  
  try {
    // First, check current migration status
    console.log('📊 Checking current migration status...');
    try {
      execSync('npx prisma migrate status', { stdio: 'inherit' });
    } catch (error) {
      console.log('Migration status check failed, continuing...');
    }
    
    // Force deploy all migrations
    console.log('🚀 Deploying all migrations to production...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Regenerate Prisma client
    console.log('🔧 Regenerating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Verify the schema
    console.log('✅ Verifying schema...');
    execSync('node scripts/check-production-schema.js', { stdio: 'inherit' });
    
    console.log('\n🎉 Production migration completed!');
    console.log('The websocket server should now work correctly.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

forceMigrateProduction();

