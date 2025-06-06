export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-black px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About LiveNapalm</h1>
        <p className="mb-4 text-lg leading-relaxed">
          I am Chris Fahey — a software engineer with 5+ years of industry experience, and the photographer behind
          <strong> LiveNapalm</strong>.
        </p>
        <p className="mb-4 text-lg leading-relaxed">
          I have been photographing concerts since 2023, and editing the RAW photos using Darktable to create distinct and realistic captures of energy in the moment. I shoot using a Canon R6 mark II and a Canon M50, paired with wide-aperture prime lenses.
        </p>
        <p className="text-lg leading-relaxed">
          This site is built from the ground up using modern web technology to showcase high-resolution photography in a way that’s searchable, filterable, and fast. I’m building it in public to demonstrate my skills and continue growing as an engineer.
        </p>
        <img
          src="/me.jpg"
          alt="Chris Fahey in corpsepaint"
          className="mx-auto h-auto w-100 mb-6 rounded-sm shadow-lg" 
        />
      </div>
    </main>
  );
}
