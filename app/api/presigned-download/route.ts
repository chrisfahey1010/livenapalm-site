import { NextRequest } from 'next/server';
import { getPresignedDownloadUrl } from '@/lib/posts';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (!key) {
    console.error('Missing key parameter in presigned-download request');
    return new Response(JSON.stringify({ error: 'Missing key parameter' }), { status: 400 });
  }
  try {
    console.log('Generating presigned URL for key:', key);
    const url = await getPresignedDownloadUrl(key);
    console.log('Successfully generated presigned URL');
    return new Response(JSON.stringify({ url }), { status: 200 });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return new Response(JSON.stringify({ error: 'Failed to generate presigned URL' }), { status: 500 });
  }
} 