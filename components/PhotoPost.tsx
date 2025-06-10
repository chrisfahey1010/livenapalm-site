"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

type ExifData = Record<string, string | number | boolean | null | undefined>;
type PhotoPostImage = {
  src: string;
  exif: ExifData | null;
};

type PhotoPostProps = {
  title: string;
  date: string;
  location: string;
  images: PhotoPostImage[];
  altText: string;
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
  description,
}: PhotoPostProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<boolean[]>(Array(images.length).fill(false));
  const [modalLoaded, setModalLoaded] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showExif, setShowExif] = useState(false);
  const [downloadingAlbum, setDownloadingAlbum] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextImageIndex, setNextImageIndex] = useState<number | null>(null);

  // Detect iOS (iPhone/iPad/iPod)
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

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
    setSlideDirection(null);
    setNextImageIndex(null);
  }, [selectedIndex]);

  // Handle navigation with animation
  const handleNavigate = (newIndex: number) => {
    if (selectedIndex === null || isTransitioning) return;
    
    setIsTransitioning(true);
    setNextImageIndex(newIndex);
    // Set slide direction based on the direction of navigation
    setSlideDirection(newIndex > selectedIndex ? 'left' : 'right');
    
    // Wait for the animation to complete before updating the index
    setTimeout(() => {
      setSelectedIndex(newIndex);
      setShowExif(false);
      setIsTransitioning(false);
      setNextImageIndex(null);
    }, 300); // Match this with the CSS transition duration
  };

  // Keyboard navigation for modal
  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && selectedIndex > 0) {
        handleNavigate(selectedIndex - 1);
      } else if (e.key === "ArrowRight" && selectedIndex < images.length - 1) {
        handleNavigate(selectedIndex + 1);
      } else if (e.key === "Escape") {
        setSelectedIndex(null);
        setShowExif(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, images.length, isTransitioning]);

  // Touch/swipe navigation for modal
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null && selectedIndex !== null && !isTransitioning) {
      const delta = touchEndX.current - touchStartX.current;
      if (delta > 50 && selectedIndex > 0) {
        handleNavigate(selectedIndex - 1);
      } else if (delta < -50 && selectedIndex < images.length - 1) {
        handleNavigate(selectedIndex + 1);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Fetch presigned download URL when modal is open and selectedIndex changes
  useEffect(() => {
    if (selectedIndex !== null) {
      setDownloadUrl(null);
      setDownloading(true);
      // Get the S3 key from the image URL
      const url = images[selectedIndex].src;
      const key = url.split(".com/")[1];
      fetch(`/api/presigned-download?key=${encodeURIComponent(key)}`)
        .then(res => res.json())
        .then(data => {
          setDownloadUrl(data.url);
          setDownloading(false);
        })
        .catch(() => setDownloading(false));
    }
  }, [selectedIndex, images]);

  // Handle album download
  const handleAlbumDownload = async () => {
    if (!images.length) return;
    
    setDownloadingAlbum(true);
    try {
      // Get the album prefix from the first image URL
      const firstImageUrl = images[0].src;
      const prefix = firstImageUrl.split('.com/')[1].split('/').slice(0, -1).join('/');
      
      const response = await fetch(`/api/download-album?prefix=${encodeURIComponent(prefix)}`);
      
      if (!response.ok) {
        throw new Error('Failed to download album');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${prefix.split('/').pop() || 'album'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading album:', error);
      alert('Failed to download album. Please try again.');
    } finally {
      setDownloadingAlbum(false);
    }
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
          {images.map((img, i) => (
            <div
              key={i}
              className="w-full bg-gray-900 rounded-lg overflow-hidden shadow-lg cursor-pointer group flex items-center justify-center relative"
              onClick={() => setSelectedIndex(i)}
              style={{ minHeight: 200 }}
            >
              {!loaded[i] && <Spinner />}
              <Image
                src={img.src}
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

        {/* Download Album Button */}
        {!isIOS && (
          <div className="flex justify-center mb-8">
            <button
              onClick={handleAlbumDownload}
              disabled={downloadingAlbum}
              className="inline-flex items-center px-6 py-3 bg-white text-black rounded-lg shadow hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingAlbum ? (
                <>
                  <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                  Downloading...
                </>
              ) : (
                'Download Album'
              )}
            </button>
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
            <div className="relative w-full h-full max-w-8xl max-h-[90vh] flex items-center justify-center overflow-hidden">
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
                            <td className="py-1 break-all">{String(value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div>No EXIF data available for this photo.</div>
                  )}
                </div>
              ) : (
                <>
                  {/* Current Image */}
                  <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                    slideDirection === 'left' ? 'translate-x-[-100%]' :
                    slideDirection === 'right' ? 'translate-x-[100%]' :
                    'translate-x-0'
                  }`}>
                    <Image
                      src={images[selectedIndex].src}
                      alt={altText}
                      fill
                      className={`object-contain ${modalLoaded ? "opacity-100" : "opacity-0"}`}
                      priority
                      onLoad={() => setModalLoaded(true)}
                    />
                  </div>
                  {/* Next Image (if transitioning) */}
                  {nextImageIndex !== null && (
                    <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                      slideDirection === 'left' ? 'translate-x-[100%]' :
                      slideDirection === 'right' ? 'translate-x-[-100%]' :
                      'translate-x-0'
                    }`}>
                      <Image
                        src={images[nextImageIndex].src}
                        alt={altText}
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  )}
                </>
              )}
              <button
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-opacity"
                onClick={e => { e.stopPropagation(); setSelectedIndex(null); setShowExif(false); }}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            {/* Bottom Navbar for navigation, exif, and download */}
            <div className="fixed left-0 right-0 bottom-0 w-full bg-black bg-opacity-80 flex items-center justify-between px-4 z-50 gap-2">
              {/* Left Arrow */}
              {selectedIndex > 0 ? (
                <button
                  className="text-white rounded-full p-4 flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition"
                  style={{ fontSize: 32 }}
                  onClick={e => { e.stopPropagation(); handleNavigate(selectedIndex - 1); }}
                  aria-label="Previous photo"
                  disabled={isTransitioning}
                >
                  ⬅️
                </button>
              ) : <div className="w-16" />}
              {/* View EXIF Button */}
              <button
                className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded shadow hover:bg-gray-700 transition mx-2"
                aria-label={showExif ? "View Photo" : "View EXIF"}
                onClick={e => { e.stopPropagation(); setShowExif(v => !v); }}
                disabled={isTransitioning}
              >
                {showExif ? "View Photo" : "View EXIF"}
              </button>
              {/* Download Button */}
              {!isIOS && (
                <a
                  href={downloadUrl || undefined}
                  download
                  className={`inline-flex items-center px-4 py-2 bg-white text-black rounded shadow hover:bg-gray-200 transition ${!downloadUrl ? 'opacity-60 pointer-events-none' : ''}`}
                  aria-label="Download photo"
                  onClick={e => { if (!downloadUrl) e.preventDefault(); e.stopPropagation(); }}
                >
                  {downloading ? <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" /> : "Download"}
                </a>
              )}
              {/* Right Arrow */}
              {selectedIndex < images.length - 1 ? (
                <button
                  className="text-white rounded-full p-4 flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition"
                  style={{ fontSize: 32 }}
                  onClick={e => { e.stopPropagation(); handleNavigate(selectedIndex + 1); }}
                  aria-label="Next photo"
                  disabled={isTransitioning}
                >
                  ➡️
                </button>
              ) : <div className="w-16" />}
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
