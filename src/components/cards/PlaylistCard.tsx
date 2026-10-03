'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { Playlist } from '@/types';
import { usePlayer } from '@/context/PlayerContext';

export const PlaylistCard: React.FC<{ playlist: Playlist }> = ({ playlist }) => {
  const { playTrack } = usePlayer();

  const handlePlayFirst = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  return (
    <Link
      href={`/playlist/${playlist.id}`}
      className="group relative bg-spotify-surface/40 hover:bg-spotify-card-hover p-4 rounded-lg transition-all duration-300 flex flex-col cursor-pointer border border-transparent hover:border-zinc-700/40"
    >
      {/* Cover image container */}
      <div className="relative aspect-square w-full rounded-md overflow-hidden bg-zinc-800 mb-4 shadow-lg">
        <Image
          src={playlist.coverUrl}
          alt={playlist.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          unoptimized
        />

        {/* Floating Green Play Button on Hover */}
        <button
          onClick={handlePlayFirst}
          className="absolute right-3 bottom-3 w-12 h-12 rounded-full bg-spotify-green flex items-center justify-center text-black shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 hover:bg-spotify-green-hover"
          title={`Play ${playlist.title}`}
        >
          <Play className="w-5 h-5 fill-black text-black ml-0.5" />
        </button>
      </div>

      {/* Info */}
      <h3 className="font-bold text-white text-sm truncate mb-1">{playlist.title}</h3>
      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
        {playlist.description || `${playlist.tracks.length} songs`}
      </p>
    </Link>
  );
};
