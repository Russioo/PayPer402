import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SolanaWalletProvider } from '@/components/WalletProvider';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'PayPer402 - AI Generation via HTTP 402 Protocol',
  description: 'Generate videos & images with Sora 2, Veo 3.1, and more. Pay only for what you use via HTTP 402 payment protocol.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
