'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Tv, Loader2, UserPlus, Trash2, ExternalLink } from 'lucide-react';
import Navigation from '@/components/Navigation';
import FooterNew from '@/components/FooterNew';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface SearchResult {
  youtubeChannelId: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: string;
  videoCount: string;
  handle: string;
}

interface UserChannel {
  id: string;
  youtubeChannelId: string;
  channelName: string;
  thumbnailUrl: string;
  subscriberCount: string;
  description: string;
  addedAt: string;
}

function formatCount(n: string): string {
  const num = parseInt(n, 10);
  if (isNaN(num)) return n;
  if (num >= 1e9) return `${(num / 1e9).toFixed(1).replace(/\.0$/, '')}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  return n;
}

export default function MyChannelsPage() {
  const { isAuthenticated, user, mounted } = useAuth();

  // Search state
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // User channels state
  const [myChannels, setMyChannels] = useState<UserChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribingIds, setSubscribingIds] = useState<Set<string>>(new Set());

  // Fetch user's subscribed channels
  const fetchMyChannels = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/user/channels');
      const data = await res.json();
      if (res.ok) setMyChannels(data.channels || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (mounted && isAuthenticated) fetchMyChannels();
    if (mounted && !isAuthenticated) setLoading(false);
  }, [mounted, isAuthenticated, fetchMyChannels]);

  // Search YouTube channels
  const handleSearch = async () => {
    if (!query.trim() || query.trim().length < 2) return;
    setSearching(true);
    setSearchError('');
    setSearchResults([]);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.channels || []);
        if (!data.channels?.length) setSearchError('No channels found');
      } else {
        setSearchError(data.error || 'Search failed');
      }
    } catch {
      setSearchError('Search failed. Please try again.');
    }
    setSearching(false);
  };

  // Subscribe to a channel
  const handleSubscribe = async (channel: SearchResult) => {
    setSubscribingIds(prev => new Set(prev).add(channel.youtubeChannelId));
    try {
      const res = await fetch('/api/user/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeChannelId: channel.youtubeChannelId,
          channelName: channel.name,
          thumbnailUrl: channel.thumbnailUrl,
          subscriberCount: channel.subscriberCount,
          description: channel.description,
        }),
      });
      if (res.ok) await fetchMyChannels();
    } catch { /* ignore */ }
    setSubscribingIds(prev => {
      const next = new Set(prev);
      next.delete(channel.youtubeChannelId);
      return next;
    });
  };

  // Unsubscribe from a channel
  const handleUnsubscribe = async (youtubeChannelId: string) => {
    setSubscribingIds(prev => new Set(prev).add(youtubeChannelId));
    try {
      const res = await fetch('/api/user/channels', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeChannelId }),
      });
      if (res.ok) {
        setMyChannels(prev => prev.filter(c => c.youtubeChannelId !== youtubeChannelId));
      }
    } catch { /* ignore */ }
    setSubscribingIds(prev => {
      const next = new Set(prev);
      next.delete(youtubeChannelId);
      return next;
    });
  };

  const isSubscribed = (channelId: string) =>
    myChannels.some(c => c.youtubeChannelId === channelId);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#030014]">
      <Navigation />
      <div className="md:ml-52 lg:ml-60 pt-20 md:pt-0">
        <div className="px-6 py-12 max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <UserPlus className="w-7 h-7 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">My Channels</h1>
            </div>
            <p className="text-white/40">
              Search and add YouTube channels to get personalized content recommendations.
            </p>
          </motion.div>

          {!isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <Tv className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Sign in to add channels</h2>
              <p className="text-white/40 mb-6">
                Sign in with your Google account to search and add channels to your personalized feed.
              </p>
              <Link href="/login">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold"
                >
                  Sign In
                </motion.span>
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Search Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-10"
              >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-400" />
                  Search YouTube Channels
                </h2>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      placeholder="Search by channel name (e.g. Physics Wallah, Unacademy...)"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-11 pr-4 py-3 bg-[#0f0a1f] border border-purple-500/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-purple-500/30 text-sm"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSearch}
                    disabled={searching || query.trim().length < 2}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search
                  </motion.button>
                </div>

                {/* Search Results */}
                <AnimatePresence>
                  {(searchResults.length > 0 || searchError) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 border border-purple-500/10 rounded-xl bg-[#0f0a1f]/50 overflow-hidden"
                    >
                      {searchError && (
                        <div className="px-4 py-8 text-center text-white/40 text-sm">{searchError}</div>
                      )}
                      {searchResults.map((ch, i) => (
                        <motion.div
                          key={ch.youtubeChannelId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-4 px-4 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors"
                        >
                          <img
                            src={ch.thumbnailUrl}
                            alt={ch.name}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white truncate">{ch.name}</h3>
                            <p className="text-xs text-white/40 truncate">
                              {ch.handle && `${ch.handle} · `}
                              {formatCount(ch.subscriberCount)} subscribers · {formatCount(ch.videoCount)} videos
                            </p>
                            {ch.description && (
                              <p className="text-xs text-white/30 truncate mt-0.5">{ch.description}</p>
                            )}
                          </div>
                          {isSubscribed(ch.youtubeChannelId) ? (
                            <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs font-medium">
                              Added
                            </span>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSubscribe(ch)}
                              disabled={subscribingIds.has(ch.youtubeChannelId)}
                              className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 text-xs font-medium hover:bg-purple-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              {subscribingIds.has(ch.youtubeChannelId) ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Plus className="w-3 h-3" />
                              )}
                              Add
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* My Channels Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Tv className="w-5 h-5 text-purple-400" />
                  Your Channels ({myChannels.length})
                </h2>

                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                  </div>
                ) : myChannels.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
                    <Tv className="w-12 h-12 text-white/10 mx-auto mb-3" />
                    <h3 className="text-white/60 font-medium mb-1">No channels added yet</h3>
                    <p className="text-white/30 text-sm">
                      Search for YouTube channels above and add them to get personalized recommendations.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myChannels.map((ch, i) => (
                      <motion.div
                        key={ch.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative group bg-[#0f0a1f] border border-purple-500/10 rounded-xl p-4 hover:border-purple-500/20 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={ch.thumbnailUrl}
                            alt={ch.channelName}
                            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white truncate">{ch.channelName}</h3>
                            <p className="text-xs text-white/40">
                              {formatCount(ch.subscriberCount)} subscribers
                            </p>
                            {ch.description && (
                              <p className="text-xs text-white/30 mt-1 line-clamp-2">{ch.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <a
                            href={`https://youtube.com/channel/${ch.youtubeChannelId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-white/50 text-xs hover:bg-white/10 hover:text-white/70 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            YouTube
                          </a>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUnsubscribe(ch.youtubeChannelId)}
                            disabled={subscribingIds.has(ch.youtubeChannelId)}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          >
                            {subscribingIds.has(ch.youtubeChannelId) ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                            Remove
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
        <FooterNew />
      </div>
    </main>
  );
}
