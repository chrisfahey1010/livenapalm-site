import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { S3Client, ListObjectsV2Command, _Object } from '@aws-sdk/client-s3';

const postsDirectory = path.join(process.cwd(), 'posts');
const bucketURL = 'https://livenapalm-photos.s3.us-west-2.amazonaws.com';
const bucketName = 'livenapalm-photos';

// Initialize S3 client
const s3Client = new S3Client({
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

async function getImagesFromS3(folder: string, slug: string): Promise<string[]> {
  try {
    // Log the attempt to fetch images
    console.log(`Attempting to fetch images for ${folder}/${slug}_`);

    // Check if credentials are available
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('AWS credentials are not configured');
      return [];
    }

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `${folder}/${slug}_`,
    });

    const response = await s3Client.send(command);
    
    if (!response.Contents) {
      console.log(`No images found for ${folder}/${slug}_`);
      return [];
    }

    // Log the number of images found
    console.log(`Found ${response.Contents.length} images for ${folder}/${slug}_`);

    // Sort the images by their number to maintain order
    const images = response.Contents
      .map((obj: _Object) => obj.Key)
      .filter((key: string | undefined): key is string => key !== undefined)
      .sort((a: string, b: string) => {
        const numA = parseInt(a.split('_').pop()?.split('.')[0] || '0');
        const numB = parseInt(b.split('_').pop()?.split('.')[0] || '0');
        return numA - numB;
      })
      .map((key: string) => `${bucketURL}/${key}`);

    // Log the final image URLs
    console.log('Image URLs:', images);

    return images;
  } catch (error) {
    console.error('Error fetching images from S3:', error);
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return [];
  }
}

export async function getPost(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  // Get the image folder name from the frontmatter
  const imageFolder = data.images;
  
  // Fetch all images from S3 that match the pattern
  const images = imageFolder ? await getImagesFromS3(imageFolder, slug) : [];

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

    // Use the same folder for the thumbnail
    const imageFolder = data.images;
    const thumbnailPath = imageFolder ? `${bucketURL}/${imageFolder}/thumbnail.jpg` : '';

    return {
      slug,
      title: data.title,
      date: data.date,
      imageSrc: thumbnailPath,
      altText: data.alt || '',
    };
  });
}