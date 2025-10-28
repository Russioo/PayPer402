'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
  const { connected, publicKey } = useWallet();
  
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
      <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3 hover:opacity-60 transition-opacity">
          <span className="font-semibold text-black text-xl">PayPer402</span>
          <span className="px-2 py-0.5 bg-black/5 text-[10px] font-medium text-black/40 uppercase tracking-wider">
            402 Protocol
          </span>
        </Link>
        
        <nav className="flex items-center gap-8 text-sm">
          <Link href="/#generate" className="text-black/40 hover:text-black transition-colors font-medium">
            Generate
          </Link>
          <Link href="/about" className="text-black/40 hover:text-black transition-colors font-medium">
            About
          </Link>
          <Link href="/docs" className="text-black/40 hover:text-black transition-colors font-medium">
            Documentation
          </Link>
          
          {/* Wallet Connect Button */}
          <div className="wallet-button-wrapper">
            <WalletMultiButton />
          </div>
        </nav>
      </div>
    </header>
  );
}
