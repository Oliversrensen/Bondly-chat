#!/usr/bin/env node

/**
 * Diagnostic script to check websocket server database connection and schema
 */

const { PrismaClient } = require('@prisma/client');

async function diagnoseWebsocket() {
  console.log('🔍 Diagnosing websocket server database connection...');
  
  const prisma = new PrismaClient();
  
  try {
    // Test basic connection
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if we can query basic user fields
    console.log('👤 Testing basic user query...');
    const basicUser = await prisma.user.findFirst({
      select: {
        id: true,
        sillyName: true,
        name: true,
        isPro: true
      }
    });
    console.log('✅ Basic user query successful:', basicUser ? 'User found' : 'No users found');
    
    // Test if profile picture fields exist
    console.log('🖼️ Testing profile picture fields...');
    try {
      const userWithProfile = await prisma.user.findFirst({
        select: {
          id: true,
          sillyName: true,
          profilePicture: true,
          profilePictureType: true,
          generatedAvatar: true,
          selectedAvatarId: true
        }
      });
      console.log('✅ Profile picture fields accessible');
      console.log('Sample data:', userWithProfile);
    } catch (error) {
      console.log('❌ Profile picture fields NOT accessible');
      console.log('Error:', error.message);
      
      // Check what fields are actually available
      console.log('🔍 Checking available fields...');
      try {
        const allFields = await prisma.user.findFirst({
          select: {
            id: true,
            email: true,
            name: true,
            sillyName: true,
            isPro: true,
            gender: true,
            createdAt: true,
            updatedAt: true
          }
        });
        console.log('Available fields work:', allFields ? 'Yes' : 'No');
      } catch (e) {
        console.log('Even basic fields failed:', e.message);
      }
    }
    
    // Check database schema directly
    console.log('🗄️ Checking database schema...');
    try {
      const result = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name IN ('profilePicture', 'profilePictureType', 'generatedAvatar', 'selectedAvatarId')
        ORDER BY column_name;
      `;
      console.log('Profile picture columns in database:', result);
    } catch (error) {
      console.log('❌ Could not query schema directly:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseWebsocket();
