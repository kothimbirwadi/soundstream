import type { Metadata } from 'next';
import './globals.css';
import { PlayerProvider } from '@/context/PlayerContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { PlayerBar } from '@/components/player/PlayerBar';
import { UploadModal } from '@/components/modals/UploadModal';
import { CloudStatusModal } from '@/components/modals/CloudStatusModal';
import { QueueDrawer } from '@/components/modals/QueueDrawer';

export const metadata: Metadata = {
  title: 'SoundStream - Modern Spotify Clone & Cloud Audio Player',
  description:
    'Full-featured Spotify Web Clone with AWS S3 Audio/Artwork Storage & Pre-signed Direct Streaming, deployable on Vercel.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased flex flex-col h-screen overflow-hidden">
        <PlayerProvider>
          {/* Main workspace (Sidebar + Page content) */}
          <div className="flex-1 flex overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-y-auto bg-spotify-dark custom-scrollbar relative">
              {children}
            </main>
          </div>

          {/* Fixed Player Bar at Bottom */}
          <PlayerBar />

          {/* Modals & Overlays */}
          <UploadModal />
          <CloudStatusModal />
          <QueueDrawer />
        </PlayerProvider>
      </body>
    </html>
  );
}
