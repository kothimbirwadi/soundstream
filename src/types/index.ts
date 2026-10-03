export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  audioUrl: string;
  coverUrl: string;
  genre: string;
  uploadedAt?: string;
  isUserUploaded?: boolean;
  s3Key?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  gradient: string;
  tracks: Track[];
  isCustom?: boolean;
}

export interface CloudStatus {
  isConfigured: boolean;
  provider: 'AWS S3' | 'Demo / Local Simulation';
  bucketName?: string;
  region?: string;
  message: string;
}
