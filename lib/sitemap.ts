import { getAllPostsMetadata } from './posts';

export async function generateSitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://livenapalm.com';
  const today = new Date().toISOString().split('T')[0];
  const posts = await getAllPostsMetadata();

  // Start building the sitemap XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/gallery', priority: '0.9', changefreq: 'weekly' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
  ];

  staticPages.forEach(page => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  posts.forEach(post => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/photos/${post.slug}</loc>\n`;
    xml += `    <lastmod>${post.date || today}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += '</urlset>';
  return xml;
} 