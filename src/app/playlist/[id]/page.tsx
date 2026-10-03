'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  Play,
  Pause,
  Shuffle,
  Heart,
  MoreHorizontal,
  Clock,
  Pencil,
  Trash2,
  CloudUpload,
  Music,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { TrackRow } from '@/components/cards/TrackRow';
import { usePlayer } from '@/context/PlayerContext';
import { formatTotalDuration, cn } from '@/lib/utils';

export default function PlaylistDetailPage() {
  const params = useParams<{ id: string }>();
  const {
    playlists,
    likedTrackIds,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleLike,
    setIsUploadModalOpen,
  } = usePlayer();

  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const playlist = useMemo(
    () => playlists.find((p) => p.id === params?.id),
    [playlists, params?.id]
  );

  if (!playlist) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-400 pb-28 text-sm">
        <div className="text-center space-y-3">
          <Music className="w-12 h-12 mx-auto text-zinc-600" />
          <p className="font-medium">Playlist not found.</p>
        </div>
      </div>
    );
  }

  const isCurrentPlaylistPlaying =
    isPlaying && playlist.tracks.some((t) => t.id === currentTrack?.id);

  const handleMainPlayButton = () => {
    if (playlist.tracks.length === 0) return;

    if (isCurrentPlaylistPlaying) {
      togglePlay();
    } else if (currentTrack && playlist.tracks.some((t) => t.id === currentTrack.id)) {
      togglePlay();
    } else {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  const handleShuffle = () => {
    if (playlist.tracks.length > 0) {
      const rand = playlist.tracks[Math.floor(Math.random() * playlist.tracks.length)];
      playTrack(rand, playlist.tracks);
    }
  };

  return (
    <div className="flex-1 pb-28">
      <Header />

      {/* Gradient Hero */}
      <div className={`bg-gradient-to-b ${playlist.gradient || 'from-zinc-700 to-spotify-dark'} px-6 pt-8 pb-6`}>
        <div className="flex items-end space-x-6">
          {/* Cover */}
          <div className="relative w-44 h-44 shrink-0 rounded-lg shadow-2xl overflow-hidden bg-zinc-800">
            <Image
              src={playlist.coverUrl}
              alt={playlist.title}
              fill
              className="object-cover"
              sizes="176px"
              unoptimized
            />
          </div>

          {/* Meta */}
          <div className="min-w-0 pb-2 space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-zinc-200">
              {playlist.isCustom ? 'Custom Playlist' : 'Curated Playlist'}
            </span>

            <h1
              className={cn(
                'text-4xl font-black text-white tracking-tight break-words',
                playlist.title.length > 20 ? 'text-2xl' : 'text-4xl'
              )}
            >
              {playlist.title}
            </h1>

            {playlist.description && (
              <p className="text-sm text-zinc-300 max-w-md line-clamp-2">{playlist.description}</p>
            )}

            <div className="flex items-center space-x-2 text-sm text-zinc-300">
              <span className="font-semibold text-white">SoundStream</span>
              <span className="text-zinc-500">•</span>
              <span>{playlist.tracks.length} songs</span>
              {playlist.tracks.length > 0 && (
                <>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">{formatTotalDuration(playlist.tracks)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div className="px-6 py-4 flex items-center space-x-4 bg-gradient-to-b from-zinc-900/60 to-transparent">
        {/* Big Play / Pause */}
        <button
          onClick={handleMainPlayButton}
          disabled={playlist.tracks.length === 0}
          className="w-14 h-14 rounded-full bg-spotify-green hover:bg-spotify-green-hover flex items-center justify-center text-black shadow-xl hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title={isCurrentPlaylistPlaying ? 'Pause' : 'Play'}
        >
          {isCurrentPlaylistPlaying ? (
            <Pause className="w-6 h-6 fill-black text-black" />
          ) : (
            <Play className="w-6 h-6 fill-black text-black ml-0.5" />
          )}
        </button>

        {/* Shuffle */}
        <button
          onClick={handleShuffle}
          disabled={playlist.tracks.length === 0}
          className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
          title="Shuffle playlist"
        >
          <Shuffle className="w-5 h-5" />
        </button>

        {/* Add via Upload */}
        {playlist.isCustom && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white ml-auto px-3 py-1.5 rounded-full hover:bg-white/10 transition border border-zinc-700/50"
          >
            <CloudUpload className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Tracks via S3</span>
          </button>
        )}
      </div>

      {/* Track List */}
      <div className="px-6">
        {playlist.tracks.length > 0 ? (
          <div>
            {/* Column header */}
            <div className="hidden md:grid grid-cols-[16px_1fr_1fr_80px] gap-4 px-4 mb-2 text-xs font-medium text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2">
              <span>#</span>
              <span>Title</span>
              <span>Album</span>
              <span className="flex justify-end">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="divide-y divide-zinc-800/30 mt-2">
              {playlist.tracks.map((track, idx) => (
                <TrackRow
                  key={`${track.id}-${idx}`}
                  track={track}
                  index={idx}
                  playlistContext={playlist.tracks}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-24 space-y-4">
            <Music className="w-16 h-16 text-zinc-700 mx-auto" />
            <h3 className="text-xl font-bold text-white">This playlist is empty</h3>
            <p className="text-sm text-zinc-400 max-w-xs mx-auto">
              Add songs by clicking the ••• menu on any track, or upload music from AWS S3.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold transition"
            >
              <CloudUpload className="w-4 h-4" />
              <span>Upload Track to S3</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
