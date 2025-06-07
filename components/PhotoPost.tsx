"use client";

import React, { useState } from "react";
import Image from "next/image";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-gray-400 mb-8">
          📅 {date} · 📍 {location}
        </p>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {images.map((src, i) => (
            <div
              key={i}
              className="w-full bg-gray-900 rounded-lg overflow-hidden shadow-lg cursor-pointer group flex items-center justify-center"
              onClick={() => setSelectedImage(src)}
            >
              <Image
                src={src}
                alt={`${altText} ${i + 1}`}
                width={600}
                height={400}
                className="object-cover w-full h-auto transition-transform duration-300 group-hover:scale-105"
                style={{ aspectRatio: '4/3', display: 'block' }}
                priority={i < 6}
              />
            </div>
          ))}
        </div>

        {/* Fullscreen Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
              <Image
                src={selectedImage}
                alt={altText}
                fill
                className="object-contain"
                priority
              />
              <button
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-opacity"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="text-lg text-gray-300 leading-relaxed mt-8">
          {description}
        </div>
      </div>
    </main>
  );
}
