#!/usr/bin/env node

/**
 * Force database schema to match Prisma schema
 * This will ensure the database has all the fields defined in the schema
 */

const { PrismaClient } = require('@prisma/client');

async function forceSchemaSync() {
  console.log('🔄 Forcing database schema to match Prisma schema...');
  
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to production database');
    
    // Check current database schema
    console.log('📋 Checking current database schema...');
    const currentColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY column_name;
    `;
    
    console.log('Current User table columns:');
    currentColumns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check if profile fields exist
    const profileFields = ['profilePicture', 'profilePictureType', 'generatedAvatar', 'selectedAvatarId'];
    const existingProfileFields = currentColumns.filter(col => profileFields.includes(col.column_name));
    
    console.log(`\nProfile fields in database: ${existingProfileFields.length}/4`);
    existingProfileFields.forEach(col => {
      console.log(`  ✅ ${col.column_name} (${col.data_type})`);
    });
    
    const missingFields = profileFields.filter(field => 
      !existingProfileFields.some(col => col.column_name === field)
    );
    
    if (missingFields.length > 0) {
      console.log(`\n❌ Missing fields: ${missingFields.join(', ')}`);
      
      // Add missing fields
      for (const field of missingFields) {
        console.log(`Adding field: ${field}`);
        try {
          await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN "${field}" TEXT;`;
          console.log(`✅ Added ${field}`);
        } catch (error) {
          console.log(`❌ Failed to add ${field}:`, error.message);
        }
      }
    } else {
      console.log('\n✅ All profile fields exist in database');
    }
    
    // Force Prisma to regenerate the client
    console.log('\n🔧 Regenerating Prisma client...');
    const { execSync } = require('child_process');
    
    try {
      // Clear Prisma cache (cross-platform)
      const fs = require('fs');
      const path = require('path');
      
      const prismaCachePath = path.join(process.cwd(), 'node_modules', '.prisma');
      const prismaClientPath = path.join(process.cwd(), 'node_modules', '@prisma');
      
      if (fs.existsSync(prismaCachePath)) {
        fs.rmSync(prismaCachePath, { recursive: true, force: true });
        console.log('✅ Cleared .prisma cache');
      }
      
      if (fs.existsSync(prismaClientPath)) {
        fs.rmSync(prismaClientPath, { recursive: true, force: true });
        console.log('✅ Cleared @prisma cache');
      }
      
      // Regenerate client
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma client regenerated');
      
      // Test the new client
      console.log('\n🧪 Testing new Prisma client...');
      const { PrismaClient: NewPrismaClient } = require('@prisma/client');
      const newPrisma = new NewPrismaClient();
      
      try {
        const testUser = await newPrisma.user.findFirst({
          select: {
            id: true,
            profilePicture: true,
            profilePictureType: true,
            generatedAvatar: true,
            selectedAvatarId: true
          }
        });
        console.log('✅ New Prisma client works with profile fields!');
        console.log('Sample user data:', testUser);
        await newPrisma.$disconnect();
      } catch (testError) {
        console.log('❌ New Prisma client still has issues:', testError.message);
      }
      
    } catch (execError) {
      console.log('❌ Failed to regenerate Prisma client:', execError.message);
    }
    
  } catch (error) {
    console.error('❌ Error syncing schema:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

forceSchemaSync();
