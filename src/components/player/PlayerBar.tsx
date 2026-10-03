'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  ListMusic,
  Activity,
  Maximize2,
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { formatTime, cn } from '@/lib/utils';
import { WaveformVisualizer } from './WaveformVisualizer';

export const PlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    likedTrackIds,
    isQueueOpen,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    setIsQueueOpen,
  } = usePlayer();

  const [showVisualizer, setShowVisualizer] = useState(true);

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seekTo(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-24 bg-black border-t border-zinc-800/80 px-4 flex items-center justify-between z-40 select-none text-white shadow-2xl">
      {/* LEFT: Currently Playing Track Info */}
      <div className="flex items-center space-x-3 w-1/4 min-w-[200px] max-w-[320px]">
        <div className="relative w-14 h-14 rounded-md overflow-hidden bg-zinc-800 shrink-0 group shadow-md">
          {currentTrack.coverUrl ? (
            <Image
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              fill
              className="object-cover"
              sizes="56px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
              <ListMusic className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm text-white truncate hover:underline cursor-pointer">
            {currentTrack.title}
          </span>
          <span className="text-xs text-zinc-400 truncate hover:underline cursor-pointer">
            {currentTrack.artist}
          </span>
          {currentTrack.isUserUploaded && (
            <span className="text-[10px] text-amber-400 font-medium tracking-tight">
              S3 Uploaded
            </span>
          )}
        </div>

        <button
          onClick={() => toggleLike(currentTrack.id)}
          className={cn(
            'p-1.5 rounded-full transition-transform active:scale-125',
            isLiked ? 'text-spotify-green' : 'text-zinc-400 hover:text-white'
          )}
          title={isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
        >
          <Heart className={cn('w-4 h-4', isLiked && 'fill-spotify-green')} />
        </button>
      </div>

      {/* CENTER: Playback Controls & Progress Timeline */}
      <div className="flex flex-col items-center max-w-[650px] w-2/4 px-4">
        {/* Buttons row */}
        <div className="flex items-center space-x-5 mb-1.5">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={cn(
              'relative p-1.5 transition hover:scale-110',
              shuffle ? 'text-spotify-green' : 'text-zinc-400 hover:text-white'
            )}
            title="Enable Shuffle"
          >
            <Shuffle className="w-4 h-4" />
            {shuffle && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-spotify-green" />
            )}
          </button>

          {/* Previous Track */}
          <button
            onClick={prevTrack}
            className="text-zinc-400 hover:text-white transition hover:scale-110"
            title="Previous Song"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play / Pause main button */}
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black text-black" />
            ) : (
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={nextTrack}
            className="text-zinc-400 hover:text-white transition hover:scale-110"
            title="Next Song"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={cn(
              'relative p-1.5 transition hover:scale-110',
              repeatMode !== 'off' ? 'text-spotify-green' : 'text-zinc-400 hover:text-white'
            )}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
            {repeatMode !== 'off' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-spotify-green" />
            )}
          </button>
        </div>

        {/* Scrubber Timeline */}
        <div className="w-full flex items-center space-x-2 text-[11px] text-zinc-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <div className="relative flex-1 flex items-center group cursor-pointer">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onChange={handleSeekChange}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white group-hover:accent-spotify-green transition-all"
              style={{
                background: `linear-gradient(to right, #1DB954 ${progressPercent}%, #404040 ${progressPercent}%)`,
              }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* RIGHT: Visualizer, Queue Drawer, Volume & Extras */}
      <div className="flex items-center justify-end space-x-3 w-1/4 min-w-[200px] max-w-[320px]">
        {/* Waveform Visualizer Toggle */}
        <div className="hidden lg:flex items-center">
          {showVisualizer && <WaveformVisualizer isPlaying={isPlaying} barsCount={12} />}
          <button
            onClick={() => setShowVisualizer(!showVisualizer)}
            className={cn(
              'p-1.5 rounded transition',
              showVisualizer ? 'text-spotify-green' : 'text-zinc-500 hover:text-zinc-300'
            )}
            title="Toggle Audio Visualizer"
          >
            <Activity className="w-4 h-4" />
          </button>
        </div>

        {/* Queue Drawer Button */}
        <button
          onClick={() => setIsQueueOpen(!isQueueOpen)}
          className={cn(
            'p-1.5 rounded transition',
            isQueueOpen ? 'text-spotify-green' : 'text-zinc-400 hover:text-white'
          )}
          title="Play Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Volume controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="text-zinc-400 hover:text-white transition p-1"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white hover:accent-spotify-green transition-all"
            style={{
              background: `linear-gradient(to right, #1DB954 ${
                (isMuted ? 0 : volume) * 100
              }%, #404040 ${(isMuted ? 0 : volume) * 100}%)`,
            }}
          />
        </div>
      </div>
    </footer>
  );
};
