import { getTrendingTokens } from '@/lib/birdeye';
import { LandingClient } from '@/components/LandingClient';

export default async function Home() {
  const tokens = await getTrendingTokens(20);
  return <LandingClient tokens={tokens} />;
}
