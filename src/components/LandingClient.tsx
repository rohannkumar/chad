'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingToken, formatUSD, formatPct } from '@/lib/birdeye';
import { TokenBanner } from './TokenBanner';
import { AuthButton } from './AuthButton';
import { ChadCoin } from './ChadCoin';
import { cn } from '@/lib/utils';

interface LandingClientProps {
  tokens: TrendingToken[];
}

/* ─── Navbar ──────────────────────────────────────────────── */
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-black/70 backdrop-blur-xl border-b border-white/[0.06]">
      <Link href="/" className="flex items-center gap-2.5">
        <Image
          src="/chad-dark.png"
          alt="ChadWallet"
          width={36}
          height={36}
          className="rounded-full"
        />
        <span className="font-black text-xl tracking-tight text-white">ChadWallet</span>
      </Link>

      <div className="flex items-center gap-8">
        <Link href="#features" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors hidden md:block">
          Features
        </Link>
        <Link href="/trade/So11111111111111111111111111111111111111112" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors hidden md:block">
          Trade
        </Link>
        <AuthButton size="sm" />
      </div>
    </nav>
  );
}

/* ─── App Store Buttons ───────────────────────────────────── */
function AppButtons() {
  return (
    <div className="flex items-center gap-3 flex-wrap justify-center">
      <a
        href="https://apps.apple.com/us/app/chadwallet/id6757367474"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-all"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        <div>
          <div className="text-[10px] text-zinc-500 leading-none">Download on the</div>
          <div className="text-sm font-bold text-white leading-tight">App Store</div>
        </div>
      </a>
      <a
        href="https://play.google.com/store/apps/details?id=xyz.chadwallet.www"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-all"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.18 23.76c.33.18.71.19 1.06.04L15.5 12 4.24.2C3.89.05 3.51.06 3.18.24 2.5.61 2.5 1.76 2.5 1.76v20.48s0 1.15.68 1.52zM16.5 13l2.79 2.79-9.8 5.64L16.5 13zM19.29 8.21L16.5 11 9.49 2.57l9.8 5.64zM20.5 10.56l-2.09 2.44 2.09 2.44c.83-.44.83-1.55.83-2.44s0-2-.83-2.44z" />
        </svg>
        <div>
          <div className="text-[10px] text-zinc-500 leading-none">Get it on</div>
          <div className="text-sm font-bold text-white leading-tight">Google Play</div>
        </div>
      </a>
    </div>
  );
}

/* ─── Token card ──────────────────────────────────────────── */
function TokenCard({ token }: { token: TrendingToken }) {
  const router = useRouter();
  const pos = token.priceChange24hPercent >= 0;
  return (
    <button
      onClick={() => router.push(`/trade/${token.address}`)}
      className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.06] transition-all text-left group"
    >
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-900 shrink-0">
        {token.logoURI && (
          <Image src={token.logoURI} alt={token.symbol} fill className="object-cover" unoptimized
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-black text-sm group-hover:text-lime-400 transition-colors">{token.symbol}</div>
        <div className="text-zinc-600 text-xs truncate">{token.name}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-mono font-bold text-sm">{formatUSD(token.price)}</div>
        <div className={cn('text-xs font-bold', pos ? 'text-lime-400' : 'text-red-400')}>
          {pos ? '+' : ''}{token.priceChange24hPercent.toFixed(2)}%
        </div>
      </div>
    </button>
  );
}

/* ─── Feature pill ────────────────────────────────────────── */
function Feature({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
      <span className="text-2xl">{icon}</span>
      <span className="font-semibold text-sm text-zinc-300">{label}</span>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────── */
export function LandingClient({ tokens }: LandingClientProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col overflow-x-hidden">
      <Nav />

      {/* ── TOP BANNER — immediately below nav ── */}
      <div className="mt-16">
        <TokenBanner tokens={tokens} reverse={false} speed={30} size="lg" />
      </div>

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-16 pb-20 overflow-hidden">
        {/* Background radial glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-lime-400/[0.07] rounded-full blur-[120px]" />
        </div>

        {/* Spinning coin with real chad logo */}
        <div className="mb-10">
          <ChadCoin size={160} />
        </div>

        {/* Headline */}
        <h1 className="text-[clamp(3rem,10vw,7rem)] font-black leading-[0.88] tracking-[-0.03em] mb-6 max-w-4xl">
          where traders
          <br />
          <span className="text-lime-400">become chads</span>
        </h1>

        <p className="text-zinc-500 text-lg md:text-xl max-w-lg mb-10 font-medium leading-relaxed">
          From memecoins to viral tokens, trade any Solana crypto in seconds.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <AuthButton size="lg" />
          <button
            onClick={() => router.push(`/trade/${tokens[0]?.address || 'So11111111111111111111111111111111111111112'}`)}
            className="px-8 py-4 text-base font-bold rounded-2xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all"
          >
            Start trading →
          </button>
        </div>

        {/* App store badges */}
        <AppButtons />
      </section>

      {/* ── SECOND BANNER (reverse direction) ── */}
      <TokenBanner tokens={tokens} reverse={true} speed={25} size="lg" />

      {/* ── TRENDING TOKENS GRID ── */}
      <section id="features" className="py-20 px-4 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-3">Trending Now</h2>
          <p className="text-zinc-600 text-sm">Tap any token to trade instantly</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tokens.slice(0, 8).map((t) => <TokenCard key={t.address} token={t} />)}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-4 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-3">Built different</h2>
          <p className="text-zinc-600 text-sm">Everything a chad needs to dominate Solana</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Feature icon="⚡" label="Instant Jupiter swaps" />
          <Feature icon="📊" label="Real-time price charts" />
          <Feature icon="🔒" label="Self-custody wallet" />
          <Feature icon="🔥" label="Live trending tokens" />
          <Feature icon="📱" label="iOS & Android app" />
          <Feature icon="🌐" label="Solana native" />
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-20 px-4 text-center">
        <div className="flex justify-center mb-10">
          <ChadCoin size={90} />
        </div>
        <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
          Ready to trade
          <br />
          <span className="text-lime-400">like a chad?</span>
        </h2>
        <p className="text-zinc-600 mb-10 text-lg max-w-md mx-auto">
          Download the app or jump straight into the web trader.
        </p>
        <div className="flex flex-col items-center gap-6">
          <AuthButton size="lg" />
          <AppButtons />
        </div>
      </section>

      {/* ── BOTTOM STICKY BANNER ── */}
      <div className="sticky bottom-0 z-40">
        <TokenBanner tokens={tokens} reverse={false} speed={20} size="sm" />
      </div>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-white/[0.04] text-center text-zinc-700 text-xs">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Image src="/chad-dark.png" alt="ChadWallet" width={20} height={20} className="rounded-full opacity-60" />
          <span className="font-bold text-zinc-500">ChadWallet</span>
        </div>
        © 2025 ChadWallet. NFA. DYOR. Trade responsibly.
      </footer>
    </div>
  );
}
