# LiveNapalm Photography Website

A modern, responsive photography portfolio website built with Next.js, TypeScript, and Tailwind CSS. This website showcases photography work with a focus on performance and user experience.

## Features

- 🖼️ Responsive photo gallery with optimized images
- 📱 Mobile-first design
- 🚀 Built with Next.js 15 and React 19
- 💅 Styled with Tailwind CSS
- 📝 Blog/Posts section with Markdown support
- 🔍 EXIF data extraction and display
- ☁️ AWS S3 integration for image storage
- 🔒 Environment variable support for secure configuration

## Tech Stack

- **Framework**: Next.js 15.3.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Image Processing**: exiftool-vendored
- **Cloud Storage**: AWS S3
- **Content Processing**: gray-matter, remark
- **Development**: ESLint, Turbopack

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn
- AWS S3 bucket (for image storage)

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

3. Create a `.env` file in the root directory with the following variables:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=your_region
   S3_BUCKET_NAME=your_bucket_name
   ```

### Development

Run the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:3000`

### Building for Production

1. Extract EXIF data and build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Project Structure

```
livenapalm-site/
├── app/                # Next.js app directory
│   ├── api/           # API routes
│   ├── gallery/       # Photo gallery pages
│   ├── photos/        # Individual photo pages
│   └── about/         # About page
├── components/        # React components
├── lib/              # Utility functions and shared code
├── posts/            # Blog posts in Markdown
├── public/           # Static assets
└── scripts/          # Build and utility scripts
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run extract-exif` - Extract EXIF data from images

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
