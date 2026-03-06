'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Heart, StickyNote, Play, Loader2, Trash2, Clock, Eye, BookOpen } from 'lucide-react';
import Navigation from '@/components/Navigation';
import FooterNew from '@/components/FooterNew';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

type Tab = 'history' | 'notes' | 'liked';

interface HistoryItem {
  id: string;
  youtubeVideoId: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  duration: string;
  watchedAt: string;
  progressSeconds: number;
}

interface LikedItem {
  id: string;
  youtubeVideoId: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  duration: string;
  likedAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function LibraryPage() {
  const { isAuthenticated, user, notes, mounted } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('history');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [liked, setLiked] = useState<LikedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/library/history');
      const data = await res.json();
      if (res.ok) setHistory(data.history || []);
    } catch { /* ignore */ }
  }, []);

  const fetchLiked = useCallback(async () => {
    try {
      const res = await fetch('/api/library/liked');
      const data = await res.json();
      if (res.ok) setLiked(data.liked || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      Promise.all([fetchHistory(), fetchLiked()]).finally(() => setLoading(false));
    }
    if (mounted && !isAuthenticated) setLoading(false);
  }, [mounted, isAuthenticated, fetchHistory, fetchLiked]);

  const handleDeleteHistory = async (youtubeVideoId: string) => {
    setHistory(prev => prev.filter(h => h.youtubeVideoId !== youtubeVideoId));
    try {
      await fetch('/api/library/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeVideoId }),
      });
    } catch { /* ignore */ }
  };

  const handleClearAllHistory = async () => {
    setHistory([]);
    try {
      await fetch('/api/library/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    } catch { /* ignore */ }
  };

  const handleUnlike = async (youtubeVideoId: string) => {
    setLiked(prev => prev.filter(l => l.youtubeVideoId !== youtubeVideoId));
    try {
      await fetch('/api/library/liked', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeVideoId }),
      });
    } catch { /* ignore */ }
  };

  const tabs = [
    { id: 'history' as Tab, label: 'Watch History', icon: History, count: history.length },
    { id: 'notes' as Tab, label: 'Saved Notes', icon: StickyNote, count: notes.length },
    { id: 'liked' as Tab, label: 'Liked Videos', icon: Heart, count: liked.length },
  ];

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
              <BookOpen className="w-7 h-7 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Library</h1>
            </div>
            <p className="text-white/40">Your watch history, saved notes, and liked videos</p>
          </motion.div>

          {!isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <BookOpen className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Sign in to access your library</h2>
              <p className="text-white/40 mb-6">Your watch history, notes, and liked videos will appear here after signing in.</p>
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
              {/* Tabs */}
              <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                        active
                          ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/10 text-white border border-purple-500/20'
                          : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-purple-400' : ''}`} />
                      {tab.label}
                      <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
                        active ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-white/30'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {/* Watch History Tab */}
                  {activeTab === 'history' && (
                    <motion.div
                      key="history"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {history.length > 0 && (
                        <div className="flex justify-end mb-4">
                          <button
                            onClick={handleClearAllHistory}
                            className="text-xs text-red-400/60 hover:text-red-400 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Clear All History
                          </button>
                        </div>
                      )}
                      {history.length === 0 ? (
                        <EmptyState icon={History} text="No watch history yet" sub="Videos you watch will appear here" />
                      ) : (
                        <div className="space-y-2">
                          {history.map((item, i) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className="flex items-center gap-4 p-3 rounded-xl bg-[#0f0a1f]/50 border border-purple-500/5 hover:border-purple-500/15 transition-all group"
                            >
                              <Link href={`/watch/${item.youtubeVideoId}`} className="flex-shrink-0 relative">
                                <img
                                  src={item.thumbnailUrl || `https://img.youtube.com/vi/${item.youtubeVideoId}/mqdefault.jpg`}
                                  alt={item.title}
                                  className="w-32 h-20 sm:w-40 sm:h-24 object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="w-10 h-10 bg-purple-600/90 rounded-full flex items-center justify-center">
                                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                                  </div>
                                </div>
                                {item.duration && (
                                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[10px] text-white font-medium">
                                    {item.duration}
                                  </span>
                                )}
                              </Link>
                              <div className="flex-1 min-w-0">
                                <Link href={`/watch/${item.youtubeVideoId}`}>
                                  <h3 className="text-sm font-medium text-white line-clamp-2 hover:text-purple-300 transition-colors">
                                    {item.title}
                                  </h3>
                                </Link>
                                {item.channelName && (
                                  <p className="text-xs text-white/30 mt-1">{item.channelName}</p>
                                )}
                                <p className="text-[11px] text-white/20 mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {timeAgo(item.watchedAt)}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteHistory(item.youtubeVideoId)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-400 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Saved Notes Tab */}
                  {activeTab === 'notes' && (
                    <motion.div
                      key="notes"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {notes.length === 0 ? (
                        <EmptyState icon={StickyNote} text="No saved notes yet" sub="Notes you create on videos will appear here" />
                      ) : (
                        <div className="space-y-3">
                          {notes.map((note, i) => (
                            <motion.div
                              key={note.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className="p-4 rounded-xl bg-[#0f0a1f]/50 border border-purple-500/5 hover:border-purple-500/15 transition-all"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <p className="text-sm text-white/80 whitespace-pre-wrap">{note.content}</p>
                                  <div className="flex items-center gap-3 mt-2 text-[11px] text-white/25">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {Math.floor(note.timestamp / 60)}:{(note.timestamp % 60).toString().padStart(2, '0')}
                                    </span>
                                    <span>{timeAgo(note.createdAt)}</span>
                                  </div>
                                </div>
                                <Link
                                  href={`/watch/${note.videoId}`}
                                  className="text-xs text-purple-400 hover:text-purple-300 flex-shrink-0"
                                >
                                  Watch &rarr;
                                </Link>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Liked Videos Tab */}
                  {activeTab === 'liked' && (
                    <motion.div
                      key="liked"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {liked.length === 0 ? (
                        <EmptyState icon={Heart} text="No liked videos yet" sub="Videos you like will appear here" />
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {liked.map((item, i) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="group bg-[#0f0a1f]/50 border border-purple-500/5 rounded-xl overflow-hidden hover:border-purple-500/15 transition-all"
                            >
                              <Link href={`/watch/${item.youtubeVideoId}`}>
                                <div className="relative aspect-video">
                                  <img
                                    src={item.thumbnailUrl || `https://img.youtube.com/vi/${item.youtubeVideoId}/mqdefault.jpg`}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 bg-purple-600/90 rounded-full flex items-center justify-center">
                                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                    </div>
                                  </div>
                                  {item.duration && (
                                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[10px] text-white font-medium">
                                      {item.duration}
                                    </span>
                                  )}
                                </div>
                              </Link>
                              <div className="p-3">
                                <Link href={`/watch/${item.youtubeVideoId}`}>
                                  <h3 className="text-sm font-medium text-white line-clamp-2 hover:text-purple-300 transition-colors">
                                    {item.title}
                                  </h3>
                                </Link>
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-xs text-white/30">{item.channelName}</p>
                                  <button
                                    onClick={() => handleUnlike(item.youtubeVideoId)}
                                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                    title="Unlike"
                                  >
                                    <Heart className="w-3.5 h-3.5 fill-current" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </>
          )}
        </div>
        <FooterNew />
      </div>
    </main>
  );
}

function EmptyState({ icon: Icon, text, sub }: { icon: React.ElementType; text: string; sub: string }) {
  return (
    <div className="text-center py-20">
      <Icon className="w-14 h-14 text-white/10 mx-auto mb-3" />
      <h3 className="text-white/60 font-medium mb-1">{text}</h3>
      <p className="text-white/30 text-sm">{sub}</p>
    </div>
  );
}
