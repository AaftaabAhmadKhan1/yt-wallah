import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET all announcements
export async function GET() {
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(announcements);
}

// POST create announcement
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.expiresAt && typeof body.expiresAt === 'string') {
    body.expiresAt = new Date(body.expiresAt);
  }
  const ann = await prisma.announcement.create({ data: body });
  return NextResponse.json(ann, { status: 201 });
}
