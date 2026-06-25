import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ChadWallet — Trade Solana Like a Chad',
  description: 'The ultimate Solana trading experience. Buy, sell, and ape into tokens with ChadWallet.',
  icons: {
    icon: '/chad-dark.png',
    apple: '/chad-dark.png',
  },
  openGraph: {
    title: 'ChadWallet — Trade Solana Like a Chad',
    description: 'The ultimate Solana trading experience.',
    images: ['/chad-dark.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="bg-[#0a0a0a] text-white font-sans antialiased min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
