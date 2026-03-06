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

// GET — get liked videos
export async function GET(request: NextRequest) {
  try {
    const email = await getUserEmail(request);
    if (!email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const liked = await prisma.likedVideo.findMany({
      where: { studentEmail: email },
      orderBy: { likedAt: 'desc' },
    });

    return NextResponse.json({ liked });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch liked videos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — like a video
export async function POST(request: NextRequest) {
  try {
    const email = await getUserEmail(request);
    if (!email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const { youtubeVideoId, title, thumbnailUrl, channelName, duration } = body;

    if (!youtubeVideoId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const entry = await prisma.likedVideo.upsert({
      where: { studentEmail_youtubeVideoId: { studentEmail: email, youtubeVideoId } },
      update: { title, thumbnailUrl: thumbnailUrl || '', channelName: channelName || '', duration: duration || '' },
      create: {
        studentEmail: email,
        youtubeVideoId,
        title,
        thumbnailUrl: thumbnailUrl || '',
        channelName: channelName || '',
        duration: duration || '',
      },
    });

    return NextResponse.json({ entry });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to like video';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — unlike a video
export async function DELETE(request: NextRequest) {
  try {
    const email = await getUserEmail(request);
    if (!email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { youtubeVideoId } = await request.json();
    if (!youtubeVideoId) {
      return NextResponse.json({ error: 'Missing youtubeVideoId' }, { status: 400 });
    }

    await prisma.likedVideo.deleteMany({ where: { studentEmail: email, youtubeVideoId } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to unlike video';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
