'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TokenOverview, TrendingToken, OHLCVData, Trade, Holder,
  getTokenOverview, getOHLCV, getLiveTrades, getTokenHolders
} from '@/lib/birdeye';
import { TrendingList } from './TrendingList';
import { TokenHeader } from './TokenHeader';
import { PriceChart } from './PriceChart';
import { LiveTrades } from './LiveTrades';
import { HoldersList } from './HoldersList';
import { BuySellPanel } from './BuySellPanel';
import { PositionPanel } from './PositionPanel';
import { cn } from '@/lib/utils';

interface TradePageClientProps {
  address: string;
  initialOverview: TokenOverview | null;
  trendingTokens: TrendingToken[];
}

type CenterTab = 'chart' | 'trades' | 'holders';

export function TradePageClient({ address, initialOverview, trendingTokens }: TradePageClientProps) {
  const [resolution, setResolution] = useState('15m');
  const [centerTab, setCenterTab] = useState<CenterTab>('chart');
  const [showLeftPanel, setShowLeftPanel] = useState(false);

  const { data: overview } = useQuery<TokenOverview | null>({
    queryKey: ['token-overview', address],
    queryFn: () => getTokenOverview(address),
    initialData: initialOverview,
    refetchInterval: 15_000,
  });

  const { data: ohlcv = [], isLoading: chartLoading } = useQuery<OHLCVData[]>({
    queryKey: ['ohlcv', address, resolution],
    queryFn: () => getOHLCV(address, resolution),
    refetchInterval: 30_000,
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ['trades', address],
    queryFn: () => getLiveTrades(address, 50),
    refetchInterval: 5_000,
  });

  const { data: holders = [] } = useQuery<Holder[]>({
    queryKey: ['holders', address],
    queryFn: () => getTokenHolders(address, 20),
    refetchInterval: 60_000,
  });

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* LEFT: Trending List */}
      <aside className={cn(
        'w-56 shrink-0 border-r border-white/5 overflow-hidden flex-col',
        'hidden lg:flex'
      )}>
        <TrendingList tokens={trendingTokens} activeAddress={address} />
      </aside>

      {/* MIDDLE: Chart + Tabs */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-white/5">
        {/* Token Header */}
        <TokenHeader overview={overview || null} address={address} />

        {/* Center Tabs */}
        <div className="flex gap-1 px-4 py-2 border-b border-white/5">
          {(['chart', 'trades', 'holders'] as CenterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setCenterTab(tab)}
              className={cn(
                'px-4 py-1.5 text-sm rounded-lg font-semibold capitalize transition-all',
                centerTab === tab
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-white'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content — always mounted so chart doesn't get destroyed on tab switch */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
          <div className={centerTab === 'chart'   ? 'absolute inset-0' : 'hidden'}>
            <PriceChart data={ohlcv} loading={chartLoading} onResolutionChange={setResolution} />
          </div>
          <div className={centerTab === 'trades'  ? 'absolute inset-0 overflow-y-auto scrollbar-hide' : 'hidden'}>
            <LiveTrades trades={trades} symbol={overview?.symbol} />
          </div>
          <div className={centerTab === 'holders' ? 'absolute inset-0 overflow-y-auto scrollbar-hide' : 'hidden'}>
            <HoldersList holders={holders} />
          </div>
        </div>
      </main>

      {/* RIGHT: Buy/Sell + Position */}
      <aside className="w-72 shrink-0 flex flex-col overflow-y-auto scrollbar-hide hidden md:flex">
        <BuySellPanel address={address} overview={overview || null} />
        <div className="border-t border-white/5">
          <PositionPanel overview={overview || null} />
        </div>
      </aside>
    </div>
  );
}
