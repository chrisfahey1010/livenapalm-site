export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">LiveNapalm</h1>
        <p className="text-xl text-gray-300 mb-8">
          A high-voltage archive of Pacific Northwest metal concerts — captured through the lens of Chris Fahey.
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
