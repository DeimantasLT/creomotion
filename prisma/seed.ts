const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@creomotion.lt' },
    update: {},
    create: {
      email: 'admin@creomotion.lt',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create client user
  const clientPassword = await hashPassword('client123');
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      name: 'Test Client',
      passwordHash: clientPassword,
      role: 'CLIENT',
    },
  });
  console.log('✅ Client user created:', client.email);

  // Create test client record
  const clientRecord = await prisma.client.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      name: 'Test Client',
      email: 'client@example.com',
      company: 'Test Company',
    },
  });
  console.log('✅ Client record created:', clientRecord.name);

  // Create a test project
  const existingProject = await prisma.project.findFirst({
    where: { name: 'Demo Project' }
  });
  
  if (!existingProject) {
    const project = await prisma.project.create({
      data: {
        name: 'Demo Project',
        description: 'A demo project for testing the client portal',
        status: 'IN_PROGRESS',
        clientId: clientRecord.id,
      },
    });
    console.log('✅ Project created:', project.name);
  } else {
    console.log('ℹ️ Project already exists');
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📧 Login credentials:');
  console.log('   Admin:   admin@creomotion.lt / admin123');
  console.log('   Client:  client@example.com / client123');
  console.log('\n🔗 URLs:');
  console.log('   Admin:   http://localhost:3000/login');
  console.log('   Client:  http://localhost:3000/portal/login');
}

main()
  .catch((e: any) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
