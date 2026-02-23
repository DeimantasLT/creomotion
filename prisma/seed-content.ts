import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding content sections...');

  const contentSections = [
    {
      key: 'hero',
      type: 'SECTION' as const,
      data: {
        title: 'Motion Design That Moves',
        subtitle: 'Premium motion graphics and AI-enhanced video production for broadcast, brands, and digital agencies.',
        ctaText: 'Start Your Project',
        ctaLink: '/contact',
        videoUrl: '/hero-reel.mp4',
      },
    },
    {
      key: 'about',
      type: 'SECTION' as const,
      data: {
        title: 'About CreoMotion',
        description: 'We are a creative studio specializing in motion graphics, animation, and AI-enhanced video production.',
        mission: 'To transform ideas into captivating visual experiences that move audiences.',
        team: [
          { name: 'Creative Director', count: 1 },
          { name: 'Motion Designers', count: 3 },
          { name: 'Video Editors', count: 2 },
          { name: 'AI Specialists', count: 2 },
        ],
      },
    },
    {
      key: 'services',
      type: 'SECTION' as const,
      data: {
        title: 'Our Services',
        items: [
          {
            title: 'Motion Graphics',
            description: 'Dynamic animations for commercials, explainers, and branded content.',
            icon: 'film',
          },
          {
            title: 'AI Video Production',
            description: 'Cutting-edge AI tools to enhance and accelerate video creation.',
            icon: 'sparkles',
          },
          {
            title: '3D Animation',
            description: 'Cinema-quality 3D visuals and character animation.',
            icon: 'box',
          },
          {
            title: 'Post-Production',
            description: 'Color grading, sound design, and VFX compositing.',
            icon: 'palette',
          },
        ],
      },
    },
    {
      key: 'contact',
      type: 'SECTION' as const,
      data: {
        title: 'Get In Touch',
        email: 'hello@creomotion.lt',
        phone: '+370 600 00000',
        address: 'Vilnius, Lithuania',
        social: {
          instagram: '@creomotion',
          linkedin: 'creomotion',
        },
      },
    },
    {
      key: 'testimonials',
      type: 'SECTION' as const,
      data: {
        title: 'CLIENTS',
        subtitle: 'Trusted by industry leaders',
        items: [
          {
            name: 'LRT',
            role: 'Broadcast Partner',
            quote: 'Exceptional motion graphics work that elevated our brand presence.',
          },
          {
            name: 'Tele2',
            role: 'Corporate Client',
            quote: 'Professional, creative, and delivered ahead of schedule.',
          },
          {
            name: 'Swedbank',
            role: 'Financial Services',
            quote: 'Outstanding animation quality and communication throughout.',
          },
        ],
      },
    },
  ];

  for (const section of contentSections) {
    await prisma.contentSection.upsert({
      where: { key: section.key },
      update: { data: section.data, type: section.type },
      create: { key: section.key, type: section.type, data: section.data },
    });
    console.log(`✅ Created/updated: ${section.key}`);
  }

  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
