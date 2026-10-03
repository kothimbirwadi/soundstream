'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Cloud, CloudUpload, User, ExternalLink } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';

export const Header: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { setIsUploadModalOpen, setIsCloudStatusModalOpen } = usePlayer();

  return (
    <header className="sticky top-0 z-30 h-16 bg-spotify-dark/80 backdrop-blur-md px-6 flex items-center justify-between border-b border-zinc-800/40">
      {/* Navigation history controls */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition border border-zinc-700/50"
            title="Go Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.forward()}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition border border-zinc-700/50"
            title="Go Forward"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Optional Page-specific header controls (like search input) */}
        {children && <div className="ml-2">{children}</div>}
      </div>

      {/* Right side controls: Cloud status badge, Upload button, User profile */}
      <div className="flex items-center space-x-3">
        {/* Cloud Status Badge */}
        <button
          onClick={() => setIsCloudStatusModalOpen(true)}
          className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-xs text-amber-300 font-medium transition shadow-sm"
          title="Inspect AWS Cloud Integration"
        >
          <Cloud className="w-3.5 h-3.5 text-amber-400" />
          <span>AWS S3 Storage</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-1" />
        </button>

        {/* Upload Song Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold transition shadow"
        >
          <CloudUpload className="w-3.5 h-3.5 text-black" />
          <span>Upload Track</span>
        </button>

        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer transition">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};
