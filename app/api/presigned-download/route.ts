import { NextRequest } from 'next/server';
import { getPresignedDownloadUrl } from '@/lib/posts';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (!key) {
    return new Response(JSON.stringify({ error: 'Missing key parameter' }), { status: 400 });
  }
  try {
    const url = await getPresignedDownloadUrl(key);
    return new Response(JSON.stringify({ url }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to generate presigned URL' }), { status: 500 });
  }
} 