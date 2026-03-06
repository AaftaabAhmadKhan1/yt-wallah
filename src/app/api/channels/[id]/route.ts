import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET single channel
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const channel = await prisma.channel.findUnique({ where: { id }, include: { batches: true, videos: true } });
  if (!channel) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(channel);
}

// PATCH update channel
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const channel = await prisma.channel.update({ where: { id }, data: body });
  return NextResponse.json(channel);
}

// DELETE channel
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.channel.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
