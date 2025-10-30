'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
  const { connected, publicKey } = useWallet();
  
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2 sm:gap-3 hover:opacity-60 transition-opacity">
          <span className="font-semibold text-black text-base sm:text-lg md:text-xl">PayPer402</span>
          <span className="hidden xs:inline-block px-2 py-0.5 bg-black/5 text-[9px] sm:text-[10px] font-medium text-black/40 uppercase tracking-wider">
            402 Protocol
          </span>
        </Link>
        
        <nav className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 text-xs sm:text-sm">
          <Link href="/#generate" className="hidden md:inline text-black/40 hover:text-black transition-colors font-medium">
            Generate
          </Link>
          <Link href="/about" className="hidden sm:inline text-black/40 hover:text-black transition-colors font-medium">
            About
          </Link>
          <Link href="/docs" className="hidden lg:inline text-black/40 hover:text-black transition-colors font-medium">
            Documentation
          </Link>
          
          {/* Wallet Connect Button */}
          <div className="wallet-button-wrapper">
            <WalletMultiButton className="!text-xs sm:!text-sm !py-2 sm:!py-2.5 !px-3 sm:!px-4" />
          </div>
        </nav>
      </div>
    </header>
  );
}
