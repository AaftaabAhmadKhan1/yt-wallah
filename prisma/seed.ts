import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Seed site settings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'YT Wallah',
      siteTagline: 'Distraction-Free Learning from Physics Wallah',
      siteDescription: 'Access all Physics Wallah YouTube content in one place — no distractions, just pure learning.',
      logoUrl: '',
      primaryColor: '#7c3aed',
      accentColor: '#ec4899',
      footerText: '© 2026 YT Wallah. Built with ❤️ for students.',
      socialLinks: JSON.stringify({
        youtube: 'https://youtube.com/@PhysicsWallah',
        telegram: 'https://t.me/physicswallah',
        instagram: 'https://instagram.com/physicswallah',
        twitter: 'https://twitter.com/PhysicsWallah',
      }),
      maintenanceMode: false,
      welcomeMessage: 'Welcome to YT Wallah — Your one-stop destination for Physics Wallah content!',
      youtubeApiKey: '',
    },
  });

  // Seed channels
  const ch1 = await prisma.channel.upsert({
    where: { id: 'ch-001' },
    update: {},
    create: {
      id: 'ch-001',
      name: 'Physics Wallah',
      youtubeChannelId: 'UCiGyWN6DEbnj2alu7iapuKQ',
      description: 'The main Physics Wallah channel with complete lectures for JEE & NEET preparation.',
      thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_nM5NRWU9rPJ0JRO4L6ixGWQDwXhDBdJNOQmTOVYkfnMA=s176-c-k-c0x00ffffff-no-rj',
      bannerUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_nM5NRWU9rPJ0JRO4L6ixGWQDwXhDBdJNOQmTOVYkfnMA=s176-c-k-c0x00ffffff-no-rj',
      subscriberCount: '25M+',
      videoCount: '5000+',
      isActive: true,
    },
  });

  const ch2 = await prisma.channel.upsert({
    where: { id: 'ch-002' },
    update: {},
    create: {
      id: 'ch-002',
      name: 'PW Foundation',
      youtubeChannelId: 'UCA2DIfbuZVsMWrRtgG9N4mw',
      description: 'Foundation courses for Class 9-10 students covering all subjects.',
      thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_nM5NRWU9rPJ0JRO4L6ixGWQDwXhDBdJNOQmTOVYkfnMA=s176-c-k-c0x00ffffff-no-rj',
      bannerUrl: '',
      subscriberCount: '5M+',
      videoCount: '2000+',
      isActive: true,
    },
  });

  // Seed batches
  const batch1 = await prisma.batch.upsert({
    where: { id: 'batch-001' },
    update: {},
    create: {
      id: 'batch-001',
      name: 'Lakshya JEE 2026',
      channelId: ch1.id,
      description: 'Complete JEE 2026 preparation batch with all subjects covered.',
      subjects: JSON.stringify(['Physics', 'Chemistry', 'Mathematics']),
      isActive: true,
    },
  });

  await prisma.batch.upsert({
    where: { id: 'batch-002' },
    update: {},
    create: {
      id: 'batch-002',
      name: 'Yakeen NEET 2026',
      channelId: ch1.id,
      description: 'Full NEET 2026 preparation batch with Biology, Physics, and Chemistry.',
      subjects: JSON.stringify(['Physics', 'Chemistry', 'Biology']),
      isActive: true,
    },
  });

  await prisma.batch.upsert({
    where: { id: 'batch-003' },
    update: {},
    create: {
      id: 'batch-003',
      name: 'Arjuna JEE 2027',
      channelId: ch1.id,
      description: 'Early start JEE 2027 preparation for Class 11 students.',
      subjects: JSON.stringify(['Physics', 'Chemistry', 'Mathematics']),
      isActive: true,
    },
  });

  // Seed videos
  await prisma.video.upsert({
    where: { id: 'vid-001' },
    update: {},
    create: {
      id: 'vid-001',
      title: 'Complete Physics Revision | JEE 2026',
      youtubeVideoId: 'dQw4w9WgXcQ',
      channelId: ch1.id,
      batchId: batch1.id,
      subject: 'Physics',
      description: 'Complete revision of all physics topics for JEE 2026.',
      duration: '3:24:15',
      type: 'video',
      isLive: false,
    },
  });

  await prisma.video.upsert({
    where: { id: 'vid-002' },
    update: {},
    create: {
      id: 'vid-002',
      title: 'Organic Chemistry Marathon | NEET 2026',
      youtubeVideoId: 'dQw4w9WgXcQ',
      channelId: ch1.id,
      batchId: 'batch-002',
      subject: 'Chemistry',
      description: 'Complete organic chemistry marathon for NEET preparation.',
      duration: '5:12:30',
      type: 'video',
      isLive: false,
    },
  });

  // Seed announcements
  await prisma.announcement.upsert({
    where: { id: 'ann-001' },
    update: {},
    create: {
      id: 'ann-001',
      title: 'Welcome to YT Wallah!',
      content: 'We are excited to launch YT Wallah — your distraction-free platform for Physics Wallah content. Enjoy learning!',
      type: 'global',
      priority: 'high',
      isActive: true,
    },
  });

  await prisma.announcement.upsert({
    where: { id: 'ann-002' },
    update: {},
    create: {
      id: 'ann-002',
      title: 'Lakshya JEE 2026 - New Schedule Released',
      content: 'The new lecture schedule for Lakshya JEE 2026 batch has been released. Check the batch page for details.',
      type: 'batch',
      batchId: batch1.id,
      priority: 'medium',
      isActive: true,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`   - ${(await prisma.channel.count())} channels`);
  console.log(`   - ${(await prisma.batch.count())} batches`);
  console.log(`   - ${(await prisma.video.count())} videos`);
  console.log(`   - ${(await prisma.announcement.count())} announcements`);
  console.log(`   - Site settings initialized`);

  await prisma.$disconnect();
}

main()
  .catch(e => { console.error(e); process.exit(1); });
