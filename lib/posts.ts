import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');
const bucketURL = 'https://livenapalm-photos.s3.us-west-2.amazonaws.com';

export async function getPost(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  // Normalize image paths
  const images: string[] = (data.images || []).map((imgPath: string) =>
    imgPath.startsWith('http') ? imgPath : `${bucketURL}/${imgPath}`
  );

  return {
    slug,
    metadata: {
      title: data.title,
      date: data.date,
      location: data.location,
      images,
      altText: data.alt || '',
    },
    contentHtml,
  };
}

export async function getAllPostsMetadata() {
  const filenames = fs.readdirSync(postsDirectory);

  return filenames.map((filename) => {
    const slug = filename.replace(/\.md$/, '');
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);

    const thumbnailPath = `${bucketURL}/${slug}/thumbnail.jpg`;

    // const fallbackImage = Array.isArray(data.images) && data.images.length > 0
    //   ? `${bucketURL}/${data.images[0]}`
    //   : '/logo.png';

    return {
      slug,
      title: data.title,
      date: data.date,
      imageSrc: thumbnailPath,
      altText: data.alt || '',
    };
  });
}