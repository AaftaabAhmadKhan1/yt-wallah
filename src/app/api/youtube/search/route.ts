import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const YT_API = 'https://www.googleapis.com/youtube/v3';

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q');
    if (!q || q.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    // Get API key from database settings
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
    const apiKey = settings?.youtubeApiKey;
    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
    }

    // Search YouTube for channels
    const searchUrl = `${YT_API}/search?part=snippet&type=channel&q=${encodeURIComponent(q.trim())}&maxResults=10&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchRes.ok) {
      return NextResponse.json(
        { error: searchData.error?.message || 'YouTube API error' },
        { status: searchRes.status }
      );
    }

    if (!searchData.items?.length) {
      return NextResponse.json({ channels: [] });
    }

    // Get detailed channel info (statistics, branding) for each result
    const channelIds = searchData.items.map((item: { id: { channelId: string } }) => item.id.channelId).join(',');
    const detailUrl = `${YT_API}/channels?part=snippet,statistics,brandingSettings&id=${channelIds}&key=${apiKey}`;
    const detailRes = await fetch(detailUrl);
    const detailData = await detailRes.json();

    interface YTChannelItem {
      id: string;
      snippet: {
        title: string;
        description: string;
        customUrl?: string;
        thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
      };
      statistics: { subscriberCount?: string; videoCount?: string };
      brandingSettings?: { image?: { bannerExternalUrl?: string } };
    }

    const channels = (detailData.items || []).map((ch: YTChannelItem) => ({
      youtubeChannelId: ch.id,
      name: ch.snippet.title,
      description: ch.snippet.description?.slice(0, 200) || '',
      thumbnailUrl: ch.snippet.thumbnails?.high?.url || ch.snippet.thumbnails?.medium?.url || '',
      subscriberCount: ch.statistics?.subscriberCount || '0',
      videoCount: ch.statistics?.videoCount || '0',
      handle: ch.snippet.customUrl || '',
      bannerUrl: ch.brandingSettings?.image?.bannerExternalUrl || '',
    }));

    return NextResponse.json({ channels });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
