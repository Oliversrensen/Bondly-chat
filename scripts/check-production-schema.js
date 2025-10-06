#!/usr/bin/env node

/**
 * Check production database schema to see what fields actually exist
 */

const { PrismaClient } = require('@prisma/client');

async function checkProductionSchema() {
  console.log('🔍 Checking production database schema...');
  
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to production database');
    
    // Check what columns actually exist in the User table
    console.log('📋 Checking User table schema...');
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY column_name;
    `;
    
    console.log('Available columns in User table:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check specifically for profile picture columns
    const profileColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('profilePicture', 'profilePictureType', 'generatedAvatar', 'selectedAvatarId')
      ORDER BY column_name;
    `;
    
    console.log('\nProfile picture columns:');
    if (profileColumns.length === 0) {
      console.log('❌ No profile picture columns found!');
    } else {
      profileColumns.forEach(col => {
        console.log(`  ✅ ${col.column_name} (${col.data_type})`);
      });
    }
    
    // Check if we can query basic user data
    console.log('\nTesting basic user query...');
    const basicUser = await prisma.user.findFirst({
      select: {
        id: true,
        sillyName: true,
        name: true,
        isPro: true
      }
    });
    console.log('✅ Basic user query works');
    console.log('Sample user:', basicUser);
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionSchema();
