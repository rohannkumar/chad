'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TrendingToken, formatUSD, formatPct } from '@/lib/birdeye';
import { cn } from '@/lib/utils';

interface TrendingListProps {
  tokens: TrendingToken[];
  activeAddress: string;
}

export function TrendingList({ tokens, activeAddress }: TrendingListProps) {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-white/5">
        <h2 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">Trending</h2>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {tokens.map((token, i) => (
          <button
            key={token.address}
            onClick={() => router.push(`/trade/${token.address}`)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all text-left',
              activeAddress === token.address && 'bg-lime-400/10 border-r-2 border-lime-400'
            )}
          >
            <span className="text-xs text-zinc-600 w-4 shrink-0">{i + 1}</span>
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 shrink-0">
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
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{token.symbol}</div>
              <div className="text-xs text-zinc-600 truncate">{formatUSD(token.v24hUSD)}</div>
            </div>
            <div className={cn('text-xs font-bold shrink-0', token.priceChange24hPercent >= 0 ? 'text-lime-400' : 'text-red-400')}>
              {formatPct(token.priceChange24hPercent)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
