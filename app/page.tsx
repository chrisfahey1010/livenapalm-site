export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <img
          src="/logo.png"
          alt="LiveNapalm Logo"
          className="mx-auto h-32 w-auto mb-6" 
        />
        <p className="text-xl text-gray-300 mb-8">
          Gonzo concert photography in the Pacific Northwest by Chris Fahey
        </p>
        <a
          href="/about"
          className="inline-block mt-4 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition"
        >
          Learn More
        </a>
      </div>
    </main>
  );
}
