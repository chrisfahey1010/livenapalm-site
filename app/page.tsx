import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to LiveNapalm - Gonzo concert photography in the Pacific Northwest by Chris Fahey.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="sr-only">LiveNapalm - Concert Photography</h1>
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="LiveNapalm Logo"
            width={273}
            height={96}
            className="object-contain"
            priority
          />
        </div>
        <p className="text-xl text-gray-300 mb-8">
          Gonzo concert photography in the Pacific Northwest by Chris Fahey
        </p>
        <nav aria-label="Main navigation" className="space-x-4">
          <Link
            href="/gallery"
            className="inline-block mt-4 px-6 py-3 bg-white text-black font-semibold rounded-lg [@media(hover:hover)]:hover:bg-gray-200 transition"
          >
            View Gallery
          </Link>
          <Link
            href="/about"
            className="inline-block mt-4 px-6 py-3 border border-white text-white rounded-lg [@media(hover:hover)]:hover:bg-white [@media(hover:hover)]:hover:text-black transition"
          >
            Learn More
          </Link>
        </nav>
        
        {/* Social Media Icons */}
        <nav aria-label="Social media links" className="mt-8 flex justify-center space-x-6">
          <Link
            href="https://instagram.com/livenapalm"
            target="_blank"
            rel="noopener noreferrer"
            className="[@media(hover:hover)]:hover:opacity-80 transition"
            aria-label="Follow me on Instagram"
          >
            <Image
              src="/icons/instagram.png"
              alt="Instagram"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </Link>
          <Link
            href="https://github.com/chrisfahey1010/livenapalm-site#"
            target="_blank"
            rel="noopener noreferrer"
            className="[@media(hover:hover)]:hover:opacity-80 transition"
            aria-label="View GitHub repository for this site"
          >
            <Image
              src="/icons/github.png"
              alt="GitHub"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </Link>
          <Link
            href="https://x.com/livenapalm"
            target="_blank"
            rel="noopener noreferrer"
            className="[@media(hover:hover)]:hover:opacity-80 transition"
            aria-label="Follow me on X (Twitter)"
          >
            <Image
              src="/icons/x.png"
              alt="X (Twitter)"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </Link>
          <Link
            href="https://flickr.com/photos/livenapalm/albums"
            target="_blank"
            rel="noopener noreferrer"
            className="[@media(hover:hover)]:hover:opacity-80 transition"
            aria-label="View my Flickr albums"
          >
            <Image
              src="/icons/flickr.png"
              alt="Flickr"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </Link>
          <Link
            href="https://youtube.com/@livenapalm"
            target="_blank"
            rel="noopener noreferrer"
            className="[@media(hover:hover)]:hover:opacity-80 transition"
            aria-label="Subscribe to my YouTube channel"
          >
            <Image
              src="/icons/youtube.png"
              alt="YouTube"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </Link>
        </nav>
      </div>
    </main>
  );
}
