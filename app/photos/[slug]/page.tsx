import { getPost } from '@/lib/posts';
import PhotoPost from '@/components/PhotoPost';

type Props = {
  params: {
    slug: string;
  };
};

export default async function PhotoPage(props: Props) {
  const { slug } = props.params;
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
