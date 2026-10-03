'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Sparkles, Heart, CloudUpload, Radio } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { PlaylistCard } from '@/components/cards/PlaylistCard';
import { TrackRow } from '@/components/cards/TrackRow';
import { usePlayer } from '@/context/PlayerContext';
import type { Playlist } from '@/types';

export default function HomePage() {
  const { tracks, playlists, likedTrackIds, playTrack, setIsUploadModalOpen } = usePlayer();

  // Dynamic greeting based on user's current hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Quick Play items for top Spotify grid
  type QuickItem = {
    id: string;
    title: string;
    href: string;
    coverUrl: string;
    isLikedCollection?: boolean;
    playlistObj?: Playlist;
  };
  const quickItems = useMemo((): QuickItem[] => {
    return [
      {
        id: 'liked-songs',
        title: 'Liked Songs',
        href: '/liked',
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
        isLikedCollection: true,
      },
      ...playlists.slice(0, 5).map((p) => ({
        id: p.id,
        title: p.title,
        href: `/playlist/${p.id}`,
        coverUrl: p.coverUrl,
        playlistObj: p,
      })),
    ];
  }, [playlists]);

  const userUploadedTracks = useMemo(() => {
    return tracks.filter((t) => t.isUserUploaded);
  }, [tracks]);

  return (
    <div className="flex-1 pb-28">
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <div className="px-6 py-4 space-y-8">
        {/* Hero Banner / Greeting */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              {greeting}
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h1>
          </div>

          {/* Quick Play 6-grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group flex items-center bg-white/5 hover:bg-white/10 rounded-md overflow-hidden transition-all duration-200 cursor-pointer shadow-sm relative pr-4"
              >
                <div className="relative w-16 h-16 shrink-0 bg-zinc-800">
                  <Image
                    src={item.coverUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                  {item.isLikedCollection && (
                    <div className="absolute inset-0 bg-indigo-900/60 flex items-center justify-center">
                      <Heart className="w-6 h-6 fill-white text-white" />
                    </div>
                  )}
                </div>

                <span className="font-bold text-sm text-white px-3 truncate flex-1">
                  {item.title}
                </span>

                {/* Hover Play Button */}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (item.playlistObj && item.playlistObj.tracks.length > 0) {
                      playTrack(item.playlistObj.tracks[0], item.playlistObj.tracks);
                    } else if (item.isLikedCollection && likedTrackIds.length > 0) {
                      const likedTrack = tracks.find((t) => likedTrackIds.includes(t.id));
                      if (likedTrack) playTrack(likedTrack);
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-spotify-green flex items-center justify-center text-black shadow-lg opacity-0 group-hover:opacity-100 hover:scale-105 transition-all"
                  title="Play"
                >
                  <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* User Uploads (AWS S3) Section if available */}
        {userUploadedTracks.length > 0 && (
          <section className="space-y-3 bg-gradient-to-r from-amber-950/20 via-zinc-900/40 to-transparent p-4 rounded-xl border border-amber-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CloudUpload className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-bold text-white">Your Cloud Uploads (AWS S3)</h2>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                + Upload More
              </button>
            </div>
            <div className="divide-y divide-zinc-800/40">
              {userUploadedTracks.map((track, idx) => (
                <TrackRow key={track.id} track={track} index={idx} playlistContext={userUploadedTracks} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Playlists */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white hover:underline cursor-pointer">
                Featured Playlists
              </h2>
              <p className="text-xs text-zinc-400">Curated beats and moods updated today</p>
            </div>
            <Link
              href="/library"
              className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider"
            >
              Show all
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {playlists.slice(0, 4).map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} />
            ))}
          </div>
        </section>

        {/* Trending Tracks */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Trending on SoundStream</h2>
              <p className="text-xs text-zinc-400">The most streamed songs this week</p>
            </div>
          </div>

          <div className="bg-spotify-surface/40 rounded-xl p-2 border border-zinc-800/50">
            <div className="divide-y divide-zinc-800/30">
              {tracks.slice(0, 6).map((track, idx) => (
                <TrackRow key={track.id} track={track} index={idx} playlistContext={tracks} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
