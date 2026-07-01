# Cloudflare Photo Hosting Implementation Plan

## Goals

- Host LiveNapalm HD photos on Cloudflare instead of relying on Flickr long term.
- Keep existing Flickr-based posts working during the transition.
- Keep the current Markdown post format, especially the `images` frontmatter key.
- Upload only original HD JPEG files for new Cloudflare-hosted albums.
- Publish selected EXIF data, including GPS coordinates.
- Serve lower-resolution gallery and modal images without manually exporting separate sizes.

## Confirmed Decisions

- Cloudflare R2 bucket: `livenapalm-photos`
- Public photo domain: `https://photos.livenapalm.com`
- GPS EXIF: published
- Display image size: `2560px` long edge
- Original upload format: HD JPEG originals only
- Existing Flickr compatibility: required
- Markdown post format: unchanged

## Recommended Approach

Use Cloudflare R2 as the source of truth for original JPEG files, then use Cloudflare Image Transformations to serve resized/cached versions for the website.

This means only one file per photo is uploaded:

```text
photos/
  2025-06-29_DeathLens/
    photo-001.jpg
    photo-002.jpg
    photo-003.jpg
```

The app will use three URLs per image:

- `downloadUrl`: the original R2 object URL.
- `src`: a Cloudflare transformation URL for the 2560px display image.
- `thumbnailSrc`: a Cloudflare transformation URL for gallery/grid thumbnails.

No local `original`, `display`, or `thumb` directories are required in R2.

## Why This Is Better

- You upload each photo once.
- R2 remains the canonical HD archive.
- Cloudflare handles resizing, compression, format negotiation, and edge caching.
- The static Next.js app stays simple because it only consumes precomputed URLs from the manifest.
- If Cloudflare Image Transformations become undesirable later, the same importer workflow can fall back to script-generated variants without changing Markdown posts.

## Cloudflare Requirements

Enable Cloudflare Image Transformations for the `livenapalm.com` zone.

Primary transformation URL format:

```text
https://photos.livenapalm.com/cdn-cgi/image/<OPTIONS>/<SOURCE-PATH>
```

Example original URL:

```text
https://photos.livenapalm.com/photos/2025-06-29_DeathLens/photo-001.jpg
```

Example display URL:

```text
https://photos.livenapalm.com/cdn-cgi/image/width=2560,quality=85,format=auto,fit=scale-down/photos/2025-06-29_DeathLens/photo-001.jpg
```

Example thumbnail URL:

```text
https://photos.livenapalm.com/cdn-cgi/image/width=800,quality=80,format=auto,fit=scale-down/photos/2025-06-29_DeathLens/photo-001.jpg
```

Notes:

- No Worker is required for the first implementation.
- The `/cdn-cgi/image/...` URLs can be hidden later with Transform Rules or a Worker if cleaner public URLs are desired.
- Each unique transformation is cached by Cloudflare and may count as a billable image transformation depending on the Cloudflare plan/product settings.
- The EXIF shown on the site should come from the checked-in manifest. Transformed image bytes may not preserve embedded metadata, especially with `format=auto`.

## Current Architecture

The app is a statically exported Next.js site deployed through Cloudflare Workers Static Assets.

Photo posts currently work like this:

1. Markdown files live in `posts/*.md`.
2. Each post has an `images` frontmatter value, such as `2025-06-29_DeathLens`.
3. `lib/posts.ts` looks up that key in `data/photo-manifest.json`.
4. `app/photos/[slug]/page.tsx` statically generates pages from manifest-backed posts.
5. `components/PhotoPost.tsx` renders the grid, modal, download/open link, and EXIF table.
6. `scripts/build-flickr-manifest.mjs` currently overwrites `data/photo-manifest.json` from Flickr.

The main implementation constraint is that `next/image` is configured with `unoptimized: true` for static export. The site should not point visible grid/modal images directly at full-resolution originals.

## Manifest Strategy

Do not manually mix Cloudflare entries into the Flickr-generated manifest, because `scripts/build-flickr-manifest.mjs` overwrites `data/photo-manifest.json`.

Split manifests by source:

```text
data/photo-manifest.flickr.json
data/photo-manifest.cloudflare.json
data/photo-manifest.json
```

Add a merge script:

```text
scripts/build-photo-manifest.mjs
```

Merge behavior:

