'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter, CoinbaseWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Importer default styles
require('@solana/wallet-adapter-react-ui/styles.css');

interface Props {
  children: ReactNode;
}

export const SolanaWalletProvider: FC<Props> = ({ children }) => {
  // Use better RPC endpoint - Helius free tier is more reliable
  // Alternative: Use your own RPC from Alchemy, QuickNode, or Helius
  const endpoint = useMemo(() => 
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
    'https://mainnet.helius-rpc.com/?api-key=demo' || 
    clusterApiUrl('mainnet-beta'), 
  []);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

