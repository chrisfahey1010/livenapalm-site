import Link from 'next/link';

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
    </main>
  );
}
