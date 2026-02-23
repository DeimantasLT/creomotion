import { PrismaClient, ContentType } from '@prisma/client';

const prisma = new PrismaClient();

const cmsData = [
  {
    key: 'hero',
    type: ContentType.SECTION,
    data: {
      year: 'EST. 2008 — 16 YEARS',
      headline1: 'CREO',
      headline2: 'MOTION',
      tagline: ['BROADCAST TV', 'AI VIDEO', 'MOTION DESIGN'],
      description: 'Creating memorable visual experiences for TV and digital brands. From Lithuanian broadcast to AI-powered content.',
      stats: [
        { num: '200+', label: 'Projects' },
        { num: '16', label: 'Years' },
        { num: '24h', label: 'Delivery' }
      ]
    }
  },
  {
    key: 'about',
    type: ContentType.SECTION,
    data: {
      pretitle: 'ABOUT',
      title1: 'From TV studios',
      title2: 'to AI power',
      description: '16 years crafting motion graphics for Lithuania\'s biggest TV channels. Now embracing AI to push creative boundaries further.',
      timeline: [
        { year: '2008', label: 'Started' },
        { year: '2012', label: 'Evolution' },
        { year: '2016', label: 'Growth' },
        { year: '2020', label: 'Expansion' },
        { year: '2024', label: 'AI Era' }
      ]
    }
  },
  {
    key: 'services',
    type: ContentType.ARRAY,
    data: [
      {
        num: '01',
        title: 'Motion Graphics',
        shortDesc: 'Broadcast-ready animations',
        fullDesc: 'From title sequences to full channel branding. We create motion that captures attention and tells your story.'
      },
      {
        num: '02',
        title: 'AI Video',
        shortDesc: 'Generative content creation',
        fullDesc: 'Leveraging latest AI tools for face swap, voice synthesis, and generative content. Fast turnaround without compromising quality.'
      },
      {
        num: '03',
        title: 'Post-Production',
        shortDesc: 'Color & finishing',
        fullDesc: 'Professional color grading, VFX integration, sound design, and final delivery in any broadcast format.'
      },
      {
        num: '04',
        title: 'Brand Identity',
        shortDesc: 'Visual systems',
        fullDesc: 'Logo animations, complete visual identity systems, brand guidelines, and reusable motion templates.'
      }
    ]
  },
  {
    key: 'contact',
    type: ContentType.SECTION,
    data: {
      pretitle: "LET'S CONNECT",
      title1: 'Start your',
      title2: 'next project',
      description: 'Ready to bring your vision to life? Let\'s create something extraordinary together.',
      cta: 'Get in Touch',
      email: 'hello@creomotion.lt'
    }
  },
  {
    key: 'projects',
    type: ContentType.ARRAY,
    data: [
      { client: 'LRT', title: 'News Rebrand', year: '2024', category: 'Broadcast' },
      { client: 'TV3', title: 'Primetime', year: '2023', category: 'TV' },
      { client: 'LNK', title: 'Show Package', year: '2022', category: 'Broadcast' },
      { client: 'DELFI', title: 'Digital Campaign', year: '2023', category: 'Digital' },
      { client: 'PUMA', title: 'Launch Video', year: '2024', category: 'Commercial' },
      { client: '15min', title: 'Social Content', year: '2023', category: 'Social' }
    ]
  },
  {
    key: 'testimonials',
    type: ContentType.ARRAY,
    data: [
      {
        name: 'Justas K.',
        company: 'TV3 Lithuania',
        role: 'Creative Director',
        quote: 'The combination of AI tools and creative expertise delivered our broadcast package in half the expected time.',
        tier: 'GOLD'
      },
      {
        name: 'Laura M.',
        company: 'LNK TV',
        role: 'Head of Production',
        quote: 'Finally, a motion designer who understands both broadcast standards and modern AI workflows.',
        tier: 'SILVER'
      },
      {
        name: 'Tomas B.',
        company: 'PC Lietuva',
        role: 'Marketing Manager',
        quote: 'CreoMotion transformed our brand guidelines into a living, breathing motion system.',
        tier: 'BRONZE'
      }
    ]
  }
];

// Seed function
async function seedCMS() {
  console.log('Seeding CMS content...');
  
  for (const item of cmsData) {
    await prisma.contentSection.upsert({
      where: { key: item.key },
      update: { 
        type: item.type,
        data: item.data 
      },
      create: {
        key: item.key,
        type: item.type,
        data: item.data
      }
    });
    console.log(`✓ Seeded: ${item.key}`);
  }
  
  console.log('\n✅ CMS data seeded successfully!');
}

// Execute seed
seedCMS()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding CMS:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
