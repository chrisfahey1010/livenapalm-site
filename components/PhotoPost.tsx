"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

type ExifData = Record<string, string | number | boolean | null | undefined>;
type PhotoPostImage = {
  src: string;
  width: number;
  height: number;
  alt?: string;
  downloadUrl?: string;
  exif: ExifData | null;
};

// Helper function to create Google Maps URL from GPS coordinates
const createGoogleMapsUrl = (gpsPosition: string): string => {
  const [lat, lng] = gpsPosition.split(' ').map(Number);
  return `https://www.google.com/maps?q=${lat},${lng}`;
};

type PhotoPostProps = {
  title: string;
  date: string;
  location: string;
  images: PhotoPostImage[];
  altText: string;
  albumUrl?: string;
  description: React.ReactNode;
};

// Image-based spinner component
function Spinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <Image
        src="/spinner.png"
        alt="Loading..."
        width={40}
        height={40}
        className="animate-spin"
      />
    </div>
  );
}

export default function PhotoPost({
  title,
  date,
  location,
  images,
  altText,
  albumUrl,
  description,
}: PhotoPostProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<boolean[]>(Array(images.length).fill(false));
  const [modalLoaded, setModalLoaded] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const [showExif, setShowExif] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Detect iOS (iPhone/iPad/iPod)
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const selectedImage = selectedIndex === null ? null : images[selectedIndex];
  const selectedPhotoUrl = selectedImage?.downloadUrl || selectedImage?.src;

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
    setIsSwiping(true);
    setSwipeOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    touchEndX.current = e.touches[0].clientX;
    const delta = touchEndX.current - touchStartX.current;
    
    // Calculate swipe offset as a percentage of screen width
    const screenWidth = window.innerWidth;
    const offsetPercentage = (delta / screenWidth) * 100;
    
    // Limit the swipe offset to prevent excessive movement
    const limitedOffset = Math.max(Math.min(offsetPercentage, 30), -30);
    setSwipeOffset(limitedOffset);
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null && selectedIndex !== null) {
      const delta = touchEndX.current - touchStartX.current;
      const screenWidth = window.innerWidth;
      const threshold = screenWidth * 0.2; // 20% of screen width threshold

      if (delta > threshold && selectedIndex > 0) {
        // Swipe right - go to previous
        setSwipeOffset(100);
        setTimeout(() => {
          setSelectedIndex(selectedIndex - 1);
          setSwipeOffset(0);
        }, 300);
      } else if (delta < -threshold && selectedIndex < images.length - 1) {
        // Swipe left - go to next
        setSwipeOffset(-100);
        setTimeout(() => {
          setSelectedIndex(selectedIndex + 1);
          setSwipeOffset(0);
        }, 300);
      } else {
        // Return to center
        setSwipeOffset(0);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setIsSwiping(false);
  };

  // Reset swipe offset when changing images
  useEffect(() => {
    setSwipeOffset(0);
  }, [selectedIndex]);

  return (
    <main className="min-h-screen bg-black text-white px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl font-bold mb-2">{title}</h1>
        <p className="text-gray-400 text-sm mb-4">
          📅 {date} · 📍 {location}
        </p>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {images.map((img, i) => (
            <div
              key={i}
              className="w-full bg-gray-900 rounded-lg overflow-hidden shadow-lg cursor-pointer group flex items-center justify-center relative"
              onClick={() => setSelectedIndex(i)}
              style={{ minHeight: 100 }}
            >
              {!loaded[i] && <Spinner />}
              <Image
                src={img.src}
                alt={img.alt || `${altText} ${i + 1}`}
                width={img.width || 500}
                height={img.height || 500}
                sizes="(max-width: 768px) 50vw, 33vw"
                quality={85}
                className={`object-cover w-full h-full transition-transform duration-300 [@media(hover:hover)]:group-hover:scale-105 ${loaded[i] ? "opacity-100" : "opacity-0"}`}
                style={{ aspectRatio: '1/1', display: 'block' }}
                priority={i < 6}
                onLoad={() => handleImageLoad(i)}
              />
            </div>
          ))}
        </div>

        {/* Flickr Album Link */}
        {albumUrl && (
          <div className="flex justify-center mb-8">
            <a
              href={albumUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-white text-black rounded-lg shadow [@media(hover:hover)]:hover:bg-gray-200 transition"
            >
              Open Flickr Album
            </a>
          </div>
        )}

        {/* Fullscreen Modal */}
        {selectedIndex !== null && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-gray-300 z-20">
                ({selectedIndex + 1} of {images.length})
            </div>
            <div className="relative w-full h-full max-w-8xl max-h-[90vh] flex items-center justify-center">
              {!modalLoaded && !showExif && <Spinner />}
              {showExif ? (
                <div className="bg-black bg-opacity-80 text-white rounded-lg p-6 max-h-[70vh] w-full max-w-2xl overflow-y-auto shadow-lg border border-gray-700">
                  <h2 className="text-lg font-bold mb-4">EXIF Data</h2>
                  {images[selectedIndex].exif ? (
                    <table className="w-full text-sm">
                      <tbody>
                        {Object.entries(images[selectedIndex].exif).map(([key, value]) => (
                          <tr key={key} className="border-b border-gray-700 last:border-b-0">
                            <td className="pr-4 py-1 text-gray-400 whitespace-nowrap align-top">{key}</td>
                            <td className="py-1 break-all">
                              {key === 'GPSPosition' && typeof value === 'string' ? (
                                <a
                                  href={createGoogleMapsUrl(value)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 [@media(hover:hover)]:hover:text-blue-300 underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {value}
                                </a>
                              ) : (
                                String(value)
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div>No EXIF data available for this photo.</div>
                  )}
                </div>
              ) : (
                <div 
                  className="relative w-full h-full"
                  style={{
                    transform: `translateX(${swipeOffset}%)`,
                    transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
                  }}
                >
                  <Image
                    src={images[selectedIndex].src}
                    alt={images[selectedIndex].alt || altText}
                    fill
                    sizes="100vw"
                    quality={90}
                    className={`object-contain ${modalLoaded ? "opacity-100" : "opacity-0"}`}
                    priority
                    onLoad={() => setModalLoaded(true)}
                  />
                </div>
              )}
              <button
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 [@media(hover:hover)]:hover:bg-opacity-75 transition-opacity"
                onClick={e => { e.stopPropagation(); setSelectedIndex(null); setShowExif(false); }}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            {/* Bottom Navbar for navigation, exif, and download */}
            <div className="fixed left-0 right-0 bottom-0 w-screen bg-black bg-opacity-80 flex items-center justify-between px-4 z-50 gap-2 max-w-[100vw]">
              {/* Left Arrow */}
              {selectedIndex > 0 ? (
                <button
                  className="text-white rounded-full p-3 flex items-center justify-center [@media(hover:hover)]:hover:bg-white [@media(hover:hover)]:hover:bg-opacity-10 transition"
                  style={{ fontSize: 32 }}
                  onClick={e => { e.stopPropagation(); setSelectedIndex(selectedIndex - 1); setShowExif(false); }}
                  aria-label="Previous photo"
                >
                  ⬅️
                </button>
              ) : <div className="w-12" />} {/* Spacer for alignment */}
              {/* View EXIF Button */}
              <button
                className="inline-flex items-center justify-center w-32 px-3 py-2 bg-gray-800 text-white rounded shadow [@media(hover:hover)]:hover:bg-gray-700 transition whitespace-nowrap"
                aria-label={showExif ? "View Photo" : "View EXIF"}
                onClick={e => { e.stopPropagation(); setShowExif(v => !v); }}
              >
                {showExif ? "View Photo" : "View EXIF"}
              </button>
              {/* Flickr Photo Link */}
              <a
                href={selectedPhotoUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center w-32 px-3 py-2 bg-white text-black rounded shadow [@media(hover:hover)]:hover:bg-gray-200 transition ${!selectedPhotoUrl ? 'opacity-60 pointer-events-none' : ''}`}
                aria-label="View photo on Flickr"
                onClick={e => { 
                  if (!selectedPhotoUrl) {
                    e.preventDefault();
                  }
                  e.stopPropagation(); 
                }}
              >
                {isIOS ? "Open Photo" : "View Flickr"}
              </a>
              {/* Right Arrow */}
              {selectedIndex < images.length - 1 ? (
                <button
                  className="text-white rounded-full p-3 flex items-center justify-center [@media(hover:hover)]:hover:bg-white [@media(hover:hover)]:hover:bg-opacity-10 transition"
                  style={{ fontSize: 32 }}
                  onClick={e => { e.stopPropagation(); setSelectedIndex(selectedIndex + 1); setShowExif(false); }}
                  aria-label="Next photo"
                >
                  ➡️
                </button>
              ) : <div className="w-12" />} {/* Spacer for alignment */}
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
