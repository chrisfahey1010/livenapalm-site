import Link from 'next/link';
import Image from 'next/image';
import { getAllPostsMetadata } from '@/lib/posts';

export default async function GalleryPage() {
  const posts = (await getAllPostsMetadata()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main className="min-h-screen bg-black text-white px-4 py-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-5">Gallery</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/photos/${post.slug}`}>
              <div className="group">
                <div className="relative overflow-hidden shadow-lg w-full" style={{ paddingTop: '125%' }}>
                  {/* paddingTop: "125%" creates a 4:5 aspect box */}
                  <Image
                    src={post.imageSrc}
                    alt={post.altText}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    quality={75}
                    loading="lazy"
                    className="object-cover [@media(hover:hover)]:group-hover:scale-110 transition-transform duration-300 ease-in-out"
                  />
                </div>
                <div className="mt-2">
                  <h2 className="text-xs md:text-sm lg:text-base font-semibold truncate">{post.title}</h2>
                  <p className="text-xs md:text-sm text-gray-500">{post.date}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
