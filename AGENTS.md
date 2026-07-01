# Repository Instructions

## Commands
- Use npm; `package-lock.json` is the only lockfile. Prefer `npm ci` for clean installs.
- `npm run dev` starts Next with Turbopack at `http://localhost:3000`.
- `npm run lint` runs ESLint over the repo; `.next/`, `out/`, and `scripts/extract-exif-s3.js` are ignored.
- `npm run build` runs `next build`; `next.config.ts` has `output: "export"`, so production output is `out/`.
- There is no test script or test config. For verification, run `npm run lint` and `npm run build` unless the change is docs-only.
- `npm run deploy` runs `wrangler deploy`; `wrangler.toml` serves static assets from `./out`, so build before deploy.

## App Structure
- This is a single-package Next.js 15 / React 19 app using the App Router in `app/`.
- `app/photos/[slug]/page.tsx` is statically generated from `getAllPostsMetadata()`; only posts/albums with photos in `data/photo-manifest.json` get photo pages.
- `lib/posts.ts` is the content hub: it reads Markdown from `posts/`, joins frontmatter `images` keys to `data/photo-manifest.json`, and also exposes manifest-only albums that have photos.
- `components/PhotoPost.tsx` is the only client component for the gallery detail modal, swipe navigation, EXIF display, and Flickr photo links.
- Use the `@/*` alias from `tsconfig.json` for repo-root imports when matching existing app code.

## Content And Images
- New gallery entries are Markdown files in `posts/*.md` with frontmatter like `title`, `date`, `location`, `alt`, and `images`; `images` must match a key in `data/photo-manifest.json` for the gallery/detail pages to show photos.
- `npm run build:flickr-manifest` refreshes `data/photo-manifest.json` by scraping public Flickr albums from `https://www.flickr.com/photos/livenapalm/albums` and matching albums to posts by normalized band/title plus date.
- `next/image` is configured as unoptimized and allows remote `https://live.staticflickr.com/**`; do not assume Next image optimization is available in the static export.
- `scripts/extract-exif-s3.js` is a legacy AWS/S3 reference script. It requires `.env.local` credentials and writes ignored `photo-exif.json`; ESLint intentionally skips it.

## Environment And Deploy Notes
- Node.js 22 is recommended for local parity with Cloudflare Workers Builds.
- `NEXT_PUBLIC_SITE_URL` affects canonical metadata and sitemap URLs; it defaults to localhost in `app/layout.tsx` metadata and to `https://livenapalm.com` in sitemap generation.
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` is read in `app/layout.tsx` metadata verification.
- `amplify.yml` still publishes `.next`, which conflicts with the current static export and Wrangler `out/` deploy path; trust `next.config.ts`, `wrangler.toml`, and package scripts for current build/deploy behavior.
