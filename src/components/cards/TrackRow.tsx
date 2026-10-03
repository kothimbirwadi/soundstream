'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Pause, Heart, MoreHorizontal, Plus, Check } from 'lucide-react';
import { Track } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { formatTime, cn } from '@/lib/utils';

interface TrackRowProps {
  track: Track;
  index: number;
  playlistContext?: Track[];
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, index, playlistContext }) => {
  const {
    currentTrack,
    isPlaying,
    likedTrackIds,
    playlists,
    playTrack,
    togglePlay,
    toggleLike,
    addTrackToPlaylist,
  } = usePlayer();

  const [menuOpen, setMenuOpen] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isCurrentPlaying = isCurrent && isPlaying;
  const isLiked = likedTrackIds.includes(track.id);

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, playlistContext);
    }
  };

  return (
    <div
      className={cn(
        'group flex items-center justify-between px-4 py-2.5 rounded-md hover:bg-white/10 transition cursor-pointer select-none text-sm',
        isCurrent ? 'text-spotify-green bg-white/5' : 'text-zinc-300'
      )}
    >
      {/* LEFT: Index / Play Icon / Title / Artist */}
      <div className="flex items-center space-x-3 min-w-0 flex-1" onClick={handleRowClick}>
        <div className="w-6 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-white font-mono text-xs">
          {isCurrentPlaying ? (
            <div className="flex items-end space-x-[2px] h-3.5">
              <span className="w-1 h-full bg-spotify-green animate-wave1 rounded-full" />
              <span className="w-1 h-2/3 bg-spotify-green animate-wave2 rounded-full" />
              <span className="w-1 h-4/5 bg-spotify-green animate-wave3 rounded-full" />
            </div>
          ) : (
            <>
              <span className="group-hover:hidden">{index + 1}</span>
              <Play className="w-3.5 h-3.5 fill-current hidden group-hover:block text-white" />
            </>
          )}
        </div>

        <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 bg-zinc-800 shadow">
          <Image
            src={track.coverUrl}
            alt={track.title}
            fill
            className="object-cover"
            sizes="40px"
            unoptimized
          />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'font-semibold text-sm truncate',
              isCurrent ? 'text-spotify-green' : 'text-white group-hover:text-white'
            )}
          >
            {track.title}
          </p>
          <p className="text-xs text-zinc-400 truncate group-hover:text-zinc-300">
            {track.artist}
          </p>
        </div>
      </div>

      {/* CENTER: Album & Genre */}
      <div
        className="hidden md:flex items-center flex-1 px-4 text-xs text-zinc-400 truncate"
        onClick={handleRowClick}
      >
        <span className="truncate">{track.album}</span>
      </div>

      <div className="hidden lg:flex items-center w-28 text-xs text-zinc-400 truncate">
        <span className="bg-zinc-800/80 px-2 py-0.5 rounded text-[11px] text-zinc-300 border border-zinc-700/50">
          {track.genre}
        </span>
      </div>

      {/* RIGHT: Like Button, Playlist Dropdown, Duration */}
      <div className="flex items-center space-x-3 shrink-0 ml-4">
        {/* Heart Like */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(track.id);
          }}
          className={cn(
            'p-1.5 rounded-full transition active:scale-125',
            isLiked
              ? 'text-spotify-green'
              : 'text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-white'
          )}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart className={cn('w-4 h-4', isLiked && 'fill-spotify-green')} />
        </button>

        {/* Duration */}
        <span className="w-10 text-right text-xs text-zinc-400 font-mono">
          {formatTime(track.duration)}
        </span>

        {/* Options / Add to Playlist Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 rounded-full text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-6 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 p-1.5 text-xs text-zinc-300 animate-in fade-in"
            >
              <div className="px-2 py-1 text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                Add to playlist
              </div>
              {playlists.map((pl) => {
                const inPlaylist = pl.tracks.some((t) => t.id === track.id);
                return (
                  <button
                    key={pl.id}
                    onClick={() => {
                      addTrackToPlaylist(pl.id, track);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-zinc-800 flex items-center justify-between transition"
                  >
                    <span className="truncate">{pl.title}</span>
                    {inPlaylist ? (
                      <Check className="w-3.5 h-3.5 text-spotify-green" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
