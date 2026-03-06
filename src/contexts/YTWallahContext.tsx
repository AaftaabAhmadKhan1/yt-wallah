'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Channel, Batch, Video, Announcement, SiteSettings,
} from '@/data/types';
import {
  defaultSiteSettings, defaultChannels, defaultBatches, defaultVideos, defaultAnnouncements,
} from '@/data/store';

// ── API helpers ───────────────────────────────────────
async function api<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

interface YTWallahContextType {
  // Data
  channels: Channel[];
  batches: Batch[];
  videos: Video[];
  announcements: Announcement[];
  siteSettings: SiteSettings;

  // Channel CRUD
  addChannel: (channel: Omit<Channel, 'id' | 'createdAt'>) => void;
  updateChannel: (id: string, updates: Partial<Channel>) => void;
  deleteChannel: (id: string) => void;

  // Batch CRUD
  addBatch: (batch: Omit<Batch, 'id' | 'createdAt'>) => void;
  updateBatch: (id: string, updates: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;

  // Video CRUD
  addVideo: (video: Omit<Video, 'id' | 'createdAt'>) => void;
  updateVideo: (id: string, updates: Partial<Video>) => void;
  deleteVideo: (id: string) => void;

  // Announcement CRUD
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'createdAt'>) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;

  // Settings
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;

  // Admin Auth
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;

  // Reset
  resetToDefaults: () => void;
  mounted: boolean;
}

const YTWallahContext = createContext<YTWallahContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@ytwallah.com';
const ADMIN_PASSWORD = 'admin2026';

export function YTWallahProvider({ children }: { children: ReactNode }) {
  const [channels, setChannels] = useState<Channel[]>(defaultChannels);
  const [batches, setBatches] = useState<Batch[]>(defaultBatches);
  const [videos, setVideos] = useState<Video[]>(defaultVideos);
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from database on mount
  useEffect(() => {
    setMounted(true);
    // Fetch all data from API routes (backed by SQLite)
    api<Channel[]>('/api/channels').then(data => { if (data.length) setChannels(data); }).catch(() => {});
    api<Batch[]>('/api/batches').then(data => { if (data.length) setBatches(data); }).catch(() => {});
    api<Video[]>('/api/videos').then(data => { if (data.length) setVideos(data); }).catch(() => {});
    api<Announcement[]>('/api/announcements').then(data => { if (data.length) setAnnouncements(data); }).catch(() => {});
    api<SiteSettings>('/api/settings').then(data => { if (data) setSiteSettings(data); }).catch(() => {});

    const auth = localStorage.getItem('yt-wallah-admin-auth');
    if (auth === 'true') setIsAdminAuthenticated(true);
  }, []);

  // Channel CRUD
  const addChannel = useCallback((channel: Omit<Channel, 'id' | 'createdAt'>) => {
    api<Channel>('/api/channels', { method: 'POST', body: JSON.stringify(channel) })
      .then(created => setChannels(prev => [...prev, created]))
      .catch(console.error);
  }, []);
  const updateChannel = useCallback((id: string, updates: Partial<Channel>) => {
    api<Channel>(`/api/channels/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
      .then(updated => setChannels(prev => prev.map(c => c.id === id ? updated : c)))
      .catch(console.error);
  }, []);
  const deleteChannel = useCallback((id: string) => {
    api(`/api/channels/${id}`, { method: 'DELETE' })
      .then(() => setChannels(prev => prev.filter(c => c.id !== id)))
      .catch(console.error);
  }, []);

  // Batch CRUD
  const addBatch = useCallback((batch: Omit<Batch, 'id' | 'createdAt'>) => {
    api<Batch>('/api/batches', { method: 'POST', body: JSON.stringify(batch) })
      .then(created => setBatches(prev => [...prev, created]))
      .catch(console.error);
  }, []);
  const updateBatch = useCallback((id: string, updates: Partial<Batch>) => {
    api<Batch>(`/api/batches/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
      .then(updated => setBatches(prev => prev.map(b => b.id === id ? updated : b)))
      .catch(console.error);
  }, []);
  const deleteBatch = useCallback((id: string) => {
    api(`/api/batches/${id}`, { method: 'DELETE' })
      .then(() => setBatches(prev => prev.filter(b => b.id !== id)))
      .catch(console.error);
  }, []);

  // Video CRUD
  const addVideo = useCallback((video: Omit<Video, 'id' | 'createdAt'>) => {
    api<Video>('/api/videos', { method: 'POST', body: JSON.stringify(video) })
      .then(created => setVideos(prev => [...prev, created]))
      .catch(console.error);
  }, []);
  const updateVideo = useCallback((id: string, updates: Partial<Video>) => {
    api<Video>(`/api/videos/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
      .then(updated => setVideos(prev => prev.map(v => v.id === id ? updated : v)))
      .catch(console.error);
  }, []);
  const deleteVideo = useCallback((id: string) => {
    api(`/api/videos/${id}`, { method: 'DELETE' })
      .then(() => setVideos(prev => prev.filter(v => v.id !== id)))
      .catch(console.error);
  }, []);

  // Announcement CRUD
  const addAnnouncement = useCallback((ann: Omit<Announcement, 'id' | 'createdAt'>) => {
    api<Announcement>('/api/announcements', { method: 'POST', body: JSON.stringify(ann) })
      .then(created => setAnnouncements(prev => [...prev, created]))
      .catch(console.error);
  }, []);
  const updateAnnouncement = useCallback((id: string, updates: Partial<Announcement>) => {
    api<Announcement>(`/api/announcements/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
      .then(updated => setAnnouncements(prev => prev.map(a => a.id === id ? updated : a)))
      .catch(console.error);
  }, []);
  const deleteAnnouncement = useCallback((id: string) => {
    api(`/api/announcements/${id}`, { method: 'DELETE' })
      .then(() => setAnnouncements(prev => prev.filter(a => a.id !== id)))
      .catch(console.error);
  }, []);

  // Settings
  const updateSiteSettings = useCallback((settings: Partial<SiteSettings>) => {
    const newSettings = { ...siteSettings, ...settings };
    setSiteSettings(newSettings);
    api('/api/settings', { method: 'PATCH', body: JSON.stringify(settings) }).catch(console.error);
  }, [siteSettings]);

  // Admin Auth
  const adminLogin = (email: string, password: string): boolean => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('yt-wallah-admin-auth', 'true');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('yt-wallah-admin-auth');
  };

  // Reset all data (re-seeds defaults via API)
  const resetToDefaults = () => {
    setChannels(defaultChannels);
    setBatches(defaultBatches);
    setVideos(defaultVideos);
    setAnnouncements(defaultAnnouncements);
    setSiteSettings(defaultSiteSettings);
    // Note: This only resets the in-memory state.
    // A full DB reset would require a dedicated API endpoint.
  };

  return (
    <YTWallahContext.Provider value={{
      channels, batches, videos, announcements, siteSettings,
      addChannel, updateChannel, deleteChannel,
      addBatch, updateBatch, deleteBatch,
      addVideo, updateVideo, deleteVideo,
      addAnnouncement, updateAnnouncement, deleteAnnouncement,
      updateSiteSettings,
      isAdminAuthenticated, adminLogin, adminLogout,
      resetToDefaults, mounted,
    }}>
      {children}
    </YTWallahContext.Provider>
  );
}

export function useYTWallah() {
  const context = useContext(YTWallahContext);
  if (!context) throw new Error('useYTWallah must be used within YTWallahProvider');
  return context;
}
