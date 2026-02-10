import { PrismaClient, UserRole, ProjectStatus, DeliverableStatus, InvoiceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@creomotion.com' },
    update: {},
    create: {
      email: 'admin@creomotion.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });
  console.log('👤 Created admin user:', admin.email);

  // Create editor user
  const editorPassword = await bcrypt.hash('editor123', 12);
  const editor = await prisma.user.upsert({
    where: { email: 'editor@creomotion.com' },
    update: {},
    create: {
      email: 'editor@creomotion.com',
      name: 'Editor User',
      passwordHash: editorPassword,
      role: UserRole.EDITOR,
    },
  });
  console.log('👤 Created editor user:', editor.email);

  // Create sample clients
  const client1 = await prisma.client.upsert({
    where: { email: 'client1@example.com' },
    update: {},
    create: {
      email: 'client1@example.com',
      name: 'John Smith',
      company: 'Acme Corporation',
      phone: '+1 555-0001',
    },
  });
  console.log('👤 Created client:', client1.name);

  const client2 = await prisma.client.upsert({
    where: { email: 'client2@example.com' },
    update: {},
    create: {
      email: 'client2@example.com',
      name: 'Sarah Johnson',
      company: 'Tech Startup Inc',
      phone: '+1 555-0002',
    },
  });
  console.log('👤 Created client:', client2.name);

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Brand Video - Product Launch',
      description: 'A dynamic product launch video featuring motion graphics and live action footage',
      status: ProjectStatus.IN_PROGRESS,
      deadline: new Date('2024-04-15'),
      clientId: client1.id,
    },
  });
  console.log('📁 Created project:', project1.name);

  const project2 = await prisma.project.create({
    data: {
      name: 'Corporate Showcase',
      description: 'Corporate identity video for annual shareholder meeting',
      status: ProjectStatus.DRAFT,
      deadline: new Date('2024-05-20'),
      clientId: client2.id,
    },
  });
  console.log('📁 Created project:', project2.name);

  const project3 = await prisma.project.create({
    data: {
      name: 'Social Media Campaign',
      description: 'Series of short-form videos for Instagram and TikTok',
      status: ProjectStatus.COMPLETED,
      deadline: new Date('2024-02-28'),
      clientId: client1.id,
    },
  });
  console.log('📁 Created project:', project3.name);

  // Create sample deliverables
  const deliverable1 = await prisma.deliverable.create({
    data: {
      name: 'Storyboard.pdf',
      description: 'Initial storyboard sketches and frame references',
      status: DeliverableStatus.APPROVED,
      version: 3,
      projectId: project1.id,
    },
  });
  console.log('📄 Created deliverable:', deliverable1.name);

  const deliverable2 = await prisma.deliverable.create({
    data: {
      name: 'Rough_Cut_v1.mp4',
      description: 'First rough cut with placeholder graphics',
      status: DeliverableStatus.IN_REVIEW,
      version: 1,
      projectId: project1.id,
    },
  });
  console.log('📄 Created deliverable:', deliverable2.name);

  const deliverable3 = await prisma.deliverable.create({
    data: {
      name: 'Final_Deliver_30s.mp4',
      description: 'Final 30-second version with color grading',
      status: DeliverableStatus.APPROVED,
      version: 2,
      projectId: project3.id,
    },
  });
  console.log('📄 Created deliverable:', deliverable3.name);

  // Create sample time entries
  const timeEntry1 = await prisma.timeEntry.create({
    data: {
      description: 'Initial client consultation and brief review',
      duration: 150, // in minutes
      date: new Date('2024-03-01'),
      billable: true,
      projectId: project1.id,
      userId: editor.id,
    },
  });
  console.log('⏱️ Created time entry:', timeEntry1.description);

  const timeEntry2 = await prisma.timeEntry.create({
    data: {
      description: 'Motion graphics work - logo animation',
      duration: 240,
      date: new Date('2024-03-02'),
      billable: true,
      projectId: project1.id,
      userId: editor.id,
    },
  });
  console.log('⏱️ Created time entry:', timeEntry2.description);

  const timeEntry3 = await prisma.timeEntry.create({
    data: {
      description: 'Social media strategy planning',
      duration: 120,
      date: new Date('2024-02-15'),
      billable: false,
      projectId: project3.id,
      userId: admin.id,
    },
  });
  console.log('⏱️ Created time entry:', timeEntry3.description);

  // Create sample invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      amount: 12500.00,
      status: InvoiceStatus.PAID,
      projectId: project1.id,
      clientId: client1.id,
    },
  });
  console.log('💰 Created invoice:', invoice1.id);

  const invoice2 = await prisma.invoice.create({
    data: {
      amount: 8500.00,
      status: InvoiceStatus.SENT,
      projectId: project1.id,
      clientId: client1.id,
    },
  });
  console.log('💰 Created invoice:', invoice2.id);

  const invoice3 = await prisma.invoice.create({
    data: {
      amount: 6000.00,
      status: InvoiceStatus.SENT,
      projectId: project3.id,
      clientId: client1.id,
    },
  });
  console.log('💰 Created invoice:', invoice3.id);

  console.log('\n✅ Database seed completed!');
  console.log('\nLogin credentials:');
  console.log('  Admin: admin@creomotion.com / admin123');
  console.log('  Editor: editor@creomotion.com / editor123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
