import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import photoManifestData from '../data/photo-manifest.json';

const postsDirectory = path.join(process.cwd(), 'posts');
type ExifData = Record<string, string | number | boolean | null | undefined>;

type PhotoManifestImage = {
  src: string;
  width: number;
  height: number;
  alt?: string;
  downloadUrl?: string;
  exif?: ExifData | null;
};

type PhotoPostImage = Omit<PhotoManifestImage, 'exif'> & {
  exif: ExifData | null;
};

type PhotoManifestAlbum = {
  albumTitle?: string;
  albumUrl?: string;
  date?: string;
  location?: string;
  alt?: string;
  thumbnail?: string;
  photos?: PhotoManifestImage[];
};

const photoManifest = photoManifestData as Record<string, PhotoManifestAlbum>;
const fallbackThumbnail = '/logo.jpg';

function getManifestAlbum(imageFolder: string | undefined): PhotoManifestAlbum | undefined {
  return imageFolder ? photoManifest[imageFolder] : undefined;
}

function getImagesForAlbum(imageFolder: string | undefined, altText: string): PhotoPostImage[] {
  const album = getManifestAlbum(imageFolder);
  return (album?.photos || []).map((photo, index) => ({
    src: photo.src,
    width: photo.width,
    height: photo.height,
    alt: photo.alt || `${altText} ${index + 1}`,
    downloadUrl: photo.downloadUrl || photo.src,
    exif: photo.exif ?? null,
  }));
}

function hasPhotos(album: PhotoManifestAlbum | undefined): boolean {
  return Boolean(album?.photos?.length);
}

export async function getPost(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    const album = getManifestAlbum(slug);
    const title = album?.albumTitle || slug;
    const altText = album?.alt || title;

    return {
      slug,
      metadata: {
        title,
        date: album?.date || '',
        location: album?.location || '',
        images: getImagesForAlbum(slug, altText),
        altText,
        albumUrl: album?.albumUrl || '',
      },
      contentHtml: '<p>Photo set imported from Flickr.</p>',
    };
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  const imageFolder = data.images;
  const altText = data.alt || data.title || '';
  const album = getManifestAlbum(imageFolder);
  const images = getImagesForAlbum(imageFolder, altText);

  return {
    slug,
    metadata: {
      title: data.title,
      date: data.date,
      location: data.location,
      images,
      altText,
      albumUrl: album?.albumUrl || '',
    },
    contentHtml,
  };
}

export async function getAllPostsMetadata() {
  const filenames = fs.readdirSync(postsDirectory);

  const postMetadata = filenames.map((filename) => {
    const slug = filename.replace(/\.md$/, '');
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);

    const imageFolder = data.images;
    const album = getManifestAlbum(imageFolder);
    const firstPhoto = album?.photos?.[0];

    if (!hasPhotos(album)) return null;

    return {
      slug,
      title: data.title,
      date: data.date,
      imageSrc: album?.thumbnail || firstPhoto?.src || fallbackThumbnail,
      altText: data.alt || '',
      albumUrl: album?.albumUrl || '',
    };
  }).filter((post) => post !== null);

  const postSlugs = new Set(postMetadata.map((post) => post.slug));
  const manifestOnlyMetadata = Object.entries(photoManifest)
    .filter(([slug]) => !postSlugs.has(slug))
    .filter(([, album]) => hasPhotos(album))
    .map(([slug, album]) => ({
      slug,
      title: album.albumTitle || slug,
      date: album.date || '',
      imageSrc: album.thumbnail || album.photos?.[0]?.src || fallbackThumbnail,
      altText: album.alt || album.albumTitle || slug,
      albumUrl: album.albumUrl || '',
    }));

  return [...postMetadata, ...manifestOnlyMetadata];
}