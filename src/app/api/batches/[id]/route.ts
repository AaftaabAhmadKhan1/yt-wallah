import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET single batch
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const batch = await prisma.batch.findUnique({ where: { id }, include: { videos: true } });
  if (!batch) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ...batch, subjects: JSON.parse(batch.subjects) });
}

// PATCH update batch
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (Array.isArray(body.subjects)) {
    body.subjects = JSON.stringify(body.subjects);
  }
  const batch = await prisma.batch.update({ where: { id }, data: body });
  return NextResponse.json({ ...batch, subjects: JSON.parse(batch.subjects) });
}

// DELETE batch
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.batch.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
