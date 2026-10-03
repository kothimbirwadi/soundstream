'use client';

import React from 'react';
import Image from 'next/image';
import { X, Play, Music, ListMusic } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { formatTime, cn } from '@/lib/utils';

export const QueueDrawer: React.FC = () => {
  const { queue, currentTrack, isQueueOpen, setIsQueueOpen, playTrack, isPlaying } = usePlayer();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed top-16 right-0 bottom-24 w-80 bg-zinc-950/95 border-l border-zinc-800 backdrop-blur-md z-30 flex flex-col p-4 shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <ListMusic className="w-5 h-5 text-spotify-green" />
          <h2 className="font-bold text-base text-white">Queue</h2>
        </div>
        <button
          onClick={() => setIsQueueOpen(false)}
          className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pt-3 space-y-4 custom-scrollbar">
        {/* Now Playing */}
        {currentTrack && (
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
              Now Playing
            </span>
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-zinc-900 border border-spotify-green/30">
              <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                <Image
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-spotify-green truncate">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-zinc-400 truncate">{currentTrack.artist}</p>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {formatTime(currentTrack.duration)}
              </span>
            </div>
          </div>
        )}

        {/* Up Next */}
        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
            Next in Queue ({queue.length})
          </span>
          <div className="space-y-1">
            {queue.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => playTrack(track)}
                  className={cn(
                    'flex items-center space-x-3 p-2 rounded-md cursor-pointer group transition',
                    isCurrent
                      ? 'bg-zinc-900/90 text-spotify-green'
                      : 'hover:bg-zinc-900/60 text-zinc-300 hover:text-white'
                  )}
                >
                  <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 bg-zinc-800">
                    <Image
                      src={track.coverUrl}
                      alt={track.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <Play className="w-4 h-4 fill-white text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-xs font-medium truncate', isCurrent && 'font-bold text-spotify-green')}>
                      {track.title}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {formatTime(track.duration)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
