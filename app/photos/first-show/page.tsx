export default function FirstPhotoPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">SPECTRAL WOUND at Northwest Terror Fest 2025</h1>
        <p className="text-gray-400 mb-2">📅 2025-05-09 · 📍 Seattle, WA</p>
        <img
          src="/photos/first-show.jpg"
          alt="Spectral Wound at NWTF 25"
          className="w-full h-auto my-6 rounded-lg shadow-lg"
        />
        <p className="text-lg text-gray-300 leading-relaxed">
          Less and Less, O Savage Spirit...
        </p>
      </div>
    </main>
  );
}
