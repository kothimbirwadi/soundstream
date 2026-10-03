'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Heart, CloudUpload, Library as LibraryIcon, Music } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { PlaylistCard } from '@/components/cards/PlaylistCard';
import { TrackRow } from '@/components/cards/TrackRow';
import { usePlayer } from '@/context/PlayerContext';
import { cn } from '@/lib/utils';

export default function LibraryPage() {
  const {
    playlists,
    tracks,
    likedTrackIds,
    createPlaylist,
    setIsUploadModalOpen,
  } = usePlayer();

  const [filter, setFilter] = useState<'all' | 'playlists' | 'liked' | 'uploads'>('all');

  const userUploadedTracks = useMemo(() => {
    return tracks.filter((t) => t.isUserUploaded);
  }, [tracks]);

  const likedTracks = useMemo(() => {
    return tracks.filter((t) => likedTrackIds.includes(t.id));
  }, [tracks, likedTrackIds]);

  const handleNewPlaylist = () => {
    const num = playlists.filter((p) => p.isCustom).length + 1;
    createPlaylist(`My Playlist #${num}`, 'Custom playlist');
  };

  return (
    <div className="flex-1 pb-28">
      <Header />

      <div className="px-6 py-6 space-y-6">
        {/* Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
              <LibraryIcon className="w-5 h-5 text-spotify-green" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Your Library</h1>
              <p className="text-xs text-zinc-400">Manage your playlists, liked tracks, and cloud music</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleNewPlaylist}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition border border-zinc-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Playlist</span>
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-spotify-green hover:bg-spotify-green-hover text-black text-xs font-bold transition shadow"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>Upload to AWS</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'playlists', label: `Playlists (${playlists.length})` },
            { id: 'liked', label: `Liked Songs (${likedTrackIds.length})` },
            { id: 'uploads', label: `Cloud Uploads (${userUploadedTracks.length})` },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-medium transition shrink-0',
                filter === item.id
                  ? 'bg-white text-black font-semibold'
                  : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Views */}
        {filter === 'all' && (
          <div className="space-y-8">
            {/* Playlists Grid */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white">Your Playlists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {playlists.map((pl) => (
                  <PlaylistCard key={pl.id} playlist={pl} />
                ))}
              </div>
            </div>

            {/* Cloud Uploads */}
            {userUploadedTracks.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CloudUpload className="w-4 h-4 text-amber-400" />
                  AWS S3 Songs
                </h2>
                <div className="bg-spotify-surface/40 rounded-xl p-2 border border-zinc-800/40 divide-y divide-zinc-800/30">
                  {userUploadedTracks.map((track, idx) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={idx}
                      playlistContext={userUploadedTracks}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {filter === 'playlists' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {playlists.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} />
            ))}
          </div>
        )}

        {filter === 'liked' && (
          <div>
            {likedTracks.length > 0 ? (
              <div className="bg-spotify-surface/40 rounded-xl p-2 border border-zinc-800/40 divide-y divide-zinc-800/30">
                {likedTracks.map((track, idx) => (
                  <TrackRow key={track.id} track={track} index={idx} playlistContext={likedTracks} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 space-y-3">
                <Heart className="w-10 h-10 text-zinc-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No liked songs yet</h3>
                <p className="text-xs text-zinc-400">
                  Tap the heart icon on any song to save it to your collection.
                </p>
              </div>
            )}
          </div>
        )}

        {filter === 'uploads' && (
          <div>
            {userUploadedTracks.length > 0 ? (
              <div className="bg-spotify-surface/40 rounded-xl p-2 border border-zinc-800/40 divide-y divide-zinc-800/30">
                {userUploadedTracks.map((track, idx) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    index={idx}
                    playlistContext={userUploadedTracks}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 space-y-3 bg-zinc-900/40 rounded-xl border border-zinc-800/60 p-6">
                <CloudUpload className="w-10 h-10 text-zinc-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No tracks uploaded yet</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Upload audio files directly to AWS S3 storage with pre-signed streaming links!
                </p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-spotify-green hover:bg-spotify-green-hover text-black text-xs font-bold transition inline-flex items-center gap-1.5"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  Upload First Track
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
