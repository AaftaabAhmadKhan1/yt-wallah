import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET single video
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = await prisma.video.findUnique({ where: { id }, include: { notes: true } });
  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(video);
}

// PATCH update video
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.publishedAt && typeof body.publishedAt === 'string') {
    body.publishedAt = new Date(body.publishedAt);
  }
  const video = await prisma.video.update({ where: { id }, data: body });
  return NextResponse.json(video);
}

// DELETE video
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.video.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
