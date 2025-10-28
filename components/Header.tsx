'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-8 py-8 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3 hover:opacity-60 transition-opacity">
          <span className="font-semibold text-black text-xl">PayPer402</span>
          <span className="px-2 py-0.5 bg-black/5 text-[10px] font-medium text-black/40 uppercase tracking-wider">
            402 Protocol
          </span>
        </Link>
        
        <nav className="flex items-center gap-12 text-sm">
          <Link href="/#generate" className="text-black/40 hover:text-black transition-colors font-medium">
            Generate
          </Link>
          <Link href="/about" className="text-black/40 hover:text-black transition-colors font-medium">
            About
          </Link>
          <Link href="/docs" className="text-black/40 hover:text-black transition-colors font-medium">
            Documentation
          </Link>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-black/20"></div>
              <span className="text-black/30 font-medium">5 Models</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-black/20"></div>
              <span className="text-black/30 font-medium">Pay-per-use</span>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
