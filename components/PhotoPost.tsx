import React from "react"

type PhotoPostProps = {
  title: string;
  date: string;
  location: string;
  imageSrc: string;
  altText: string;
  description: React.ReactNode;
};

export default function PhotoPost({
  title,
  date,
  location,
  imageSrc,
  altText,
  description,
}: PhotoPostProps) {
  return (
    <main className="min-h-screen bg-black text-white px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-gray-400 mb-2">
          📅 {date} · 📍 {location}
        </p>
        <img
          src={imageSrc}
          alt={altText}
          className="w-full h-auto my-6 rounded-lg shadow-lg"
        />
        <div className="text-lg text-gray-300 leading-relaxed mt-6">
          {description}
        </div>
      </div>
    </main>
  );
}
