import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'LiveNapalm',
    template: '%s | LiveNapalm'
  },
  description: 'Gonzo concert photography in the Pacific Northwest by Chris Fahey.',
  keywords: ['concert photography', 'live music', 'music photography', 'concert photos', 'live performance photography', 'gonzo photography', 'gonzo journalism'],
  authors: [{ name: 'Chris Fahey' }],
  creator: 'Chris Fahey',
  publisher: 'LiveNapalm',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://livenapalm.com',
    siteName: 'LiveNapalm',
    title: 'LiveNapalm - Concert Photography',
    description: 'Gonzo concert photography in the Pacific Northwest by Chris Fahey.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'LiveNapalm Concert Photography'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LiveNapalm - Concert Photography',
    description: 'Professional concert photography by Chris Fahey',
    images: ['/og-image.jpg'],
    creator: '@livenapalm'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-sans">
        <header className="bg-black border-b border-gray-800 p-4">
          <nav className="max-w-4xl mx-auto flex justify-between">
            <Link href="/" className="flex items-center">
              <img
                src="/logo_text.png"
                alt="LiveNapalm"
                className="h-8 w-auto object-contain [@media(hover:hover)]:hover:opacity-80 transition" 
              />
            </Link>
            <div className="space-x-6 flex items-center">
              <Link href="/gallery" className="text-white [@media(hover:hover)]:hover:text-gray-300">
                Gallery
              </Link>
              <Link href="/about" className="text-white [@media(hover:hover)]:hover:text-gray-300">
                About
              </Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
