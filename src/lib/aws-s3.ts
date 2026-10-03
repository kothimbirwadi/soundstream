import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const region = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.AWS_S3_BUCKET_NAME;

export function isAWSConfigured(): boolean {
  return Boolean(accessKeyId && secretAccessKey && bucketName);
}

export function getS3Client(): S3Client | null {
  if (!isAWSConfigured()) {
    return null;
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId: accessKeyId as string,
      secretAccessKey: secretAccessKey as string,
    },
  });
}

/**
 * Generate a pre-signed PUT URL for uploading an audio or image file directly to AWS S3 from the browser
 */
export async function generatePresignedUploadUrl(
  filename: string,
  contentType: string,
  folder: 'tracks' | 'covers' = 'tracks'
): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
  const client = getS3Client();
  if (!client || !bucketName) {
    throw new Error('AWS S3 is not configured in environment variables');
  }

  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const key = `${folder}/${timestamp}-${sanitizedFilename}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  // URL expires in 15 minutes (900 seconds)
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });

  // Determine public file URL (CloudFront or direct S3 URL)
  let fileUrl = '';
  if (process.env.NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN) {
    const cfDomain = process.env.NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN.replace(/^https?:\/\//, '');
    fileUrl = `https://${cfDomain}/${key}`;
  } else {
    fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  }

  return { uploadUrl, fileUrl, key };
}

/**
 * Verify S3 bucket connectivity and credentials
 */
export async function checkS3Status(): Promise<{
  configured: boolean;
  accessible: boolean;
  bucketName?: string;
  region?: string;
  error?: string;
}> {
  if (!isAWSConfigured()) {
    return {
      configured: false,
      accessible: false,
      message: 'AWS S3 credentials not provided. SoundStream is operating in Demo / Simulation mode.',
    } as any;
  }

  try {
    const client = getS3Client();
    if (!client || !bucketName) throw new Error('Missing client');

    const command = new HeadBucketCommand({ Bucket: bucketName });
    await client.send(command);

    return {
      configured: true,
      accessible: true,
      bucketName,
      region,
    };
  } catch (err: any) {
    return {
      configured: true,
      accessible: false,
      bucketName,
      region,
      error: err.message || 'Failed to connect to AWS S3 bucket',
    };
  }
}
