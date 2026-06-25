'use client';

import { useEffect, useState } from 'react';
import { Trade, formatUSD, shortenAddress } from '@/lib/birdeye';
import { cn } from '@/lib/utils';

interface LiveTradesProps {
  trades: Trade[];
  symbol?: string;
}

export function LiveTrades({ trades: initialTrades, symbol = 'TOKEN' }: LiveTradesProps) {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);

  useEffect(() => {
    setTrades(initialTrades);
  }, [initialTrades]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-white/5">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Live Trades</h3>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide text-xs">
        {/* Header */}
        <div className="grid grid-cols-4 gap-2 px-4 py-2 text-zinc-600 sticky top-0 bg-[#0a0a0a]">
          <span>Side</span>
          <span>Price</span>
          <span>Size</span>
          <span>Wallet</span>
        </div>
        {trades.length === 0 ? (
          <div className="px-4 py-8 text-center text-zinc-600">No trades yet</div>
        ) : (
          trades.map((trade, i) => (
            <div
              key={`${trade.txHash}-${i}`}
              className={cn(
                'grid grid-cols-4 gap-2 px-4 py-2 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors',
                i === 0 && 'bg-white/[0.01]'
              )}
            >
              <span className={cn('font-bold', trade.side === 'buy' ? 'text-lime-400' : 'text-red-400')}>
                {trade.side === 'buy' ? 'BUY' : 'SELL'}
              </span>
              <span className="font-mono">{formatUSD(trade.priceInUsd)}</span>
              <span className="text-zinc-400 font-mono">
                {trade.from?.amount
                  ? new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(trade.from.amount)
                  : '-'}
              </span>
              <span className="text-zinc-600">{shortenAddress(trade.owner || '0x0000')}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
