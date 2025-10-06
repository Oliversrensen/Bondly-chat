#!/usr/bin/env node

/**
 * Debug Prisma production issues
 * This will help us understand what's happening in production
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function debugPrismaProduction() {
  console.log('🔍 Debugging Prisma production issues...');
  
  // Check environment
  console.log('📊 Environment Info:');
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('  - Working Directory:', process.cwd());
  console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  // Check schema file
  console.log('\n📄 Schema File Analysis:');
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  console.log('  - Schema Path:', schemaPath);
  console.log('  - Schema Exists:', fs.existsSync(schemaPath));
  
  if (fs.existsSync(schemaPath)) {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const lines = schemaContent.split('\n');
    
    // Find User model
    const userModelStart = lines.findIndex(line => line.trim().startsWith('model User'));
    if (userModelStart !== -1) {
      console.log('  - User model found at line:', userModelStart + 1);
      
      // Check for profile fields in User model
      const userModelLines = lines.slice(userModelStart, userModelStart + 50);
      const profileFields = ['profilePicture', 'profilePictureType', 'generatedAvatar', 'selectedAvatarId'];
      
      profileFields.forEach(field => {
        const fieldLine = userModelLines.find(line => line.includes(field));
        if (fieldLine) {
          console.log(`  - ✅ ${field}: ${fieldLine.trim()}`);
        } else {
          console.log(`  - ❌ ${field}: NOT FOUND`);
        }
      });
    } else {
      console.log('  - ❌ User model not found in schema!');
    }
  }
  
  // Test database connection and schema
  console.log('\n🗄️ Database Analysis:');
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('  - ✅ Database connection successful');
    
    // Check what columns exist in the database
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('profilePicture', 'profilePictureType', 'generatedAvatar', 'selectedAvatarId')
      ORDER BY column_name;
    `;
    
    console.log('  - Profile columns in database:', columns.length);
    columns.forEach(col => {
      console.log(`    ✅ ${col.column_name} (${col.data_type})`);
    });
    
    // Test basic query
    console.log('\n🧪 Testing Prisma Queries:');
    
    // Test 1: Basic user query
    try {
      const basicUser = await prisma.user.findFirst({
        select: { id: true, sillyName: true }
      });
      console.log('  - ✅ Basic user query works');
    } catch (error) {
      console.log('  - ❌ Basic user query failed:', error.message);
    }
    
    // Test 2: Profile fields query
    try {
      const profileUser = await prisma.user.findFirst({
        select: {
          id: true,
          profilePicture: true,
          profilePictureType: true,
          generatedAvatar: true,
          selectedAvatarId: true
        }
      });
      console.log('  - ✅ Profile fields query works');
    } catch (error) {
      console.log('  - ❌ Profile fields query failed:', error.message);
      console.log('    This is the core issue!');
    }
    
  } catch (error) {
    console.log('  - ❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
  
  // Check Prisma client version and generation
  console.log('\n🔧 Prisma Client Analysis:');
  try {
    const prisma = new PrismaClient();
    console.log('  - Client Version:', prisma._clientVersion);
    
    // Check if we can access the User model
    const userModel = prisma.user;
    console.log('  - User model accessible:', !!userModel);
    
    // Try to inspect the model structure
    if (userModel) {
      console.log('  - User model methods available:', Object.getOwnPropertyNames(userModel).slice(0, 10));
    }
    
  } catch (error) {
    console.log('  - ❌ Prisma client analysis failed:', error.message);
  }
  
  console.log('\n🎯 Summary:');
  console.log('This debug output will help identify the root cause of the Prisma issue.');
}

debugPrismaProduction();
