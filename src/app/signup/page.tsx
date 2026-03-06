'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, UserPlus, Loader2, MapPin, Phone, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    city: '', state: '', country: 'India', pincode: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    router.push('/');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const { name, email, phone, city, state, country, pincode } = form;
    if (!name.trim() || !email.trim() || !phone.trim() || !city.trim() || !state.trim() || !country.trim() || !pincode.trim()) {
      setError('All fields are required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (!/^\d{6,15}$/.test(phone.replace(/[\s\-+()]/g, ''))) {
      setError('Please enter a valid phone number');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setSubmitting(false);
        return;
      }

      // Registration successful — redirect to login with email pre-filled
      router.push(`/login?email=${encodeURIComponent(email.trim().toLowerCase())}&registered=1`);
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 bg-[#1a1035] border border-purple-500/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-purple-500/30 text-sm transition-colors';

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-600/8 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold text-white">YT Wallah</span>
          </Link>
          <p className="text-white/40 text-sm mt-4">Create your student account to get started</p>
        </div>

        {/* Main Card */}
        <div className="bg-[#0f0a1f]/80 backdrop-blur-xl border border-purple-500/10 rounded-3xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Student Registration</h2>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs text-white/40 font-medium mb-1.5 block">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`${inputClass} pl-10`}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-white/40 font-medium mb-1.5 block">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="your.email@example.com"
                  className={`${inputClass} pl-10`}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs text-white/40 font-medium mb-1.5 block">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="Enter your phone number"
                  className={`${inputClass} pl-10`}
                  required
                />
              </div>
            </div>

            {/* Address Row 1: City + State */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 font-medium mb-1.5 block">City *</label>
                <input
                  type="text" name="city" value={form.city} onChange={handleChange}
                  placeholder="City" className={inputClass} required
                />
              </div>
              <div>
                <label className="text-xs text-white/40 font-medium mb-1.5 block">State *</label>
                <input
                  type="text" name="state" value={form.state} onChange={handleChange}
                  placeholder="State" className={inputClass} required
                />
              </div>
            </div>

            {/* Address Row 2: Country + Pincode */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 font-medium mb-1.5 block">Country *</label>
                <input
                  type="text" name="country" value={form.country} onChange={handleChange}
                  placeholder="Country" className={inputClass} required
                />
              </div>
              <div>
                <label className="text-xs text-white/40 font-medium mb-1.5 block">Pincode *</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text" name="pincode" value={form.pincode} onChange={handleChange}
                    placeholder="Pincode" className={`${inputClass} pl-10`} required
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold text-sm shadow-lg shadow-purple-500/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {submitting ? 'Registering...' : 'Sign Up & Continue to Login'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-white/20">ALREADY REGISTERED?</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <Link href="/login">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white/70 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              Login to your account
            </motion.div>
          </Link>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          <Link href="/" className="hover:text-white/40 transition-colors">&larr; Back to Home</Link>
        </p>
      </motion.div>
    </div>
  );
}
