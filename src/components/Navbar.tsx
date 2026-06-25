'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AuthButton } from './AuthButton';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-black/70 backdrop-blur-xl border-b border-white/[0.06]">
      <Link href="/" className="flex items-center gap-2.5">
        <Image
          src="/chad-dark.png"
          alt="ChadWallet"
          width={34}
          height={34}
          className="rounded-full"
        />
        <span className="font-black text-xl tracking-tight text-white">ChadWallet</span>
      </Link>

      <div className="flex items-center gap-8">
        <Link href="/" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors hidden md:block">
          Home
        </Link>
        <Link href="/trade/So11111111111111111111111111111111111111112" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors hidden md:block">
          Trade
        </Link>
        <AuthButton size="sm" />
      </div>
    </nav>
  );
}
