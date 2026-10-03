'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Library,
  PlusSquare,
  Heart,
  CloudUpload,
  Radio,
  Cloud,
  ListMusic,
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const {
    playlists,
    likedTrackIds,
    createPlaylist,
    setIsUploadModalOpen,
    setIsCloudStatusModalOpen,
  } = usePlayer();

  const handleCreatePlaylist = () => {
    const playlistNumber = playlists.filter((p) => p.isCustom).length + 1;
    const newId = createPlaylist(`My Playlist #${playlistNumber}`, 'Custom user created playlist');
  };

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Your Library', href: '/library', icon: Library },
  ];

  return (
    <aside className="w-64 bg-black flex flex-col h-full text-zinc-300 select-none p-2 space-y-2">
      {/* Top Brand & Main Navigation Card */}
      <div className="bg-spotify-surface/90 rounded-lg p-4 space-y-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2 text-white px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-spotify-green flex items-center justify-center text-black font-black">
            <Radio className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
            SoundStream
            <span className="text-[10px] uppercase font-semibold bg-spotify-green/20 text-spotify-green px-1.5 py-0.5 rounded border border-spotify-green/30">
              Cloud
            </span>
          </span>
        </Link>

        {/* Primary Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-4 px-3 py-2.5 rounded-md font-semibold text-sm transition-all',
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'text-spotify-green')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Library, Playlists & Cloud Actions Card */}
      <div className="bg-spotify-surface/90 rounded-lg flex-1 flex flex-col p-4 overflow-hidden">
        {/* Actions header */}
        <div className="flex items-center justify-between text-zinc-400 mb-3 px-1">
          <span className="text-xs uppercase font-bold tracking-wider">Playlists & Media</span>
          <button
            onClick={handleCreatePlaylist}
            title="Create Playlist"
            className="hover:text-white transition p-1 hover:bg-white/10 rounded-full"
          >
            <PlusSquare className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Shortcut buttons */}
        <div className="space-y-1 pb-3 border-b border-zinc-800">
          <Link
            href="/liked"
            className={cn(
              'flex items-center space-x-3 px-2 py-2 rounded-md text-sm font-medium transition',
              pathname === '/liked'
                ? 'text-white bg-white/10'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            )}
          >
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-600 to-purple-400 flex items-center justify-center text-white">
              <Heart className="w-3.5 h-3.5 fill-white text-white" />
            </div>
            <span className="truncate">Liked Songs</span>
            <span className="text-xs text-zinc-500 ml-auto">({likedTrackIds.length})</span>
          </Link>

          {/* Upload Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full flex items-center space-x-3 px-2 py-2 rounded-md text-sm font-medium text-spotify-green hover:text-spotify-green-hover hover:bg-spotify-green/10 transition"
          >
            <div className="w-6 h-6 rounded bg-spotify-green/20 flex items-center justify-center text-spotify-green">
              <CloudUpload className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">Upload to S3</span>
          </button>
        </div>

        {/* User & Curated Playlists scroll list */}
        <div className="flex-1 overflow-y-auto space-y-1 pt-3 pr-1 text-sm text-zinc-400 custom-scrollbar">
          {playlists.map((playlist) => {
            const isActive = pathname === `/playlist/${playlist.id}`;
            return (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className={cn(
                  'flex items-center justify-between px-2 py-2 rounded text-xs transition truncate group',
                  isActive
                    ? 'text-spotify-green font-semibold bg-white/10'
                    : 'hover:text-white hover:bg-white/5'
                )}
              >
                <div className="flex items-center space-x-2 truncate">
                  <ListMusic className="w-3.5 h-3.5 shrink-0 text-zinc-500 group-hover:text-zinc-300" />
                  <span className="truncate">{playlist.title}</span>
                </div>
                {playlist.isCustom && (
                  <span className="text-[10px] text-zinc-500 bg-zinc-800/80 px-1 py-0.5 rounded shrink-0">
                    Custom
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Cloud Status Footer Trigger */}
        <div className="pt-3 border-t border-zinc-800">
          <button
            onClick={() => setIsCloudStatusModalOpen(true)}
            className="w-full flex items-center justify-between text-xs px-2.5 py-2 rounded-md bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition border border-zinc-800"
          >
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-amber-400" />
              <span>AWS Cloud Status</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      </div>
    </aside>
  );
};
