#!/usr/bin/env node

/**
 * Fix production database by adding missing profile picture columns
 * This script will safely add the columns if they don't exist
 */

const { PrismaClient } = require('@prisma/client');

async function fixProductionDatabase() {
  console.log('🔧 Fixing production database...');
  
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to production database');
    
    // Check what columns actually exist
    console.log('📋 Checking existing columns...');
    const existingColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('profilePicture', 'profilePictureType', 'generatedAvatar', 'selectedAvatarId')
      ORDER BY column_name;
    `;
    
    console.log('Existing profile columns:', existingColumns);
    
    const existingColumnNames = existingColumns.map(col => col.column_name);
    const requiredColumns = ['profilePicture', 'profilePictureType', 'generatedAvatar', 'selectedAvatarId'];
    const missingColumns = requiredColumns.filter(col => !existingColumnNames.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✅ All profile columns already exist');
    } else {
      console.log('❌ Missing columns:', missingColumns);
      
      // Add missing columns
      for (const columnName of missingColumns) {
        console.log(`Adding column: ${columnName}`);
        try {
          await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN "${columnName}" TEXT;`;
          console.log(`✅ Added ${columnName}`);
        } catch (error) {
          console.log(`❌ Failed to add ${columnName}:`, error.message);
        }
      }
    }
    
    // Verify all columns exist now
    console.log('\n🔍 Verifying all columns exist...');
    const finalColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('profilePicture', 'profilePictureType', 'generatedAvatar', 'selectedAvatarId')
      ORDER BY column_name;
    `;
    
    console.log('Final profile columns:');
    finalColumns.forEach(col => {
      console.log(`  ✅ ${col.column_name} (${col.data_type})`);
    });
    
    if (finalColumns.length === 4) {
      console.log('\n🎉 All profile columns are now present!');
      
      // Also check the Prisma schema file
      console.log('\n📄 Checking Prisma schema file...');
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
      
      if (fs.existsSync(schemaPath)) {
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');
        const hasProfileFields = schemaContent.includes('profilePicture') && 
                               schemaContent.includes('profilePictureType') &&
                               schemaContent.includes('generatedAvatar') &&
                               schemaContent.includes('selectedAvatarId');
        console.log('Schema file contains profile fields:', hasProfileFields);
        
        if (hasProfileFields) {
          console.log('✅ Database and schema are both correct!');
          console.log('The issue might be with Prisma client generation or caching.');
        } else {
          console.log('❌ Schema file is missing profile fields!');
        }
      } else {
        console.log('❌ Schema file not found!');
      }
      
      console.log('Now regenerate the Prisma client and restart the server.');
    } else {
      console.log('\n❌ Still missing some columns');
    }
    
  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionDatabase();
