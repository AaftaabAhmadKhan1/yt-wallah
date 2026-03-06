'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Play, Tv, Flame, Radio, BookOpen, ArrowRight, Sparkles, Zap, Eye, Clock, Loader2, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import FooterNew from '@/components/FooterNew';
import ChannelCard from '@/components/ChannelCard';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { useYTWallah } from '@/contexts/YTWallahContext';
import { useAuth } from '@/contexts/AuthContext';

// YT video type matching API response
interface FetchedVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  durationSec: number;
  viewCount: string;
  likeCount: string;
  type: 'video' | 'short' | 'live';
  isLive: boolean;
  isUpcoming: boolean;
  liveBroadcastContent: string;
  scheduledStartTime: string;
  channelName?: string;
}

export default function Home() {
  const { channels, announcements, siteSettings, batches, mounted } = useYTWallah();
  const { isAuthenticated } = useAuth();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1200], [0, 400]);
  const y2 = useTransform(scrollY, [0, 1200], [0, -300]);

  const globalAnnouncements = announcements.filter(a => a.type === 'global' && a.isActive);
  const activeChannels = channels.filter(c => c.isActive);

  // User's subscribed channels
  interface UserChannelInfo { youtubeChannelId: string; channelName: string }
  const [userChannels, setUserChannels] = useState<UserChannelInfo[]>([]);
  const [userChannelsLoaded, setUserChannelsLoaded] = useState(false);

  // Fetched YouTube content from ALL channels
  const [allVideos, setAllVideos] = useState<FetchedVideo[]>([]);
  const [allShorts, setAllShorts] = useState<FetchedVideo[]>([]);
  const [allLive, setAllLive] = useState<FetchedVideo[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  // Shorts reel state
  const [currentShortIdx, setCurrentShortIdx] = useState(0);
  const shortsContainerRef = useRef<HTMLDivElement>(null);

  // Fetch user's subscribed channels when authenticated
  useEffect(() => {
    if (!mounted || !isAuthenticated) {
      setUserChannelsLoaded(true);
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/user/channels');
        const data = await res.json();
        if (res.ok) setUserChannels(data.channels || []);
      } catch { /* ignore */ }
      setUserChannelsLoaded(true);
    })();
  }, [mounted, isAuthenticated]);

  // Determine which channels to fetch content from
  // If user is logged in and has subscribed channels, use those; otherwise use all active (admin) channels
  const hasPersonalChannels = isAuthenticated && userChannels.length > 0;

  // Fetch content from channels
  const fetchAllChannelContent = useCallback(async () => {
    if (!siteSettings.youtubeApiKey || contentLoaded || !userChannelsLoaded) return;

    // Build the list of channels to fetch
    const channelsToFetch = hasPersonalChannels
      ? userChannels.map(uc => ({ youtubeChannelId: uc.youtubeChannelId, name: uc.channelName }))
      : activeChannels.map(ch => ({ youtubeChannelId: ch.youtubeChannelId, name: ch.name }));

    if (channelsToFetch.length === 0) return;
    setContentLoading(true);

    const vids: FetchedVideo[] = [];
    const shrts: FetchedVideo[] = [];
    const lives: FetchedVideo[] = [];

    await Promise.allSettled(
      channelsToFetch.map(async (ch) => {
        try {
          const res = await fetch('/api/youtube/channel-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channelId: ch.youtubeChannelId, apiKey: siteSettings.youtubeApiKey }),
          });
          const data = await res.json();
          if (res.ok) {
            const tag = (arr: FetchedVideo[]) => arr.map(v => ({ ...v, channelName: ch.name }));
            vids.push(...tag(data.videos || []));
            shrts.push(...tag(data.shorts || []));
            lives.push(...tag(data.liveStreams || []), ...tag(data.upcomingLives || []));
          }
        } catch { /* skip failed channels */ }
      })
    );

    // Sort videos by date (newest first)
    vids.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    shrts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    // Keep currently-live at top, then upcoming, then past
    lives.sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      if (a.isUpcoming && !b.isUpcoming) return -1;
      if (!a.isUpcoming && b.isUpcoming) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    setAllVideos(vids);
    setAllShorts(shrts);
    setAllLive(lives);
    setContentLoaded(true);
    setContentLoading(false);
  }, [activeChannels, userChannels, hasPersonalChannels, siteSettings.youtubeApiKey, contentLoaded, userChannelsLoaded]);

  useEffect(() => {
    if (mounted && !contentLoaded && userChannelsLoaded) fetchAllChannelContent();
  }, [mounted, contentLoaded, userChannelsLoaded, fetchAllChannelContent]);

  // Pick latest videos (mix from all channels, up to 12)
  const latestVideos = allVideos.slice(0, 12);
  const currentLive = allLive.filter(v => v.isLive);
  const shortsForReel = allShorts.slice(0, 20);

  // Hydration-safe random
  function seededRandom(seed: number) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  return (
    <main className="min-h-screen bg-[#030014]">
      <Navigation />
      <div className="md:ml-52 lg:ml-60">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden parallax-layer">
            <motion.div
              style={{ y: y1 }}
              className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
              animate={{ x: [0, 100, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              style={{ y: y2 }}
              className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-l from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
              animate={{ x: [0, -100, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            {/* Floating particles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 bg-purple-400/30 rounded-full"
                style={{
                  left: `${(seededRandom(i + 1) * 100).toFixed(8)}%`,
                  top: `${(seededRandom(i + 100) * 100).toFixed(8)}%`,
                }}
                animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 3 + seededRandom(i + 200) * 2, repeat: Infinity, delay: seededRandom(i + 300) * 2 }}
              />
            ))}
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Distraction-Free Learning Platform
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[0.9]"
            >
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                YT
              </span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {' '}Wallah
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-8 leading-relaxed"
            >
              {siteSettings.siteDescription}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link href="/channels">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/30 text-white font-semibold flex items-center gap-2 text-base"
                >
                  <Tv className="w-5 h-5" />
                  Explore Channels
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
              <Link href="/shorts">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-white font-medium flex items-center gap-2 text-base transition-all"
                >
                  <Flame className="w-5 h-5 text-orange-400" />
                  Watch Shorts
                </motion.div>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto"
            >
              {[
                { label: 'Channels', value: activeChannels.length, icon: Tv },
                { label: 'Batches', value: batches.filter(b => b.isActive).length, icon: BookOpen },
                { label: 'Videos', value: allVideos.length, icon: Play },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/30">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Announcements */}
        {globalAnnouncements.length > 0 && (
          <section className="px-6 py-6 max-w-7xl mx-auto">
            <AnnouncementBanner announcements={globalAnnouncements} />
          </section>
        )}

        {/* Personalization Banner */}
        {isAuthenticated && userChannelsLoaded && (
          <section className="px-6 py-4 max-w-7xl mx-auto">
            {hasPersonalChannels ? (
              <div className="flex items-center justify-between px-4 py-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">
                    Showing content from your <strong>{userChannels.length}</strong> subscribed channel{userChannels.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <Link href="/my-channels" className="text-xs text-purple-400 hover:text-purple-300 font-medium">
                  Manage →
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-sm text-white/40">
                  Add channels to get personalized recommendations
                </span>
                <Link href="/my-channels" className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Add Channels
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Channels Section */}
        {activeChannels.length > 0 && (
          <section className="px-6 py-12 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">PW Channels</h2>
                <p className="text-sm text-white/40 mt-1">All Physics Wallah YouTube channels</p>
              </div>
              <Link href="/channels" className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeChannels.slice(0, 6).map((channel) => (
                <ChannelCard key={channel.id} channelId={channel.id} />
              ))}
            </div>
          </section>
        )}

        {/* Live Now — only show when there's a currently-live stream */}
        {currentLive.length > 0 && (
          <section className="px-6 py-12 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Radio className="w-6 h-6 text-red-400" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Live Now</h2>
                  <p className="text-sm text-white/40 mt-1">Currently streaming on PW channels</p>
                </div>
              </div>
              <Link href="/live" className="text-sm text-red-400 hover:text-red-300 font-medium flex items-center gap-1">
                See All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentLive.slice(0, 4).map((v) => (
                <Link key={v.id} href={`/watch/${v.id}`}>
                  <motion.div whileHover={{ y: -4 }} className="group bg-[#0f0a1f]/80 border border-red-500/10 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all">
                    <div className="relative aspect-video bg-[#1a1035] overflow-hidden">
                      <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="absolute top-2 left-2 px-2.5 py-1 bg-red-600 rounded-lg text-xs text-white font-bold flex items-center gap-1.5 shadow-lg shadow-red-500/30">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        LIVE
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-red-300 transition-colors">{v.title}</h3>
                      {v.channelName && <p className="text-[11px] text-white/30 mt-1">{v.channelName}</p>}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Latest Videos — fetched from all channels */}
        {contentLoading && allVideos.length === 0 ? (
          <section className="px-6 py-12 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Latest Videos</h2>
            </div>
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              <span className="text-white/30 ml-3 text-sm">Loading from YouTube...</span>
            </div>
          </section>
        ) : latestVideos.length > 0 ? (
          <section className="px-6 py-12 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Latest Videos</h2>
                  <p className="text-sm text-white/40 mt-1">
                    {hasPersonalChannels ? 'From your subscribed channels' : 'Recent uploads from all channels'}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {latestVideos.map((v) => (
                <Link key={v.id} href={`/watch/${v.id}`}>
                  <motion.div whileHover={{ y: -4 }} className="group bg-[#0f0a1f]/80 border border-purple-500/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all">
                    <div className="relative aspect-video bg-[#1a1035] overflow-hidden">
                      <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-purple-600/90 rounded-full flex items-center justify-center shadow-lg"><Play className="w-5 h-5 text-white fill-white ml-0.5" /></div>
                      </div>
                      {v.duration && <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[11px] text-white font-medium">{v.duration}</span>}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-purple-300 transition-colors">{v.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-white/30">
                        {v.channelName && <span className="text-purple-400/60">{v.channelName}</span>}
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{v.viewCount}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Shorts — scrolling vertical reel */}
        {shortsForReel.length > 0 && (
          <section className="px-6 py-12 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Flame className="w-6 h-6 text-orange-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Shorts</h2>
                  <p className="text-sm text-white/40 mt-1">Quick bites from PW channels</p>
                </div>
              </div>
              <Link href="/shorts" className="text-sm text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Scrolling reel layout */}
            <div className="relative">
              <div
                ref={shortsContainerRef}
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
                style={{ scrollBehavior: 'smooth' }}
              >
                {shortsForReel.map((short, idx) => (
                  <Link key={short.id} href={`/shorts/${short.id}`} className="snap-start flex-shrink-0">
                    <motion.div
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="relative w-[160px] sm:w-[180px] aspect-[9/16] rounded-2xl overflow-hidden border border-purple-500/10 group"
                    >
                      <img
                        src={short.thumbnailUrl || `https://img.youtube.com/vi/${short.id}/mqdefault.jpg`}
                        alt={short.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      {/* Play overlay on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2.5">
                        <p className="text-xs font-semibold text-white line-clamp-2 leading-tight">{short.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-white/40 flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{short.viewCount}</span>
                          {short.channelName && <span className="text-[10px] text-orange-400/60 truncate">{short.channelName}</span>}
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-orange-500 rounded-md text-[10px] text-white font-bold">
                        SHORT
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {!mounted && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-pulse text-white/20">Loading...</div>
          </div>
        )}

        {mounted && activeChannels.length === 0 && allVideos.length === 0 && (
          <section className="px-6 py-24 text-center max-w-2xl mx-auto">
            <Tv className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Content Yet</h2>
            <p className="text-white/40 mb-6">Channels and videos will appear here once added by the admin.</p>
            <Link href="/admin/login" className="text-purple-400 hover:text-purple-300 font-medium">
              Go to Admin Panel →
            </Link>
          </section>
        )}

        <FooterNew />
      </div>
    </main>
  );
}
