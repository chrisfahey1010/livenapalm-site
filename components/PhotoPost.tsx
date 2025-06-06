import React from "react"

type PhotoPostProps = {
  title: string;
  date: string;
  location: string;
  images: string[];
  altText: string;
  description: React.ReactNode;
};

export default function PhotoPost({
  title,
  date,
  location,
  images,
  altText,
  description,
}: PhotoPostProps) {
  return (
    <main className="min-h-screen bg-black text-white px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-gray-400 mb-2">
          📅 {date} · 📍 {location}
        </p>
        <div className="space-y-6 my-6">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${altText} ${i + 1}`}
              className="w-full h-auto rounded-sm shadow-lg"
            />
          ))}
        </div>
        <div className="text-lg text-gray-300 leading-relaxed mt-6">
          {description}
        </div>
      </div>
    </main>
  );
}
