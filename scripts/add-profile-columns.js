#!/usr/bin/env node

/**
 * Add profile picture columns directly to production database
 * This bypasses Prisma migrations and adds the columns directly
 */

const { PrismaClient } = require('@prisma/client');

async function addProfileColumns() {
  console.log('🔧 Adding profile picture columns to production database...');
  
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to production database');
    
    // Check if columns already exist
    const existingColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('profilePicture', 'profilePictureType', 'generatedAvatar', 'selectedAvatarId');
    `;
    
    const existingColumnNames = existingColumns.map(col => col.column_name);
    console.log('Existing profile columns:', existingColumnNames);
    
    // Add missing columns
    const columnsToAdd = [
      { name: 'profilePicture', type: 'TEXT' },
      { name: 'profilePictureType', type: 'TEXT' },
      { name: 'generatedAvatar', type: 'TEXT' },
      { name: 'selectedAvatarId', type: 'TEXT' }
    ];
    
    for (const column of columnsToAdd) {
      if (!existingColumnNames.includes(column.name)) {
        console.log(`Adding column: ${column.name}`);
        await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN "${column.name}" ${column.type};`;
        console.log(`✅ Added ${column.name}`);
      } else {
        console.log(`✅ Column ${column.name} already exists`);
      }
    }
    
    // Verify columns were added
    console.log('\n🔍 Verifying columns...');
    const finalColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('profilePicture', 'profilePictureType', 'generatedAvatar', 'selectedAvatarId')
      ORDER BY column_name;
    `;
    
    console.log('Profile picture columns in database:');
    finalColumns.forEach(col => {
      console.log(`  ✅ ${col.column_name} (${col.data_type})`);
    });
    
    if (finalColumns.length === 4) {
      console.log('\n🎉 All profile picture columns added successfully!');
      console.log('Now regenerate the Prisma client and redeploy the websocket server.');
    } else {
      console.log('\n❌ Some columns are still missing');
    }
    
  } catch (error) {
    console.error('❌ Error adding columns:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addProfileColumns();
