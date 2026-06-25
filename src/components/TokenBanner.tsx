'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TrendingToken, formatUSD, formatPct } from '@/lib/birdeye';
import { cn } from '@/lib/utils';

interface TokenBannerProps {
  tokens: TrendingToken[];
  reverse?: boolean;
  speed?: number;
  size?: 'sm' | 'lg';
}

function TokenTile({
  token,
  onClick,
  size = 'lg',
}: {
  token: TrendingToken;
  onClick: () => void;
  size?: 'sm' | 'lg';
}) {
  const isPositive = token.priceChange24hPercent >= 0;

  if (size === 'sm') {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2.5 px-5 py-2.5 mx-1.5 shrink-0 group hover:opacity-80 transition-opacity"
      >
        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-zinc-800 shrink-0 ring-1 ring-white/10">
          {token.logoURI && (
            <Image src={token.logoURI} alt={token.symbol} fill className="object-cover" unoptimized
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
        </div>
        <span className="font-black text-sm text-white tracking-tight">{token.symbol}</span>
        <span className="text-zinc-500 text-sm font-mono">{formatUSD(token.price)}</span>
        <span className={cn('text-xs font-bold', isPositive ? 'text-lime-400' : 'text-red-400')}>
          {isPositive ? '▲' : '▼'} {Math.abs(token.priceChange24hPercent).toFixed(2)}%
        </span>
        <span className="text-zinc-700 ml-1">·</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-6 py-4 mx-2 shrink-0 group cursor-pointer hover:opacity-75 transition-opacity"
    >
      {/* Token logo */}
      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-zinc-800 shrink-0 ring-1 ring-white/10 group-hover:ring-lime-400/50 transition-all">
        {token.logoURI && (
          <Image
            src={token.logoURI}
            alt={token.symbol}
            fill
            className="object-cover"
            unoptimized
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
      </div>

      {/* Symbol + price */}
      <div className="flex flex-col items-start leading-tight">
        <span className="font-black text-base text-white tracking-tight">{token.symbol}</span>
        <span className="text-zinc-500 text-xs font-mono">{formatUSD(token.price)}</span>
      </div>

      {/* Change badge */}
      <div className={cn(
        'flex items-center gap-0.5 px-2 py-1 rounded-md text-xs font-black',
        isPositive ? 'bg-lime-400/15 text-lime-400' : 'bg-red-500/15 text-red-400'
      )}>
        {isPositive ? '▲' : '▼'} {Math.abs(token.priceChange24hPercent).toFixed(2)}%
      </div>

      {/* divider dot */}
      <span className="text-zinc-700 text-lg ml-1">·</span>
    </button>
  );
}

export function TokenBanner({ tokens, reverse = false, speed = 35, size = 'lg' }: TokenBannerProps) {
  const router = useRouter();
  // Triple to ensure seamless loop even on wide screens
  const tripled = [...tokens, ...tokens, ...tokens];

  return (
    <div className={cn(
      'w-full overflow-hidden bg-black border-y border-white/[0.06] select-none',
      size === 'lg' ? 'py-1' : 'py-0'
    )}>
      <div
        className={cn(
          'flex items-center w-max',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        {tripled.map((token, i) => (
          <TokenTile
            key={`${token.address}-${i}`}
            token={token}
            size={size}
            onClick={() => router.push(`/trade/${token.address}`)}
          />
        ))}
      </div>
    </div>
  );
}
