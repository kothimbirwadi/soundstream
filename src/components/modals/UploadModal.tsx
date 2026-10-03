'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  Upload,
  Music,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  Cloud,
  Sparkles,
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { Track } from '@/types';

export const UploadModal: React.FC = () => {
  const { isUploadModalOpen, setIsUploadModalOpen, addUploadedTrack } = usePlayer();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('Lo-Fi Chill');
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadModalOpen) return null;

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      // Auto fill title from filename if empty
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !title) return;

    setIsUploading(true);
    setUploadProgress(10);
    setStatusMessage('Initiating AWS S3 Presigned URL request...');

    try {
      let finalAudioUrl = '';
      let finalCoverUrl =
        coverPreview ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
      let s3Key = '';

      // 1. Request presigned URL for audio file
      const presignRes = await fetch('/api/s3/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: audioFile.name,
          contentType: audioFile.type || 'audio/mpeg',
          folder: 'tracks',
        }),
      });

      const presignData = await presignRes.json();
      setUploadProgress(40);

      if (presignData.uploadUrl) {
        // REAL AWS S3 Upload via Pre-signed PUT
        setStatusMessage('Streaming audio binary directly to AWS S3 bucket...');
        const s3Upload = await fetch(presignData.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': audioFile.type || 'audio/mpeg',
          },
          body: audioFile,
        });

        if (!s3Upload.ok) {
          throw new Error(`S3 Upload failed with status ${s3Upload.status}`);
        }

        finalAudioUrl = presignData.fileUrl;
        s3Key = presignData.key;
        setUploadProgress(80);
      } else {
        // DEMO / SIMULATION MODE (No AWS credentials set)
        setStatusMessage('Saving track in local storage simulation...');
        finalAudioUrl = URL.createObjectURL(audioFile);
        s3Key = presignData.key || `local-${Date.now()}`;
        setUploadProgress(80);
      }

      // 2. Handle cover image upload if present
      if (coverFile) {
        setStatusMessage('Uploading artwork...');
        try {
          const coverPresign = await fetch('/api/s3/presign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: coverFile.name,
              contentType: coverFile.type || 'image/jpeg',
              folder: 'covers',
            }),
          });
          const coverData = await coverPresign.json();
          if (coverData.uploadUrl) {
            await fetch(coverData.uploadUrl, {
              method: 'PUT',
              headers: { 'Content-Type': coverFile.type || 'image/jpeg' },
              body: coverFile,
            });
            finalCoverUrl = coverData.fileUrl;
          }
        } catch (err) {
          console.warn('Cover upload fallback to preview:', err);
        }
      }

      setUploadProgress(100);
      setStatusMessage('Upload complete!');
      setUploadSuccess(true);

      // Create new track object
      const newTrack: Track = {
        id: `uploaded-${Date.now()}`,
        title,
        artist: artist || 'Unknown Artist',
        album: album || 'Single Release',
        duration: 180, // Default duration estimation
        audioUrl: finalAudioUrl,
        coverUrl: finalCoverUrl,
        genre,
        uploadedAt: new Date().toISOString(),
        isUserUploaded: true,
        s3Key,
      };

      setTimeout(() => {
        addUploadedTrack(newTrack);
        setIsUploading(false);
        setIsUploadModalOpen(false);
        // Reset fields
        setTitle('');
        setArtist('');
        setAlbum('');
        setAudioFile(null);
        setCoverFile(null);
        setCoverPreview(null);
        setUploadSuccess(false);
      }, 1000);
    } catch (error: any) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setStatusMessage(error.message || 'Upload failed. Please check S3 settings.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={() => !isUploading && setIsUploadModalOpen(false)}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition"
          disabled={isUploading}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-spotify-green/20 flex items-center justify-center text-spotify-green">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              Upload Track to AWS S3
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-zinc-400">
              Direct pre-signed binary upload to cloud storage
            </p>
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="space-y-4">
          {/* File Picker: Audio Track */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Audio File (.mp3, .wav, .aac) *
            </label>
            <div
              onClick={() => audioInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 hover:border-spotify-green/80 rounded-lg p-4 text-center cursor-pointer transition bg-zinc-800/40 hover:bg-zinc-800/70"
            >
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                onChange={handleAudioChange}
                className="hidden"
                disabled={isUploading}
              />
              {audioFile ? (
                <div className="flex items-center justify-center space-x-2 text-spotify-green text-sm font-medium">
                  <Music className="w-4 h-4" />
                  <span className="truncate max-w-xs">{audioFile.name}</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-6 h-6 mx-auto text-zinc-400" />
                  <p className="text-xs text-zinc-300 font-medium">
                    Click to browse or drop audio file
                  </p>
                  <p className="text-[10px] text-zinc-500">Supports standard audio formats</p>
                </div>
              )}
            </div>
          </div>

          {/* Cover Art & Track Info Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Cover art preview & picker */}
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Artwork
              </label>
              <div
                onClick={() => coverInputRef.current?.click()}
                className="relative aspect-square rounded-lg border border-zinc-700 hover:border-zinc-500 bg-zinc-800 overflow-hidden flex items-center justify-center cursor-pointer group"
              >
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                  disabled={isUploading}
                />
                {coverPreview ? (
                  <Image
                    src={coverPreview}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-center p-2 text-zinc-500 group-hover:text-zinc-300 transition">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-[10px] block">Add Cover</span>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Inputs */}
            <div className="col-span-2 space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Track Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Neon Horizon"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-spotify-green transition"
                  disabled={isUploading}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Artist Name
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="e.g. Luna Solaris"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-spotify-green transition"
                  disabled={isUploading}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Genre
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-spotify-green transition"
                  disabled={isUploading}
                >
                  <option value="Lo-Fi Chill">Lo-Fi Chill</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Synthwave">Synthwave</option>
                  <option value="Ambient">Ambient</option>
                  <option value="Acoustic">Acoustic</option>
                  <option value="Hip-Hop">Hip-Hop</option>
                  <option value="Pop">Pop</option>
                  <option value="Rock">Rock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Progress / Status display */}
          {isUploading && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-spotify-green" />
                  {statusMessage}
                </span>
                <span className="font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-spotify-green transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className="flex items-center space-x-2 text-emerald-400 text-xs bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/50">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Track successfully stored and added to your SoundStream queue!</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !audioFile || !title}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-full text-xs font-bold bg-spotify-green hover:bg-spotify-green-hover text-black disabled:opacity-50 disabled:cursor-not-allowed transition shadow"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Upload & Play</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
