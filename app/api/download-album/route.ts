import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import JSZip from 'jszip';

// Verify environment variables
const requiredEnvVars = {
  REGION: process.env.REGION,
  ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
  SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
};

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// At this point, we know all environment variables are defined
const s3Client = new S3Client({
  region: requiredEnvVars.REGION!,
  credentials: {
    accessKeyId: requiredEnvVars.ACCESS_KEY_ID!,
    secretAccessKey: requiredEnvVars.SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix');

    if (!prefix) {
      console.error('Missing prefix parameter in download-album request');
      return NextResponse.json({ error: 'Prefix is required' }, { status: 400 });
    }

    console.log('Fetching objects with prefix:', prefix);

    // List all objects in the album directory
    const listCommand = new ListObjectsV2Command({
      Bucket: requiredEnvVars.S3_BUCKET_NAME!,
      Prefix: prefix,
    });

    console.log('Sending ListObjectsV2 command to S3');
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
    
    // Create a new ZIP file
    const zip = new JSZip();
    
    // Download and add each image to the ZIP
    console.log('Starting to download images and add to ZIP');
    await Promise.all(
      imageFiles.map(async (item) => {
        if (!item.Key) return;
        
        console.log('Downloading image:', item.Key);
        const command = new GetObjectCommand({
          Bucket: requiredEnvVars.S3_BUCKET_NAME!,
          Key: item.Key,
        });
        
        const response = await s3Client.send(command);
        const filename = item.Key.split('/').pop() || '';
        
        if (response.Body) {
          console.log('Adding image to ZIP:', filename);
          const arrayBuffer = await response.Body.transformToByteArray();
          zip.file(filename, arrayBuffer);
        }
      })
    );

    console.log('Generating ZIP file...');
    // Generate the ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Create a response with the ZIP file
    const response = new NextResponse(zipBlob);
    response.headers.set('Content-Type', 'application/zip');
    response.headers.set('Content-Disposition', `attachment; filename="${prefix.split('/').pop() || 'album'}.zip"`);
    
    console.log('ZIP file generated successfully');
    return response;
  } catch (error) {
    console.error('Error in download-album API:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to generate download' }, { status: 500 });
  }
} 