const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@creomotion.com' },
    update: {},
    create: {
      email: 'admin@creomotion.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Created admin:', admin.email);

  // Create editor user
  const editorPassword = await bcrypt.hash('editor123', 12);
  const editor = await prisma.user.upsert({
    where: { email: 'editor@creomotion.com' },
    update: {},
    create: {
      email: 'editor@creomotion.com',
      name: 'Editor User',
      passwordHash: editorPassword,
      role: 'EDITOR',
    },
  });
  console.log('Created editor:', editor.email);

  // Create sample client
  const client = await prisma.client.upsert({
    where: { email: 'demo@client.com' },
    update: {},
    create: {
      name: 'Demo Client',
      email: 'demo@client.com',
      company: 'Demo Company',
    },
  });
  console.log('Created client:', client.name);

  // Create sample project
  const project = await prisma.project.upsert({
    where: { id: 'demo-project-1' },
    update: {},
    create: {
      id: 'demo-project-1',
      name: 'Demo Project',
      description: 'Sample project for testing',
      status: 'IN_PROGRESS',
      budget: 10000,
      clientId: client.id,
    },
  });
  console.log('Created project:', project.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
