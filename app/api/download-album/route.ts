import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Debug logging for environment variables
console.log('Environment variables check:');
console.log('REGION:', process.env.REGION);
console.log('ACCESS_KEY_ID exists:', !!process.env.ACCESS_KEY_ID);
console.log('SECRET_ACCESS_KEY exists:', !!process.env.SECRET_ACCESS_KEY);
console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);

if (!process.env.REGION) {
  throw new Error('REGION environment variable is not set');
}

if (!process.env.ACCESS_KEY_ID) {
  throw new Error('ACCESS_KEY_ID environment variable is not set');
}

if (!process.env.SECRET_ACCESS_KEY) {
  throw new Error('SECRET_ACCESS_KEY environment variable is not set');
}

if (!process.env.S3_BUCKET_NAME) {
  throw new Error('S3_BUCKET_NAME environment variable is not set');
}

const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix');

    if (!prefix) {
      return NextResponse.json({ error: 'Prefix is required' }, { status: 400 });
    }

    console.log('Fetching objects with prefix:', prefix);

    // List all objects in the album directory
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: prefix,
    });

    const { Contents } = await s3Client.send(listCommand);
    
    if (!Contents || Contents.length === 0) {
      console.error('No files found for prefix:', prefix);
      return NextResponse.json({ error: 'No files found' }, { status: 404 });
    }

    // Filter out thumbnail.jpg and get presigned URLs for each image
    const imageFiles = Contents.filter(item => item.Key && !item.Key.endsWith('thumbnail.jpg'));
    
    if (imageFiles.length === 0) {
      console.error('No image files found after filtering thumbnail.jpg');
      return NextResponse.json({ error: 'No image files found' }, { status: 404 });
    }

    console.log(`Found ${imageFiles.length} images to download`);
    
    // Generate presigned URLs for each image
    const presignedUrls = await Promise.all(
      imageFiles.map(async (item) => {
        if (!item.Key) return null;
        
        const command = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: item.Key,
        });
        
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
        return {
          url,
          filename: item.Key.split('/').pop() || '',
        };
      })
    );

    // Filter out any null values and return the presigned URLs
    const validUrls = presignedUrls.filter((item): item is { url: string; filename: string } => item !== null);
    
    return NextResponse.json({
      files: validUrls,
      albumName: prefix.split('/').pop() || 'album'
    });
  } catch (error) {
    console.error('Error in download-album API:', error);
    return NextResponse.json({ 
      error: 'Failed to generate download URLs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 