'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track, Playlist } from '@/types';
import { INITIAL_TRACKS, INITIAL_PLAYLISTS } from '@/lib/tracks-data';

interface PlayerContextType {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  queue: Track[];
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  likedTrackIds: string[];
  playlists: Playlist[];
  isUploadModalOpen: boolean;
  isCloudStatusModalOpen: boolean;
  isQueueOpen: boolean;
  
  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (trackId: string) => void;
  createPlaylist: (title: string, description?: string) => string;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  addUploadedTrack: (track: Track) => void;
  setIsUploadModalOpen: (open: boolean) => void;
  setIsCloudStatusModalOpen: (open: boolean) => void;
  setIsQueueOpen: (open: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(['track-1', 'track-3']);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(INITIAL_TRACKS[0]?.duration || 180);
  const [queue, setQueue] = useState<Track[]>(INITIAL_TRACKS);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCloudStatusModalOpen, setIsCloudStatusModalOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Hidden audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load persisted state from localStorage on client mount
  useEffect(() => {
    try {
      const storedLikes = localStorage.getItem('soundstream_likes');
      if (storedLikes) {
        setLikedTrackIds(JSON.parse(storedLikes));
      }

      const storedCustomPlaylists = localStorage.getItem('soundstream_playlists');
      if (storedCustomPlaylists) {
        const custom = JSON.parse(storedCustomPlaylists);
        setPlaylists([...INITIAL_PLAYLISTS, ...custom]);
      }

      const storedUploads = localStorage.getItem('soundstream_uploaded_tracks');
      if (storedUploads) {
        const userTracks: Track[] = JSON.parse(storedUploads);
        setTracks([...userTracks, ...INITIAL_TRACKS]);
      }
    } catch (e) {
      console.error('Error loading saved player state:', e);
    }
  }, []);

  // Initialize Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle track ended
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeatMode, currentTrack, queue, shuffle]);

  const playTrack = (track: Track, newQueue?: Track[]) => {
    if (!audioRef.current) return;

    if (newQueue) {
      setQueue(newQueue);
    } else if (!queue.some((t) => t.id === track.id)) {
      setQueue((prev) => [track, ...prev]);
    }

    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      return;
    }

    setCurrentTrack(track);
    audioRef.current.src = track.audioUrl;
    audioRef.current.load();
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.warn('Playback error / autoplay blocked:', err);
        setIsPlaying(false);
      });
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (!audioRef.current.src) {
        audioRef.current.src = currentTrack.audioUrl;
      }
      audioRef.current.play().catch(console.error);
    }
  };

  const nextTrack = () => {
    if (!currentTrack || queue.length === 0) return;

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    let nextIndex = 0;

    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      if (currentIndex < queue.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        // end of queue
        setIsPlaying(false);
        return;
      }
    }

    playTrack(queue[nextIndex]);
  };

  const prevTrack = () => {
    if (!audioRef.current || !currentTrack || queue.length === 0) return;

    // If more than 3 seconds in, restart current track
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
    playTrack(queue[prevIndex]);
  };

  const seekTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (isMuted && clamped > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const toggleShuffle = () => {
    setShuffle((prev) => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const toggleLike = (trackId: string) => {
    setLikedTrackIds((prev) => {
      const next = prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId];
      try {
        localStorage.setItem('soundstream_likes', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const createPlaylist = (title: string, description: string = ''): string => {
    const id = `custom-${Date.now()}`;
    const newPlaylist: Playlist = {
      id,
      title,
      description,
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      gradient: 'from-emerald-800 via-zinc-900 to-spotify-dark',
      tracks: [],
      isCustom: true,
    };

    setPlaylists((prev) => {
      const next = [...prev, newPlaylist];
      try {
        const customOnly = next.filter((p) => p.isCustom);
        localStorage.setItem('soundstream_playlists', JSON.stringify(customOnly));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    return id;
  };

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    setPlaylists((prev) => {
      const next = prev.map((pl) => {
        if (pl.id === playlistId) {
          if (pl.tracks.some((t) => t.id === track.id)) return pl;
          return { ...pl, tracks: [...pl.tracks, track] };
        }
        return pl;
      });
      try {
        const customOnly = next.filter((p) => p.isCustom);
        localStorage.setItem('soundstream_playlists', JSON.stringify(customOnly));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) => {
      const next = prev.map((pl) => {
        if (pl.id === playlistId) {
          return { ...pl, tracks: pl.tracks.filter((t) => t.id !== trackId) };
        }
        return pl;
      });
      try {
        const customOnly = next.filter((p) => p.isCustom);
        localStorage.setItem('soundstream_playlists', JSON.stringify(customOnly));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const addUploadedTrack = (newTrack: Track) => {
    setTracks((prev) => [newTrack, ...prev]);
    setQueue((prev) => [newTrack, ...prev]);

    try {
      const storedUploads = localStorage.getItem('soundstream_uploaded_tracks');
      const existing: Track[] = storedUploads ? JSON.parse(storedUploads) : [];
      localStorage.setItem('soundstream_uploaded_tracks', JSON.stringify([newTrack, ...existing]));
    } catch (e) {
      console.error(e);
    }

    // Auto-play newly uploaded track
    playTrack(newTrack);
  };

  return (
    <PlayerContext.Provider
      value={{
        tracks,
        currentTrack,
        isPlaying,
        volume,
        isMuted,
        currentTime,
        duration,
        queue,
        shuffle,
        repeatMode,
        likedTrackIds,
        playlists,
        isUploadModalOpen,
        isCloudStatusModalOpen,
        isQueueOpen,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seekTo,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        toggleLike,
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        addUploadedTrack,
        setIsUploadModalOpen,
        setIsCloudStatusModalOpen,
        setIsQueueOpen,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
