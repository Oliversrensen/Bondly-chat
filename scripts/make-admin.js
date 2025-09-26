const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeAdmin(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, isAdmin: true }
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    if (user.isAdmin) {
      console.log(`✅ User ${user.name} (${user.email}) is already an admin`);
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isAdmin: true }
    });

    console.log(`🎉 Successfully made ${user.name} (${user.email}) an admin!`);
  } catch (error) {
    console.error('❌ Error making user admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/make-admin.js <email>');
  console.log('Example: node scripts/make-admin.js your-email@gmail.com');
  process.exit(1);
}

makeAdmin(email);
