import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET all batches (optionally filter by channelId)
export async function GET(req: NextRequest) {
  const channelId = req.nextUrl.searchParams.get('channelId');
  const where = channelId ? { channelId } : {};
  const batches = await prisma.batch.findMany({ where, orderBy: { createdAt: 'desc' } });
  // Parse subjects JSON for each batch
  const parsed = batches.map(b => ({ ...b, subjects: JSON.parse(b.subjects) }));
  return NextResponse.json(parsed);
}

// POST create batch
export async function POST(req: NextRequest) {
  const body = await req.json();
  // Store subjects as JSON string
  if (Array.isArray(body.subjects)) {
    body.subjects = JSON.stringify(body.subjects);
  }
  const batch = await prisma.batch.create({ data: body });
  return NextResponse.json({ ...batch, subjects: JSON.parse(batch.subjects) }, { status: 201 });
}
