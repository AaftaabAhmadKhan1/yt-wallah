import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

// GET — get watch history
export async function GET(request: NextRequest) {
  try {
    const email = await getUserEmail(request);
    if (!email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const history = await prisma.watchHistory.findMany({
      where: { studentEmail: email },
      orderBy: { watchedAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ history });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch history';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — add/update watch history entry
export async function POST(request: NextRequest) {
  try {
    const email = await getUserEmail(request);
    if (!email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const { youtubeVideoId, title, thumbnailUrl, channelName, duration, progressSeconds } = body;

    if (!youtubeVideoId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const entry = await prisma.watchHistory.upsert({
      where: { studentEmail_youtubeVideoId: { studentEmail: email, youtubeVideoId } },
      update: {
        title,
        thumbnailUrl: thumbnailUrl || '',
        channelName: channelName || '',
        duration: duration || '',
        progressSeconds: progressSeconds || 0,
        watchedAt: new Date(),
      },
      create: {
        studentEmail: email,
        youtubeVideoId,
        title,
        thumbnailUrl: thumbnailUrl || '',
        channelName: channelName || '',
        duration: duration || '',
        progressSeconds: progressSeconds || 0,
      },
    });

    return NextResponse.json({ entry });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save history';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — clear watch history
export async function DELETE(request: NextRequest) {
  try {
    const email = await getUserEmail(request);
    if (!email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { youtubeVideoId } = await request.json();

    if (youtubeVideoId) {
      await prisma.watchHistory.deleteMany({ where: { studentEmail: email, youtubeVideoId } });
    } else {
      await prisma.watchHistory.deleteMany({ where: { studentEmail: email } });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete history';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
