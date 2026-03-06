import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET all channels
export async function GET() {
  const channels = await prisma.channel.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(channels);
}

// POST create channel
export async function POST(req: NextRequest) {
  const body = await req.json();
  const channel = await prisma.channel.create({ data: body });
  return NextResponse.json(channel, { status: 201 });
}
