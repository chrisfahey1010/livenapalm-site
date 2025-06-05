import { getPost, getAllPostsMetadata } from '@/lib/posts';
import PhotoPost from '@/components/PhotoPost';

export async function generateStaticParams() {
  const posts = getAllPostsMetadata();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PhotoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { metadata, contentHtml } = await getPost(slug);

  return (
    <PhotoPost
      title={metadata.title}
      date={metadata.date}
      location={metadata.location}
      images={metadata.images}
      altText={metadata.altText}
      description={
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      }
    />
  );
}
