import { NextResponse } from 'next/server';
import { checkS3Status } from '@/lib/aws-s3';

export async function GET() {
  try {
    const status = await checkS3Status();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      {
        configured: false,
        accessible: false,
        error: error.message || 'Unknown error checking S3 status',
      },
      { status: 500 }
    );
  }
}
