"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

type PhotoPostProps = {
  title: string;
  date: string;
  location: string;
  images: string[];
  altText: string;
  description: React.ReactNode;
};

// Simple spinner component
function Spinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function PhotoPost({
  title,
  date,
  location,
  images,
  altText,
  description,
}: PhotoPostProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<boolean[]>(Array(images.length).fill(false));
  const [modalLoaded, setModalLoaded] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Handle image load for grid
  const handleImageLoad = (idx: number) => {
    setLoaded((prev) => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  };

  // Reset modal loaded state when opening a new image
  useEffect(() => {
    setModalLoaded(false);
  }, [selectedIndex]);

  // Keyboard navigation for modal
  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setSelectedIndex((idx) => (idx !== null && idx > 0 ? idx - 1 : idx));
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((idx) => (idx !== null && idx < images.length - 1 ? idx + 1 : idx));
      } else if (e.key === "Escape") {
        setSelectedIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, images.length]);

  // Touch/swipe navigation for modal
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null && selectedIndex !== null) {
      const delta = touchEndX.current - touchStartX.current;
      if (delta > 50 && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      } else if (delta < -50 && selectedIndex < images.length - 1) {
        setSelectedIndex(selectedIndex + 1);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl font-bold mb-2">{title}</h1>
        <p className="text-gray-400 text-sm mb-4">
          📅 {date} · 📍 {location}
        </p>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {images.map((src, i) => (
            <div
              key={i}
              className="w-full bg-gray-900 rounded-lg overflow-hidden shadow-lg cursor-pointer group flex items-center justify-center relative"
              onClick={() => setSelectedIndex(i)}
              style={{ minHeight: 200 }}
            >
              {!loaded[i] && <Spinner />}
              <Image
                src={src}
                alt={`${altText} ${i + 1}`}
                width={600}
                height={400}
                className={`object-cover w-full h-auto transition-transform duration-300 group-hover:scale-105 ${loaded[i] ? "opacity-100" : "opacity-0"}`}
                style={{ aspectRatio: '4/3', display: 'block' }}
                priority={i < 6}
                onLoad={() => handleImageLoad(i)}
              />
            </div>
          ))}
        </div>

        {/* Fullscreen Modal */}
        {selectedIndex !== null && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedIndex(null)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Left Arrow */}
            {selectedIndex > 0 && (
              <button
                className="absolute left-4 bottom-4 top-auto -translate-y-0 md:left-8 md:top-1/2 md:bottom-auto md:-translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-80 text-white rounded-full p-4 z-50 flex items-center justify-center"
                style={{ fontSize: 32 }}
                onClick={e => { e.stopPropagation(); setSelectedIndex(selectedIndex - 1); }}
                aria-label="Previous photo"
              >
                &#8592;
              </button>
            )}
            {/* Right Arrow */}
            {selectedIndex < images.length - 1 && (
              <button
                className="absolute right-4 bottom-4 top-auto -translate-y-0 md:right-8 md:top-1/2 md:bottom-auto md:-translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-80 text-white rounded-full p-4 z-50 flex items-center justify-center"
                style={{ fontSize: 32 }}
                onClick={e => { e.stopPropagation(); setSelectedIndex(selectedIndex + 1); }}
                aria-label="Next photo"
              >
                &#8594;
              </button>
            )}
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center">
              {!modalLoaded && <Spinner />}
              <Image
                src={images[selectedIndex]}
                alt={altText}
                fill
                className={`object-contain ${modalLoaded ? "opacity-100" : "opacity-0"}`}
                priority
                onLoad={() => setModalLoaded(true)}
              />
              <button
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-opacity"
                onClick={e => { e.stopPropagation(); setSelectedIndex(null); }}
                aria-label="Close modal"
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
