import Link from 'next/link';
import Image from 'next/image';
import { getAllPostsMetadata } from '@/lib/posts';

export default async function GalleryPage() {
  const posts = await getAllPostsMetadata();

  return (
    <main className="min-h-screen bg-black text-white px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-10">Gallery</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/photos/${post.slug}`}>
              <div className="group">
                <div className="relative overflow-hidden rounded-lg shadow-lg w-full" style={{ paddingTop: '125%' }}>
                  {/* paddingTop: "125%" creates a 4:5 aspect box */}
                  <Image
                    src={post.imageSrc}
                    alt={post.altText}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                  />
                </div>
                <div className="mt-2">
                  <h2 className="text-base font-semibold truncate">{post.title}</h2>
                  <p className="text-sm text-gray-500">{post.date}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