1. Read `data/photo-manifest.flickr.json` if it exists.
2. Read `data/photo-manifest.cloudflare.json` if it exists.
3. Merge into `data/photo-manifest.json`.
4. Let Cloudflare entries override Flickr entries with the same image key.

This allows a post to move from Flickr to Cloudflare without changing its Markdown file.

## Manifest Shape

Keep the existing manifest fields so current app code needs only small extensions.

For Cloudflare-backed images:

- `src` is the 2560px transformed display URL.
- `thumbnailSrc` is the transformed thumbnail URL.
- `downloadUrl` is the original R2 object URL.
- `width` and `height` describe the display image dimensions after scaling down to a 2560px long edge.
- EXIF is extracted from the original file and stored in the manifest.

Example Cloudflare-backed entry:

```json
{
  "2025-06-29_DeathLens": {
    "source": "cloudflare",
    "albumTitle": "DEATH LENS in Seattle",
    "date": "2025-06-29",
    "location": "Seattle, WA",
    "alt": "Death Lens performing live in Seattle, Washington",
    "thumbnail": "https://photos.livenapalm.com/cdn-cgi/image/width=800,quality=80,format=auto,fit=scale-down/photos/2025-06-29_DeathLens/photo-001.jpg",
    "photos": [
      {
        "src": "https://photos.livenapalm.com/cdn-cgi/image/width=2560,quality=85,format=auto,fit=scale-down/photos/2025-06-29_DeathLens/photo-001.jpg",
        "thumbnailSrc": "https://photos.livenapalm.com/cdn-cgi/image/width=800,quality=80,format=auto,fit=scale-down/photos/2025-06-29_DeathLens/photo-001.jpg",
        "downloadUrl": "https://photos.livenapalm.com/photos/2025-06-29_DeathLens/photo-001.jpg",
        "width": 1707,
        "height": 2560,
        "alt": "Death Lens performing live in Seattle, Washington 1",
        "exif": {
          "Model": "Camera model",
          "LensModel": "Lens model",
          "FocalLength": "50 mm",
          "ExposureTime": "1/250",
          "FNumber": 2.8,
          "ISO": 3200,
          "CreateDate": "2025:06:29 21:14:00",
          "GPSPosition": "47.613 -122.342",
          "Flash": "Off",
          "ImageSize": "4000x6000",
          "Rights": "Copyright Chris Fahey"
        }
      }
    ]
  }
}
```

Existing Flickr entries can continue using:

```json
{
  "source": "flickr",
  "albumUrl": "https://www.flickr.com/photos/livenapalm/albums/...",
  "photos": [
    {
      "src": "https://live.staticflickr.com/...jpg",
      "downloadUrl": "https://www.flickr.com/photos/livenapalm/...",
      "exif": null
    }
  ]
}
```

## EXIF Policy

Use an allowlist rather than publishing the full raw EXIF payload.

Initial EXIF fields:

- `Model`
- `LensModel`
- `FocalLength`
- `ExposureTime`
- `FNumber`
- `ISO`
- `CreateDate`
- `GPSPosition`
- `Flash`
- `ImageSize`
- `Rights`

GPS coordinates should remain enabled. The existing UI already renders `GPSPosition` as a Google Maps link.

The original R2 JPEGs may also contain embedded EXIF. The site should not depend on browser access to embedded EXIF; it should render EXIF from the manifest.

## Required Code Changes

### Next Image Configuration

Update `next.config.ts` to allow Cloudflare-hosted images:

```ts
{
  protocol: "https",
  hostname: "photos.livenapalm.com",
  port: "",
  pathname: "/**",
}
```

Keep the existing Flickr remote pattern.

### Post Types And Manifest Loading

Update `lib/posts.ts` types to support source-aware photo entries:

```ts
type PhotoSource = 'flickr' | 'cloudflare';

type PhotoManifestImage = {
  src: string;
  thumbnailSrc?: string;
  width: number;
  height: number;
  alt?: string;
  downloadUrl?: string;
  exif?: ExifData | null;
};

type PhotoManifestAlbum = {
  source?: PhotoSource;
  albumTitle?: string;
  albumUrl?: string;
  date?: string;
  location?: string;
  alt?: string;
  thumbnail?: string;
  photos?: PhotoManifestImage[];
};
```

`PhotoPost` should also receive the album source, either as a top-level prop or copied onto each normalized image in `getImagesForAlbum()`. This is needed for source-aware link labels such as `View Flickr` versus `Open Original`.

### Photo Rendering

