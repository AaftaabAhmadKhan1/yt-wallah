'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Youtube, Shield, BookOpen, Bell, Zap, Mail, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const { isAuthenticated, signIn, status } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [emailVerified, setEmailVerified] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const justRegistered = searchParams.get('registered') === '1';

  // Auto-verify if email was passed from signup
  useEffect(() => {
    if (searchParams.get('email') && justRegistered) {
      setEmailVerified(true);
    }
  }, [searchParams, justRegistered]);

  if (isAuthenticated) {
    router.push('/');
    return null;
  }

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setChecking(true);
    try {
      const res = await fetch(`/api/students?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();

      if (data.exists) {
        setEmailVerified(true);
      } else {
        setError('No account found with this email. Please sign up first.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setChecking(false);
  };

  const features = [
    { icon: BookOpen, text: 'Save notes on any video with timestamps' },
    { icon: Bell, text: 'Get notified about new lectures & live classes' },
    { icon: Youtube, text: 'YouTube subscriptions automatically synced' },
    { icon: Zap, text: 'Personalized learning dashboard' },
  ];

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-600/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold text-white">YT Wallah</span>
          </Link>
          <p className="text-white/40 text-sm mt-4">
            {emailVerified ? 'Continue with Google to sign in' : 'Enter your registered email to sign in'}
          </p>
        </div>

        {/* Success banner if just registered */}
        {justRegistered && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Registration successful! Now sign in with Google.
          </motion.div>
        )}

        {/* Main Card */}
        <div className="bg-[#0f0a1f]/80 backdrop-blur-xl border border-purple-500/10 rounded-3xl p-8">
          {!emailVerified ? (
            <>
              {/* Email Input Step */}
              <form onSubmit={handleEmailCheck} className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 font-medium mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="Enter your registered email"
                      className="w-full pl-10 pr-4 py-3.5 bg-[#1a1035] border border-purple-500/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-purple-500/30 text-sm"
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                  >
                    {error}
                    {error.includes('sign up') && (
                      <Link href="/signup" className="block mt-1 text-purple-400 hover:text-purple-300 font-medium">
                        Go to Sign Up &rarr;
                      </Link>
                    )}
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={checking || !email.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold text-sm shadow-lg shadow-purple-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {checking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  {checking ? 'Checking...' : 'Continue'}
                </motion.button>
              </form>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-xs text-white/20">NEW HERE?</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <Link href="/signup">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white/70 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  Create an account
                </motion.div>
              </Link>
            </>
          ) : (
            <>
              {/* Email confirmed — show Google sign-in */}
              <div className="mb-5 px-4 py-3 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center gap-3">
                <Mail className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/40">Signing in as</p>
                  <p className="text-sm text-white font-medium truncate">{email}</p>
                </div>
                <button
                  onClick={() => { setEmailVerified(false); setError(''); }}
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  Change
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={signIn}
                disabled={status === 'loading'}
                className="w-full py-3.5 bg-white hover:bg-gray-50 rounded-2xl text-gray-800 font-semibold text-sm flex items-center justify-center gap-3 shadow-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-xs text-white/20">YOUR YOUTUBE ACCOUNT WILL BE CONNECTED</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* Features */}
              <div className="space-y-3">
                {features.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center flex-shrink-0 border border-purple-500/10">
                      <f.icon className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-xs text-white/50">{f.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Privacy note */}
              <div className="mt-6 flex items-start gap-2 px-1">
                <Shield className="w-4 h-4 text-green-400/60 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-white/25 leading-relaxed">
                  We only request read-only access to your YouTube data (subscriptions). We never post, modify, or delete anything on your account.
                </p>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          <Link href="/" className="hover:text-white/40 transition-colors">&larr; Back to Home</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="animate-pulse text-white/20">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}