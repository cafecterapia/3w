/**
 * Script to create an admin user
 * Run with: npx tsx scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Admin User';

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log(`Admin user with email ${email} already exists`);

      // Use raw SQL to update role since TypeScript types aren't updated yet
      await prisma.$executeRaw`UPDATE "User" SET role = 'ADMIN' WHERE email = ${email}`;

      console.log(`Updated user role to ADMIN for ${email}`);
      return existingAdmin;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Use raw SQL to create admin user with role
    await prisma.$executeRaw`
      INSERT INTO "User" (id, email, name, password, role, "emailVerified") 
      VALUES (gen_random_uuid(), ${email}, ${name}, ${hashedPassword}, 'ADMIN', NOW())
    `;

    console.log(`✅ Admin user created successfully:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ADMIN`);
    console.log(`\n⚠️  Make sure to change the password after first login!`);

    return { email, name, role: 'ADMIN' };
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
