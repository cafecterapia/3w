import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

// Test type resolution
async function testUserType() {
  const user: User = (await prisma.user.findFirst()) as User;

  // This should work without TypeScript errors
  console.log(user.paymentCreatedAt);

  // Test assignment
  const paymentDate: Date | null = user.paymentCreatedAt;

  return user;
}

export default testUserType;
