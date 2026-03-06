'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  LogIn,
  Home,
  Tv,
  Radio,
  Megaphone,
  Flame,
  Play,
  LogOut,
  ChevronDown,
  UserPlus,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useYTWallah } from '@/contexts/YTWallahContext';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, signOut } = useAuth();
  const { channels, siteSettings } = useYTWallah();
  const [showChannels, setShowChannels] = useState(true);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Channels', href: '/channels', icon: Tv },
    { name: 'My Channels', href: '/my-channels', icon: UserPlus },
    { name: 'Shorts', href: '/shorts', icon: Flame },
    { name: 'Live', href: '/live', icon: Radio },
    { name: 'Library', href: '/library', icon: BookOpen },
    { name: 'Announcements', href: '/announcements', icon: Megaphone },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.nav
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex fixed left-0 top-0 h-screen w-52 lg:w-60 bg-[#0a0520]/80 backdrop-blur-2xl border-r border-purple-500/10 z-50 flex-col py-6 px-3 gap-4"
      >
        <div className="flex flex-col h-full min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-4 scrollbar-hide">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group px-3 mb-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-11 h-11 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0"
              >
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </motion.div>
              <div>
                <h1 className="text-lg font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                  {siteSettings.siteName || 'YT Wallah'}
                </h1>
                <p className="text-[10px] text-purple-300/60 font-medium tracking-wider uppercase">
                  Physics Wallah
                </p>
              </div>
            </Link>

            {/* Main Nav Links */}
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link key={link.name} href={link.href}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className={`group px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/10 text-white border border-purple-500/20'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${active ? 'text-purple-400' : 'text-white/40 group-hover:text-purple-400'}`}
                      />
                      <span className="text-sm font-medium">{link.name}</span>
                      {link.name === 'Live' && (
                        <span className="ml-auto relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Channels Section */}
            <div className="mt-2">
              <button
                onClick={() => setShowChannels(!showChannels)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider w-full hover:text-white/60 transition-colors"
              >
                <span>Channels</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${showChannels ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {showChannels && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex flex-col gap-1 overflow-hidden"
                  >
                    {channels
                      .filter((c) => c.isActive)
                      .map((channel) => (
                        <Link key={channel.id} href={`/channel/${channel.id}`}>
                          <motion.div
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-3 px-4 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
                              {channel.name.charAt(0)}
                            </div>
                            <span className="text-xs font-medium truncate">{channel.name}</span>
                          </motion.div>
                        </Link>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Auth Section */}
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/5">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  {user?.image ? (
                    <img src={user.image} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {user?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
                  </div>
                </div>
                <button onClick={signOut}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 rounded-xl flex items-center gap-3 justify-center group transition-all"
                  >
                    <LogOut className="w-4 h-4 text-white/60 group-hover:text-red-400" />
                    <span className="text-white/60 group-hover:text-red-400 font-medium text-sm">
                      Sign Out
                    </span>
                  </motion.div>
                </button>
              </>
            ) : (
              <Link href="/login">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg shadow-purple-500/20 flex items-center gap-3 justify-center group"
                >
                  <LogIn className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold text-sm">Sign In</span>
                </motion.div>
              </Link>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Top Nav */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0a0520]/95 backdrop-blur-2xl shadow-lg shadow-purple-500/5'
            : 'bg-[#0a0520]/60 backdrop-blur-xl'
        } border-b border-purple-500/10`}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
            <h1 className="text-lg font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              YT Wallah
            </h1>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white/90 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0a0520]/98 backdrop-blur-2xl border-t border-purple-500/10 shadow-lg"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          active
                            ? 'bg-purple-600/20 text-white'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${active ? 'text-purple-400' : ''}`} />
                        <span className="font-medium">{link.name}</span>
                      </div>
                    </Link>
                  );
                })}

                <div className="pt-3 space-y-2 border-t border-white/5 mt-3">
                  {isAuthenticated ? (
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      <div className="px-4 py-3 bg-white/5 hover:bg-red-500/10 border border-white/10 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                      </div>
                    </button>
                  ) : (
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                        <LogIn className="w-5 h-5" />
                        Sign In with Google
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
