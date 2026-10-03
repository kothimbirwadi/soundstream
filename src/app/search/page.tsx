'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search as SearchIcon, Play, Music, Sparkles } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { TrackRow } from '@/components/cards/TrackRow';
import { usePlayer } from '@/context/PlayerContext';
import { GENRES } from '@/lib/tracks-data';

export default function SearchPage() {
  const { tracks, playTrack } = usePlayer();
  const [query, setQuery] = useState('');

  // Filter tracks matching query
  const filteredTracks = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q)
    );
  }, [query, tracks]);

  const topResult = filteredTracks[0];

  return (
    <div className="flex-1 pb-28">
      {/* Top Header with live Search Input */}
      <Header>
        <div className="relative w-72 sm:w-96">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to play?"
            className="w-full bg-zinc-800 hover:bg-zinc-700/80 focus:bg-zinc-800 text-white text-xs rounded-full pl-9 pr-4 py-2 border border-transparent focus:border-zinc-500 focus:outline-none transition shadow-inner"
            autoFocus
          />
        </div>
      </Header>

      <div className="px-6 py-6 space-y-8">
        {/* If user is typing query */}
        {query.trim() ? (
          <div>
            {filteredTracks.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Top Result Card */}
                  {topResult && (
                    <div className="lg:col-span-1 space-y-3">
                      <h2 className="text-xl font-bold text-white">Top result</h2>
                      <div className="group relative bg-spotify-surface/60 hover:bg-spotify-card-hover p-5 rounded-xl transition duration-300 border border-zinc-800 cursor-pointer">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden mb-4 shadow-lg">
                          <Image
                            src={topResult.coverUrl}
                            alt={topResult.title}
                            fill
                            className="object-cover"
                            sizes="96px"
                            unoptimized
                          />
                        </div>
                        <h3 className="text-xl font-bold text-white truncate mb-1">
                          {topResult.title}
                        </h3>
                        <p className="text-xs text-zinc-400 mb-3">
                          Song • <span className="text-white font-medium">{topResult.artist}</span>
                        </p>
                        <span className="text-[11px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                          {topResult.genre}
                        </span>

                        {/* Floating Play button */}
                        <button
                          onClick={() => playTrack(topResult, filteredTracks)}
                          className="absolute right-5 bottom-5 w-12 h-12 rounded-full bg-spotify-green flex items-center justify-center text-black shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
                        >
                          <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Songs Result List */}
                  <div className="lg:col-span-2 space-y-3">
                    <h2 className="text-xl font-bold text-white">Songs</h2>
                    <div className="bg-spotify-surface/40 rounded-xl p-2 border border-zinc-800/40 divide-y divide-zinc-800/30">
                      {filteredTracks.slice(0, 5).map((track, idx) => (
                        <TrackRow
                          key={track.id}
                          track={track}
                          index={idx}
                          playlistContext={filteredTracks}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional results if more than 5 */}
                {filteredTracks.length > 5 && (
                  <div className="space-y-3 pt-4">
                    <h3 className="text-lg font-bold text-white">More Tracks</h3>
                    <div className="bg-spotify-surface/40 rounded-xl p-2 border border-zinc-800/40 divide-y divide-zinc-800/30">
                      {filteredTracks.slice(5).map((track, idx) => (
                        <TrackRow
                          key={track.id}
                          track={track}
                          index={idx + 5}
                          playlistContext={filteredTracks}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 space-y-3">
                <Music className="w-12 h-12 text-zinc-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">No results found for &quot;{query}&quot;</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Please make sure your words are spelled correctly, or try searching for a different
                  artist, track, or genre.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Default Browse All Categories Grid */
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Browse all</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {GENRES.map((genre) => (
                <div
                  key={genre.name}
                  onClick={() => setQuery(genre.name)}
                  className={`group relative h-44 rounded-xl overflow-hidden p-4 cursor-pointer transition transform hover:scale-[1.02] shadow-lg ${genre.color}`}
                >
                  <h3 className="text-xl font-bold text-white tracking-tight break-words max-w-[70%]">
                    {genre.name}
                  </h3>
                  <div className="absolute -right-4 -bottom-2 w-28 h-28 rotate-25 shadow-2xl overflow-hidden rounded group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={genre.image}
                      alt={genre.name}
                      fill
                      className="object-cover"
                      sizes="120px"
                      unoptimized
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
