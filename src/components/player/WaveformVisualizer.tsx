'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export const WaveformVisualizer: React.FC<{ isPlaying: boolean; barsCount?: number }> = ({
  isPlaying,
  barsCount = 20,
}) => {
  // Pre-generate bar height variations
  const heights = [35, 60, 90, 45, 75, 100, 50, 80, 65, 95, 40, 70, 85, 55, 90, 30, 60, 75, 50, 65];

  return (
    <div className="flex items-end justify-center space-x-[2px] h-6 px-2">
      {Array.from({ length: barsCount }).map((_, index) => {
        const heightPercent = heights[index % heights.length];
        const animationDelay = `${(index * 0.08) % 1.2}s`;
        const animationDuration = `${0.6 + ((index * 0.13) % 0.8)}s`;

        return (
          <span
            key={index}
            className={cn(
              'w-[3px] rounded-full transition-all duration-300',
              isPlaying ? 'bg-spotify-green' : 'bg-zinc-600'
            )}
            style={{
              height: isPlaying ? `${heightPercent}%` : '20%',
              animation: isPlaying ? `wave ${animationDuration} ease-in-out infinite` : 'none',
              animationDelay: isPlaying ? animationDelay : '0s',
            }}
          />
        );
      })}
    </div>
  );
};
