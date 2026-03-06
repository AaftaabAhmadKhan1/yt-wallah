import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET single announcement
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ann = await prisma.announcement.findUnique({ where: { id } });
  if (!ann) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(ann);
}

// PATCH update announcement
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.expiresAt && typeof body.expiresAt === 'string') {
    body.expiresAt = new Date(body.expiresAt);
  }
  const ann = await prisma.announcement.update({ where: { id }, data: body });
  return NextResponse.json(ann);
}

// DELETE announcement
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
