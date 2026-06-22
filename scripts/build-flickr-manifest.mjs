import fs from 'node:fs';
import path from 'node:path';

const FLICKR_ALBUMS_URL = 'https://www.flickr.com/photos/livenapalm/albums';
const POSTS_DIR = path.join(process.cwd(), 'posts');
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'photo-manifest.json');

const SIZE_PREFERENCE = ['k', 'h', 'l', 'c', 'z', 'm', 'n', 'o'];
const THUMB_SIZE_PREFERENCE = ['c', 'z', 'n', 'm', 'w', 'q', 'sq'];

function readPosts() {
  return fs.readdirSync(POSTS_DIR)
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '');
      const contents = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf8');
      const frontmatter = contents.match(/^---\n([\s\S]*?)\n---/);
      const data = {};

      if (frontmatter) {
        for (const line of frontmatter[1].split('\n')) {
          const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
          if (match) {
            data[match[1]] = match[2].replace(/^['"]|['"]$/g, '').trim();
          }
        }
      }

      return {
        slug,
        title: data.title || slug,
        date: data.date || '',
        imageKey: data.images || slug,
        alt: data.alt || data.title || slug,
      };
    });
}

function normalizeBandName(value) {
  return value
    .split(/\s+(?:in|at)\s+/i)[0]
    .replace(/[^a-z0-9]+/gi, '')
    .toLowerCase();
}

function titlePrefix(value) {
  return value
    .replace(/\s+\d{4}-\d{2}-\d{2}\s*$/, '')
    .split(/\s+(?:in|at)\s+/i)[0]
    .trim();
}

function toPascalSlug(value) {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');

  return slug || 'FlickrAlbum';
}

function extractAlbumDate(albumTitle) {
  return albumTitle.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';
}

function deriveAlbumKey(albumTitle, albumUrl) {
  const date = extractAlbumDate(albumTitle);
  const fallbackId = albumUrl.split('/').filter(Boolean).pop();
  return `${date || 'undated'}_${toPascalSlug(titlePrefix(albumTitle) || fallbackId)}`;
}

function extractAlbumLocation(albumTitle) {
  const parentheticalLocation = albumTitle.match(/\(([A-Za-z .'-]+,\s*[A-Z]{2})\)/);
  if (parentheticalLocation) return parentheticalLocation[1];

  const city = albumTitle.match(/\bin\s+([^()]+?)(?:\s+\(at\s+|\s+\d{4}-\d{2}-\d{2})/i)?.[1]?.trim();
  if (!city) return '';
  if (/\bWA\b/i.test(city)) return city;
  if (/^(Seattle|Tacoma)$/i.test(city)) return `${city}, WA`;
  return city;
}

function normalizeUrl(value) {
  if (!value) return value;
  if (value.startsWith('//')) return `https:${value}`;
  if (value.startsWith('/')) return `https://www.flickr.com${value}`;
  return value;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; LiveNapalmManifestBuilder/1.0)',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function extractAlbums(html) {
  const albumPattern = /<a class="interaction-view avatar photo-list-album album ginormous" href="(?<href>\/photos\/livenapalm\/albums\/\d+)" title="(?<title>[^"]+)"><\/a>/g;
  return [...html.matchAll(albumPattern)].map((match) => ({
    title: decodeHtml(match.groups.title),
    url: `https://www.flickr.com${match.groups.href}`,
  }));
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractBalancedJson(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Could not find marker ${marker}`);
  }

  const start = source.indexOf('{', markerIndex + marker.length);
  if (start === -1) {
    throw new Error(`Could not find JSON start after ${marker}`);
  }

  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (char === '\\') {
        escaping = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  throw new Error(`Could not find JSON end after ${marker}`);
}

function unwrapData(value) {
  return value?.data ?? value;
}

function chooseSize(sizes, preferences) {
  for (const key of preferences) {
    const size = unwrapData(sizes?.[key]);
    if (size?.url || size?.src || size?.displayUrl) {
      return {
        src: normalizeUrl(size.url || size.src || size.displayUrl),
        width: size.width,
        height: size.height,
      };
    }
  }
  return null;
}

function photoPageUrl(photoId, albumId) {
  return `https://www.flickr.com/photos/livenapalm/${photoId}/in/album-${albumId}/`;
}

async function extractAlbumPhotos(album, post) {
  const html = await fetchText(album.url);
  const modelExport = JSON.parse(extractBalancedJson(html, 'modelExport:'));
  const albumModel = modelExport.main?.['set-models']?.[0]?.data;
  const albumId = albumModel?.id || album.url.split('/').filter(Boolean).pop();
  const primarySizes = unwrapData(albumModel?.primaryPhotoSizes);
  const primaryThumb = chooseSize(primarySizes, THUMB_SIZE_PREFERENCE);
  const photoModels = unwrapData(albumModel?.photoPageList)?.['_data'] || [];

  const photos = photoModels.map((entry, index) => {
    const photo = unwrapData(entry);
    const sizes = unwrapData(photo?.sizes);
    const chosen = chooseSize(sizes, SIZE_PREFERENCE);

    if (!chosen) return null;

    return {
      src: chosen.src,
      width: chosen.width,
      height: chosen.height,
      alt: photo?.title || `${post.alt} ${index + 1}`,
      downloadUrl: photoPageUrl(photo.id, albumId),
      exif: null,
    };
  }).filter(Boolean);

  return {
    albumTitle: albumModel?.title || album.title,
    albumUrl: album.url,
    date: extractAlbumDate(albumModel?.title || album.title),
    location: extractAlbumLocation(albumModel?.title || album.title),
    alt: albumModel?.title || album.title,
    thumbnail: primaryThumb?.src || album.thumbnail || photos[0]?.src || '',
    photos,
  };
}

function matchAlbumToPost(album, posts) {
  const albumBand = normalizeBandName(album.title);
  const albumDate = album.title.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';

  return posts.find((post) => (
    post.date === albumDate && normalizeBandName(post.title) === albumBand
  ));
}

async function main() {
  const posts = readPosts();
  const albumsHtml = await fetchText(FLICKR_ALBUMS_URL);
  const albums = extractAlbums(albumsHtml);
  const manifest = {};
  const matchedAlbumUrls = new Set();

  console.log(`Found ${albums.length} public Flickr albums.`);

  for (const album of albums) {
    const post = matchAlbumToPost(album, posts);
    if (matchedAlbumUrls.has(album.url)) continue;

    const imageKey = post?.imageKey || deriveAlbumKey(album.title, album.url);
    const alt = post?.alt || album.title;
    console.log(`Mapping ${imageKey} -> ${album.title}`);
    manifest[imageKey] = await extractAlbumPhotos(album, { alt });
    matchedAlbumUrls.add(album.url);
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  const missing = posts
    .filter((post) => !manifest[post.imageKey])
    .map((post) => `${post.imageKey} (${post.title})`);

  console.log(`Wrote ${Object.keys(manifest).length} manifest album(s) to ${path.relative(process.cwd(), OUTPUT_PATH)}.`);
  if (missing.length) {
    console.log('Missing matching public Flickr albums for:');
    for (const item of missing) console.log(`- ${item}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
