#!/usr/bin/env node

/**
 * Deployment verification script
 * Ensures the websocket server can access all required database fields
 */

const { PrismaClient } = require('@prisma/client');

async function verifyDeployment() {
  console.log('🔍 Verifying websocket server deployment...');
  
  const prisma = new PrismaClient();
  
  try {
    // Test basic connection
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test basic user query
    console.log('👤 Testing basic user query...');
    const basicUser = await prisma.user.findFirst({
      select: {
        id: true,
        sillyName: true,
        name: true,
        isPro: true
      }
    });
    console.log('✅ Basic user query successful');
    
    // Test profile picture fields
    console.log('🖼️ Testing profile picture fields...');
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
    console.log('Sample user data:', userWithProfile);
    
    // Test the exact query used in websocket server
    console.log('🔌 Testing websocket server query...');
    const wsQuery = await prisma.user.findFirst({
      where: { id: 'test' },
      select: { 
        sillyName: true, 
        name: true, 
        isPro: true,
        profilePicture: true,
        profilePictureType: true,
        generatedAvatar: true,
        selectedAvatarId: true
      },
    });
    console.log('✅ Websocket server query successful');
    
    console.log('\n🎉 Deployment verification PASSED!');
    console.log('The websocket server should work correctly with profile pictures.');
    
  } catch (error) {
    console.error('\n❌ Deployment verification FAILED!');
    console.error('Error:', error.message);
    
    if (error.message.includes('Unknown field')) {
      console.log('\n🔧 Fix required:');
      console.log('1. The Prisma client is outdated');
      console.log('2. Run: npx prisma generate');
      console.log('3. Redeploy the websocket server');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDeployment();
