import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET all videos (optionally filter by channelId, batchId, type)
export async function GET(req: NextRequest) {
  const channelId = req.nextUrl.searchParams.get('channelId');
  const batchId = req.nextUrl.searchParams.get('batchId');
  const type = req.nextUrl.searchParams.get('type');
  const where: Record<string, string> = {};
  if (channelId) where.channelId = channelId;
  if (batchId) where.batchId = batchId;
  if (type) where.type = type;
  const videos = await prisma.video.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(videos);
}

// POST create video
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.publishedAt && typeof body.publishedAt === 'string') {
    body.publishedAt = new Date(body.publishedAt);
  }
  const video = await prisma.video.create({ data: body });
  return NextResponse.json(video, { status: 201 });
}
