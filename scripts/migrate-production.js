const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runMigrations() {
  try {
    console.log('🔄 Running production migrations...');
    
    // Check if profilePicture column exists
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name = 'profilePicture'
    `;
    
    if (result.length === 0) {
      console.log('📝 Adding profile picture columns...');
      
      // Add profile picture columns
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD COLUMN "profilePicture" TEXT,
        ADD COLUMN "profilePictureType" TEXT,
        ADD COLUMN "generatedAvatar" TEXT,
        ADD COLUMN "selectedAvatarId" TEXT
      `;
      
      console.log('✅ Profile picture columns added successfully!');
    } else {
      console.log('✅ Profile picture columns already exist');
    }
    
    console.log('🎉 Production migrations completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigrations();
