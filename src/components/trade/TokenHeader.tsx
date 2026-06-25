'use client';

import Image from 'next/image';
import { TokenOverview, formatUSD, formatPct } from '@/lib/birdeye';
import { cn } from '@/lib/utils';

interface TokenHeaderProps {
  overview: TokenOverview | null;
  address: string;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="font-bold text-sm">{value}</div>
    </div>
  );
}

export function TokenHeader({ overview, address }: TokenHeaderProps) {
  if (!overview) {
    return (
      <div className="flex items-center gap-3 p-4 border-b border-white/5">
        <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse" />
        <div>
          <div className="w-20 h-4 bg-zinc-800 rounded animate-pulse mb-1" />
          <div className="w-32 h-3 bg-zinc-800 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const isPositive = (overview.priceChange24hPercent || 0) >= 0;

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800 shrink-0">
          {overview.logoURI && (
            <Image src={overview.logoURI} alt={overview.symbol} fill className="object-cover" unoptimized
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
        </div>
        <div>
          <div className="font-black text-xl">{overview.symbol}</div>
          <div className="text-xs text-zinc-500">{overview.name}</div>
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-mono font-bold text-2xl">{formatUSD(overview.price)}</span>
        <span className={cn('font-bold text-sm', isPositive ? 'text-lime-400' : 'text-red-400')}>
          {formatPct(overview.priceChange24hPercent || 0)}
        </span>
      </div>

      <div className="flex gap-6 ml-auto flex-wrap">
        <Stat label="Market Cap" value={formatUSD(overview.mc || 0)} />
        <Stat label="24h Volume" value={formatUSD(overview.v24hUSD || 0)} />
        <Stat label="Liquidity" value={formatUSD(overview.liquidity || 0)} />
      </div>
    </div>
  );
}