Update `components/PhotoPost.tsx` so the grid uses thumbnails when available:

```tsx
src={img.thumbnailSrc || img.src}
```

Keep the modal using `img.src`, which points to the 2560px transformed display image.

Keep the external/open link using `downloadUrl || src`, which points to the original Cloudflare image for Cloudflare entries and the Flickr photo page for Flickr entries.

Change Flickr-specific labels to source-aware labels:

- Flickr album link: `Open Flickr Album`
- Flickr photo link: `View Flickr`
- Cloudflare original link: `Open Original`

### Flickr Manifest Builder

Change `scripts/build-flickr-manifest.mjs` output path from:

```text
data/photo-manifest.json
```

to:

```text
data/photo-manifest.flickr.json
```

Add `source: "flickr"` to generated Flickr albums.

The script can optionally call the merge script after writing the Flickr source manifest.

### Manifest Merge Script

Add `scripts/build-photo-manifest.mjs`.

Responsibilities:

1. Read source manifests.
2. Merge them in source priority order.
3. Write `data/photo-manifest.json`.
4. Sort keys for stable diffs.
5. Print overridden keys so Flickr-to-Cloudflare migrations are visible.

Recommended source priority:

```text
1. Flickr
2. Cloudflare
```

### Cloudflare Import Script

Add `scripts/import-cloudflare-photos.mjs`.

Suggested command:

```bash
npm run import:cloudflare-photos -- posts/2025-06-29_DeathLens.md /path/to/local/photos
```

Primary responsibilities:

1. Read Markdown frontmatter from the post file.
2. Use frontmatter `images` as the manifest key.
3. Read local JPEG originals from the provided photo directory.
4. Sort photos deterministically, likely by filename unless a future flag requests capture-date sorting.
5. Extract EXIF and original dimensions with `exiftool-vendored`.
6. Upload only the original JPEG files to R2.
7. Compute 2560px display dimensions for each image without writing a resized file.
8. Generate Cloudflare Image Transformation URLs for `src` and `thumbnailSrc`.
9. Write or update `data/photo-manifest.cloudflare.json`.
10. Run the manifest merge script.

The AWS SDK dependency is already present and can be used with R2's S3-compatible API.

No `sharp` dependency is required for the primary transformation-based workflow.

## Transformation URL Helpers

The import script should build URLs consistently from the public base URL and object key.

Recommended constants:

```js
const DISPLAY_TRANSFORM = 'width=2560,quality=85,format=auto,fit=scale-down';
const THUMBNAIL_TRANSFORM = 'width=800,quality=80,format=auto,fit=scale-down';
```

Helper behavior:

```text
originalUrl = https://photos.livenapalm.com/<objectKey>
displayUrl = https://photos.livenapalm.com/cdn-cgi/image/<DISPLAY_TRANSFORM>/<objectKey>
thumbnailUrl = https://photos.livenapalm.com/cdn-cgi/image/<THUMBNAIL_TRANSFORM>/<objectKey>
```

For object key:

```text
photos/2025-06-29_DeathLens/photo-001.jpg
```

The resulting URLs are:

```text
https://photos.livenapalm.com/photos/2025-06-29_DeathLens/photo-001.jpg
https://photos.livenapalm.com/cdn-cgi/image/width=2560,quality=85,format=auto,fit=scale-down/photos/2025-06-29_DeathLens/photo-001.jpg
https://photos.livenapalm.com/cdn-cgi/image/width=800,quality=80,format=auto,fit=scale-down/photos/2025-06-29_DeathLens/photo-001.jpg
```

## Environment Variables

Use `.env.local` for local imports:

```text
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=livenapalm-photos
R2_PUBLIC_BASE_URL=https://photos.livenapalm.com
```

R2 S3 endpoint format:

```text
https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
```

Do not commit `.env.local`.

## Package Scripts

Recommended `package.json` scripts:

```json
{
  "build:flickr-manifest": "node scripts/build-flickr-manifest.mjs",
  "build:photo-manifest": "node scripts/build-photo-manifest.mjs",
  "import:cloudflare-photos": "node scripts/import-cloudflare-photos.mjs"
}
```

Optional behavior:

- `build:flickr-manifest` can write `photo-manifest.flickr.json` and then invoke `build-photo-manifest`.
- `import:cloudflare-photos` should always invoke `build-photo-manifest` after updating the Cloudflare source manifest.

## Authoring Workflow

For a new Cloudflare-hosted photo post:

