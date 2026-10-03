'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Heart, Play, Shuffle, Clock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { TrackRow } from '@/components/cards/TrackRow';
import { usePlayer } from '@/context/PlayerContext';
import { formatTotalDuration } from '@/lib/utils';

export default function LikedPage() {
  const { tracks, likedTrackIds, playTrack, toggleShuffle, shuffle } = usePlayer();

  const likedTracks = useMemo(
    () => tracks.filter((t) => likedTrackIds.includes(t.id)),
    [tracks, likedTrackIds]
  );

  const handlePlayAll = () => {
    if (likedTracks.length > 0) {
      playTrack(likedTracks[0], likedTracks);
    }
  };

  const handleShufflePlay = () => {
    if (likedTracks.length > 0) {
      const randomTrack = likedTracks[Math.floor(Math.random() * likedTracks.length)];
      toggleShuffle();
      playTrack(randomTrack, likedTracks);
    }
  };

  return (
    <div className="flex-1 pb-28">
      <Header />

      {/* Gradient hero header */}
      <div className="bg-gradient-to-b from-indigo-800 via-indigo-900/60 to-spotify-dark px-6 pt-8 pb-6">
        <div className="flex items-end space-x-6">
          {/* Cover Art */}
          <div className="w-48 h-48 rounded-lg shadow-2xl bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800 flex items-center justify-center shrink-0">
            <Heart className="w-24 h-24 fill-white text-white opacity-90" />
          </div>

          {/* Info */}
          <div className="space-y-2 pb-2">
            <span className="text-xs uppercase font-bold tracking-widest text-zinc-200">
              Playlist
            </span>
            <h1 className="text-5xl font-black text-white tracking-tight">Liked Songs</h1>
            <div className="flex items-center space-x-2 text-sm text-zinc-300">
              <span className="font-semibold text-white">SoundStream</span>
              <span className="text-zinc-500">•</span>
              <span>{likedTracks.length} songs</span>
              {likedTracks.length > 0 && (
                <>
                  <span className="text-zinc-500">•</span>
                  <span>{formatTotalDuration(likedTracks)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="px-6 py-4 flex items-center space-x-4 bg-gradient-to-b from-indigo-900/20 to-transparent">
        <button
          onClick={handlePlayAll}
          disabled={likedTracks.length === 0}
          className="w-14 h-14 rounded-full bg-spotify-green hover:bg-spotify-green-hover flex items-center justify-center text-black shadow-xl hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Play all liked songs"
        >
          <Play className="w-6 h-6 fill-black text-black ml-0.5" />
        </button>

        <button
          onClick={handleShufflePlay}
          disabled={likedTracks.length === 0}
          className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Shuffle play"
        >
          <Shuffle className="w-5 h-5" />
        </button>
      </div>

      {/* Track List */}
      <div className="px-6">
        {likedTracks.length > 0 ? (
          <div>
            {/* Table header */}
            <div className="grid grid-cols-[16px_1fr_1fr_80px] gap-4 px-4 mb-2 text-xs font-medium text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2">
              <span>#</span>
              <span>Title</span>
              <span className="hidden md:block">Album</span>
              <span className="flex justify-end">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="divide-y divide-zinc-800/30 mt-2">
              {likedTracks.map((track, idx) => (
                <TrackRow key={track.id} track={track} index={idx} playlistContext={likedTracks} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-24 space-y-4">
            <Heart className="w-16 h-16 text-zinc-700 mx-auto" />
            <h3 className="text-xl font-bold text-white">Songs you like will appear here</h3>
            <p className="text-sm text-zinc-400 max-w-xs mx-auto">
              Save songs by tapping the heart icon while browsing or listening.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
