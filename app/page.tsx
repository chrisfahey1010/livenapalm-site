import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <img
          src="/logo.png"
          alt="LiveNapalm Logo"
          className="mx-auto h-24 w-auto mb-6" 
        />
        <p className="text-xl text-gray-300 mb-8">
          Gonzo concert photography in the Pacific Northwest by Chris Fahey
        </p>
        <div className="space-x-4">
          <Link
            href="/gallery"
            className="inline-block mt-4 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            View Gallery
          </Link>
          <Link
            href="/about"
            className="inline-block mt-4 px-6 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-black transition"
          >
            Learn More
          </Link>
        </div>
        
        {/* Social Media Icons */}
        <div className="mt-8 flex justify-center space-x-6">
          <Link
            href="https://instagram.com/livenapalm"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition"
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
            className="hover:opacity-80 transition"
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
            className="hover:opacity-80 transition"
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
            className="hover:opacity-80 transition"
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
            className="hover:opacity-80 transition"
          >
            <Image
              src="/icons/youtube.png"
              alt="YouTube"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </Link>
        </div>
      </div>
    </main>
  );
}
