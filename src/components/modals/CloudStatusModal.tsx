'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Layers,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';

export const CloudStatusModal: React.FC = () => {
  const { isCloudStatusModalOpen, setIsCloudStatusModalOpen } = usePlayer();
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/s3/status');
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      setStatus({
        configured: false,
        accessible: false,
        error: err.message,
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (isCloudStatusModalOpen) {
      checkStatus();
    }
  }, [isCloudStatusModalOpen]);

  if (!isCloudStatusModalOpen) return null;

  const copyEnvSample = () => {
    const text = `AWS_REGION=us-east-1\nAWS_ACCESS_KEY_ID=your-aws-access-key-id\nAWS_SECRET_ACCESS_KEY=your-aws-secret-access-key\nAWS_S3_BUCKET_NAME=your-soundstream-bucket\nNEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN=d12345abcdef.cloudfront.net`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={() => setIsCloudStatusModalOpen(false)}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Cloud Integration & Architecture</h2>
            <p className="text-xs text-zinc-400">
              AWS S3 Cloud Storage & Vercel Serverless Platform
            </p>
          </div>
        </div>

        {/* Live Status Card */}
        <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-lg p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Live S3 Connectivity Check
              </span>
            </div>
            <button
              onClick={checkStatus}
              disabled={checking}
              className="flex items-center space-x-1 text-xs text-spotify-green hover:underline disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {status?.configured ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>AWS S3 Credentials Detected</span>
              </div>
              <p className="text-xs text-zinc-300">
                Bucket:{' '}
                <span className="font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-200">
                  {status.bucketName || 'Configured'}
                </span>{' '}
                | Region:{' '}
                <span className="font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-200">
                  {status.region || 'us-east-1'}
                </span>
              </p>
              {status.accessible ? (
                <p className="text-xs text-emerald-300">
                  Successfully verified bucket read/write permissions via AWS SDK.
                </p>
              ) : (
                <p className="text-xs text-amber-400">
                  Status: Bucket validation response: {status.error || 'Check bucket policy/CORS.'}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 text-sm font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Simulation / Demo Cloud Mode</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                AWS credentials are not detected in environment variables. SoundStream seamlessly
                falls back to in-memory/localStorage streaming emulation so you can test audio
                playback and uploads right away.
              </p>
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="space-y-4 mb-5">
          <h3 className="text-sm font-bold flex items-center gap-1.5 text-zinc-200">
            <Layers className="w-4 h-4 text-spotify-green" />
            Architectural Pipeline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-zinc-800/40 border border-zinc-800 p-3 rounded-lg">
              <span className="text-spotify-green font-bold block mb-1">1. Presign Request</span>
              <p className="text-zinc-400 text-[11px]">
                Client requests an authenticated S3 PUT URL via Next.js Route Handler.
              </p>
            </div>
            <div className="bg-zinc-800/40 border border-zinc-800 p-3 rounded-lg">
              <span className="text-amber-400 font-bold block mb-1">2. Direct S3 Upload</span>
              <p className="text-zinc-400 text-[11px]">
                Browser uploads audio binary directly to AWS S3 bucket, bypassing server limits.
              </p>
            </div>
            <div className="bg-zinc-800/40 border border-zinc-800 p-3 rounded-lg">
              <span className="text-blue-400 font-bold block mb-1">3. CDN Delivery</span>
              <p className="text-zinc-400 text-[11px]">
                Music streams with low latency using Amazon CloudFront edge nodes.
              </p>
            </div>
          </div>
        </div>

        {/* Vercel Environment Variables setup */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300">
              Vercel / Cloud Environment Setup (.env)
            </span>
            <button
              onClick={copyEnvSample}
              className="flex items-center space-x-1 text-xs text-zinc-400 hover:text-white transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Keys</span>
                </>
              )}
            </button>
          </div>
          <pre className="bg-black/80 border border-zinc-800 p-3 rounded-lg text-[11px] font-mono text-zinc-300 overflow-x-auto">
            {`AWS_REGION=us-east-1\nAWS_ACCESS_KEY_ID=your-aws-access-key-id\nAWS_SECRET_ACCESS_KEY=your-aws-secret-access-key\nAWS_S3_BUCKET_NAME=your-soundstream-bucket\nNEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN=d12345abcdef.cloudfront.net`}
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-end">
          <button
            onClick={() => setIsCloudStatusModalOpen(false)}
            className="px-5 py-2 rounded-full text-xs font-bold bg-white hover:bg-zinc-200 text-black transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
