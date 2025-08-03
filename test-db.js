const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Test user query
    console.log('🔍 Testing user findUnique query...');
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });
    console.log('✅ User query successful:', user);

    // Test user creation
    console.log('🔍 Testing user creation...');
    const newUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test-' + Date.now() + '@example.com',
        password: 'hashedpassword',
      },
    });
    console.log('✅ User creation successful:', newUser);

    // Clean up
    await prisma.user.delete({
      where: { id: newUser.id },
    });
    console.log('✅ Test user deleted');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected');
  }
}

testDatabase();
