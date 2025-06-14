import fs from 'fs';
import path from 'path';
import photoExif from '../photo-exif.json';

interface PhotoExif {
  [key: string]: {
    CreateDate?: string;
    [key: string]: any;
  };
}

export function generateSitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://livenapalm.com';
  const photos = photoExif as PhotoExif;

  // Get the latest modification time from photo-exif.json
  const stats = fs.statSync(path.join(process.cwd(), 'photo-exif.json'));
  const lastModified = stats.mtime.toISOString().split('T')[0];

  // Start building the sitemap XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/gallery', priority: '0.9', changefreq: 'weekly' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/photos', priority: '0.9', changefreq: 'weekly' },
  ];

  staticPages.forEach(page => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${lastModified}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Add individual photo pages
  Object.keys(photos).forEach(photoPath => {
    // Skip thumbnails
    if (photoPath.includes('thumbnail.jpg')) return;

    const photo = photos[photoPath];
    const photoDate = photo.CreateDate 
      ? photo.CreateDate.split(' ')[0].replace(/:/g, '-')
      : lastModified;

    // Convert photo path to URL format
    const photoUrl = `/photos/${photoPath.replace(/\\/g, '/')}`;

    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${photoUrl}</loc>\n`;
    xml += `    <lastmod>${photoDate}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += '</urlset>';
  return xml;
} 