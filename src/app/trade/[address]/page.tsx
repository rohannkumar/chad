import { getTrendingTokens, getTokenOverview } from '@/lib/birdeye';
import { TradePageClient } from '@/components/trade/TradePageClient';
import { Navbar } from '@/components/Navbar';

interface TradePageProps {
  params: Promise<{ address: string }>;
}

export default async function TradePage({ params }: TradePageProps) {
  const { address } = await params;
  const [overview, trending] = await Promise.all([
    getTokenOverview(address),
    getTrendingTokens(30),
  ]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <div className="pt-16">
        <TradePageClient
          address={address}
          initialOverview={overview}
          trendingTokens={trending}
        />
      </div>
    </div>
  );
}
