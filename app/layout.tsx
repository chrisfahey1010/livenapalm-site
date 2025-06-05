import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';

export const metadata = {
  title: 'LiveNapalm',
  description: 'Concert photography and software project by Chris Fahey',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-sans">
        <header className="bg-black border-b border-gray-800 p-4">
          <nav className="max-w-4xl mx-auto flex justify-between">
            <Link href="/" className="flex items-center">
              <img
                src="/logo_text.png"
                alt="LiveNapalm"
                className="h-8 w-auto object-contain hover:opacity-80 transition" 
              />
            </Link>
            <div className="space-x-6">
              <Link href="/" className="hover:text-gray-300">Home</Link>
              <Link href="/about" className="hover:text-gray-300">About</Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
