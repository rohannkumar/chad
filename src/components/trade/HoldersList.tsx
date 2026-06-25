'use client';

import { Holder, shortenAddress } from '@/lib/birdeye';

interface HoldersListProps {
  holders: Holder[];
  totalSupply?: number;
}

export function HoldersList({ holders }: HoldersListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-white/5">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Top Holders</h3>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide text-xs">
        <div className="grid grid-cols-3 gap-2 px-4 py-2 text-zinc-600 sticky top-0 bg-[#0a0a0a]">
          <span>#</span>
          <span>Wallet</span>
          <span className="text-right">% Supply</span>
        </div>
        {holders.length === 0 ? (
          <div className="px-4 py-8 text-center text-zinc-600">No holders data</div>
        ) : (
          holders.map((holder, i) => (
            <div key={holder.owner} className="grid grid-cols-3 gap-2 px-4 py-2 border-b border-white/[0.03] hover:bg-white/[0.02]">
              <span className="text-zinc-600">{i + 1}</span>
              <span className="text-zinc-300 font-mono">{shortenAddress(holder.owner)}</span>
              <div className="text-right">
                <span className="text-lime-400 font-bold">{(holder.percentage || 0).toFixed(2)}%</span>
                <div className="w-full bg-zinc-800 rounded-full h-1 mt-1">
                  <div
                    className="bg-lime-400 rounded-full h-1"
                    style={{ width: `${Math.min(holder.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
