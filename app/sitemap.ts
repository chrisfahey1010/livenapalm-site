import type { MetadataRoute } from 'next';
import { getAllPostsMetadata } from '@/lib/posts';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://livenapalm.com';
  const posts = await getAllPostsMetadata();
  const today = new Date();

  return [
    {
      url: baseUrl,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${baseUrl}/photos/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