1. Create the Markdown post in `posts/*.md` using the existing format.
2. Export or collect final HD JPEG originals in a local folder outside git.
3. Run the Cloudflare import script with the post path and local photo folder.
4. Review `data/photo-manifest.cloudflare.json` and `data/photo-manifest.json`.
5. Run `npm run lint`.
6. Run `npm run build`.
7. Commit the Markdown post, source manifest, merged manifest, and script/config changes.
8. Deploy with `npm run deploy`.

Example Markdown file:

```markdown
---
title: "DEATH LENS in Seattle"
date: "2025-06-29"
location: "Seattle, WA"
alt: "Death Lens performing live in Seattle, Washington"
images: "2025-06-29_DeathLens"
---

Performing with WAVVES and BEACH GOONS at Neumos
```

## Migration Workflow

For replacing an existing Flickr-backed post with Cloudflare-hosted photos:

1. Keep the Markdown post unchanged.
2. Import the local originals using the same `images` key already used by the post.
3. Let the Cloudflare source manifest override the Flickr source manifest during merge.
4. Verify the page still exists at the same `/photos/[slug]` URL.
5. Confirm the page now uses `photos.livenapalm.com` assets and has EXIF data.

## Fallback Option: Script-Generated Variants

If Cloudflare Image Transformations are not suitable because of cost, feature availability, or desired control, keep the same user workflow but change the importer internals.

Fallback behavior:

1. User still provides only original HD JPEGs.
2. Import script uses `sharp` to generate a 2560px display image and an 800px thumbnail.
3. Script uploads original, display, and thumbnail objects to R2.
4. Manifest URLs point directly to those generated objects instead of `/cdn-cgi/image/...` URLs.

Fallback R2 layout:

```text
photos/
  2025-06-29_DeathLens/
    original/
      photo-001.jpg
    display/
      photo-001.jpg
    thumb/
      photo-001.jpg
```

Fallback package addition:

```bash
npm install sharp
```

This fallback should not be implemented first unless Image Transformations are unavailable or clearly not cost-effective.

## Verification Checklist

Run these before deployment:

```bash
npm run lint
npm run build
```

Manual checks:

- Gallery thumbnails load from `photos.livenapalm.com/cdn-cgi/image/...` for Cloudflare-backed posts.
- Flickr-backed posts still load from `live.staticflickr.com`.
- Modal image loads the 2560px transformed display image.
- Open/download button points to the original Cloudflare image.
- EXIF panel shows selected EXIF fields from the manifest.
- `GPSPosition` links to Google Maps.
- Existing Flickr album links still render only for Flickr-backed albums.
- Static export succeeds and writes to `out/`.

## Implementation Phases

### Phase 1: Manifest Compatibility

- Add Cloudflare image remote pattern.
- Extend manifest types.
- Add thumbnail support in `PhotoPost`.
- Add source-aware link labels.
- Add manifest merge script.
- Change Flickr builder to write a Flickr source manifest.

### Phase 2: Originals-Only Import Pipeline

- Add R2 upload support.
- Add EXIF extraction allowlist.
- Add original image dimension extraction.
- Add transformation URL generation.
- Add Cloudflare source manifest writing.
- Add import package script.

### Phase 3: Cloudflare Transform Validation

- Enable Cloudflare Image Transformations for the zone.
- Import one real album into R2.
- Verify original URLs load directly.
- Verify transformation URLs return resized images.
- Verify dimensions, EXIF, GPS, and original links.
- Build the static site.
- Deploy.

### Phase 4: Gradual Migration

- Migrate Flickr-backed posts one album at a time.
- Keep Flickr entries for anything not yet migrated.
- Remove Flickr dependency only after all desired posts are migrated and the Flickr fallback is no longer needed.

## Risks And Notes

- `data/photo-manifest.json` should remain checked in because the static build imports it directly.
- Avoid serving originals as grid or modal images; static export does not provide Next image optimization.
- R2 object names should be stable so existing deployed pages do not break after a manifest update.
- Publishing GPS EXIF is intentional but should be remembered when importing photos from sensitive locations.
- Cloudflare Image Transformations are cached, but the first request for a unique transform may have extra latency.
- Cloudflare cache behavior should be considered before replacing objects at the same key. Prefer immutable object names or intentional cache purges for changed images.
- If `format=auto` serves AVIF or WebP, embedded image metadata may be stripped. The site should rely on manifest EXIF, not transformed image metadata.
