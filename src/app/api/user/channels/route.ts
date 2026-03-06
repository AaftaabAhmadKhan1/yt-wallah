import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to get user email from NextAuth session
async function getUserEmail(request: NextRequest): Promise<string | null> {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const baseUrl = request.nextUrl.origin;
    const res = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { cookie: cookieHeader },
    });
    const session = await res.json();
    return session?.user?.email || null;
  } catch {
    return null;
  }
}

// GET — list user's subscribed channels
export async function GET(request: NextRequest) {
  try {
    const email = await getUserEmail(request);
    if (!email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const channels = await prisma.userChannel.findMany({
      where: { userEmail: email },
      orderBy: { addedAt: 'desc' },
    });

    return NextResponse.json({ channels });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch channels';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — subscribe to a channel
export async function POST(request: NextRequest) {
  try {
    const email = await getUserEmail(request);
    if (!email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { youtubeChannelId, channelName, thumbnailUrl, subscriberCount, description } = body;

    if (!youtubeChannelId || !channelName) {
      return NextResponse.json({ error: 'Missing youtubeChannelId or channelName' }, { status: 400 });
    }

    const channel = await prisma.userChannel.upsert({
      where: {
        userEmail_youtubeChannelId: { userEmail: email, youtubeChannelId },
      },
      update: { channelName, thumbnailUrl: thumbnailUrl || '', subscriberCount: subscriberCount || '', description: description || '' },
      create: {
        userEmail: email,
        youtubeChannelId,
        channelName,
        thumbnailUrl: thumbnailUrl || '',
        subscriberCount: subscriberCount || '',
        description: description || '',
      },
    });

    return NextResponse.json({ channel });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to subscribe';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — unsubscribe from a channel
export async function DELETE(request: NextRequest) {
  try {
    const email = await getUserEmail(request);
    if (!email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { youtubeChannelId } = await request.json();
    if (!youtubeChannelId) {
      return NextResponse.json({ error: 'Missing youtubeChannelId' }, { status: 400 });
    }

    await prisma.userChannel.deleteMany({
      where: { userEmail: email, youtubeChannelId },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to unsubscribe';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
