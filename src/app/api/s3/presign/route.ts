import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUploadUrl, isAWSConfigured } from '@/lib/aws-s3';

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType, folder = 'tracks' } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Filename and contentType are required' },
        { status: 400 }
      );
    }

    // Validate mime type
    const isAudio = contentType.startsWith('audio/');
    const isImage = contentType.startsWith('image/');
    if (!isAudio && !isImage) {
      return NextResponse.json(
        { error: 'Invalid file type. Only audio or image files are accepted.' },
        { status: 400 }
      );
    }

    // Check if AWS S3 environment variables are provided
    if (!isAWSConfigured()) {
      // Mock / Simulation mode for demo and evaluation without AWS credentials
      const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const mockKey = `${folder}/${Date.now()}-${cleanName}`;
      return NextResponse.json({
        mode: 'demo',
        message: 'AWS S3 credentials not set in .env.local. Operating in demo mode.',
        uploadUrl: null, // Signals client to use local blob/data URL
        fileUrl: null,
        key: mockKey,
      });
    }

    // Generate real AWS S3 Presigned URL
    const result = await generatePresignedUploadUrl(filename, contentType, folder);

    return NextResponse.json({
      mode: 'aws-s3',
      ...result,
    });
  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
