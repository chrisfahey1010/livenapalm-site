# LiveNapalm Photography Website

A modern, responsive concert photography portfolio built with Next.js, TypeScript, and Tailwind CSS. The site is statically exported for Cloudflare Workers Static Assets and currently uses Flickr as the temporary image origin.

## Features

- 🖼️ Responsive photo gallery backed by a checked-in Flickr photo manifest
- 📱 Mobile-first design
- 🚀 Built with Next.js 15 and React 19
- 💅 Styled with Tailwind CSS
- 📝 Blog/Posts section with Markdown support
- 🔍 EXIF display plumbing, with EXIF data deferred until originals are restored
- ☁️ Static export for Cloudflare Workers Static Assets

## Tech Stack

- **Framework**: Next.js 15.3.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Image Origin**: Flickr manifest, with Cloudflare R2/Images planned for longer-term hosting
- **Content Processing**: gray-matter, remark
- **Development**: ESLint, Turbopack

## Getting Started

### Prerequisites

- Node.js 22 recommended for local parity with Cloudflare Workers Builds
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chrisfahey1010/livenapalm-site.git
   cd livenapalm-site
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Optional: set `NEXT_PUBLIC_SITE_URL=https://livenapalm.com` for canonical metadata and sitemap URLs.

### Development

Run the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:3000`

### Building for Production

1. Build the static export:
   ```bash
   npm run build
   ```

2. The static site is written to `out/` for Cloudflare Workers Static Assets.

3. Preview locally with any static file server:
   ```bash
   npx serve out
   ```

## Flickr Photo Manifest

Gallery posts use the `images` frontmatter key in each `posts/*.md` file to look up Flickr image data in `data/photo-manifest.json`.

To refresh the manifest from public Flickr albums:

```bash
npm run build:flickr-manifest
```

The script matches public albums from `https://www.flickr.com/photos/livenapalm/albums` to posts by band/title and date. Posts without matching public albums remain visible in the gallery with a local fallback thumbnail until an album is available.

## Cloudflare Workers

Recommended settings:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy` or `npm run deploy`
- Non-production branch deploy command: `npx wrangler versions upload`
- Root/path: repository root (`/`)
- Environment variables: `NEXT_PUBLIC_SITE_URL=https://livenapalm.com`, plus `NODE_VERSION=22` if needed

The Worker deployment is configured by `wrangler.toml`, which uploads the Next.js static export from `out/`.

## Project Structure

```
livenapalm-site/
├── app/                # Next.js app directory
│   ├── gallery/       # Photo gallery pages
│   ├── photos/        # Individual photo pages
│   └── about/         # About page
├── components/        # React components
├── data/              # Checked-in Flickr photo manifest
├── lib/              # Utility functions and shared code
├── posts/            # Blog posts in Markdown
├── public/           # Static assets
└── scripts/          # Build and utility scripts
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the static export into `out/`
- `npm run deploy` - Deploy the built static site to Cloudflare Workers
- `npm run lint` - Run ESLint
- `npm run build:flickr-manifest` - Refresh `data/photo-manifest.json` from public Flickr albums
- `npm run extract-exif:s3` - Legacy AWS/S3 EXIF extraction script retained temporarily for reference

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary. All rights reserved.

## Contact

For any inquiries, please reach out through the contact information provided on the website.
