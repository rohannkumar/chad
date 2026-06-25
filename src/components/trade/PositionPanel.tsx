'use client';

import { useAuth } from '@/lib/auth-context';
import { TokenOverview, formatUSD } from '@/lib/birdeye';
import { AuthButton } from '@/components/AuthButton';

interface PositionPanelProps {
  overview: TokenOverview | null;
}

export function PositionPanel({ overview }: PositionPanelProps) {
  const { authenticated, user } = useAuth();

  if (!authenticated) {
    return (
      <div className="p-4 text-center">
        <div className="text-zinc-500 text-sm mb-4">Connect wallet to see your position</div>
        <AuthButton size="sm" className="w-full justify-center" />
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Your Position</h3>

      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Holdings</span>
          <span className="font-bold">0.00 {overview?.symbol || '—'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Value</span>
          <span className="font-bold">$0.00</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Avg. Buy Price</span>
          <span className="font-bold">—</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">PnL</span>
          <span className="font-bold text-zinc-600">—</span>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <h4 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">SOL Balance</h4>
        <div className="font-mono font-bold text-lg">— SOL</div>
        <div className="text-xs text-zinc-600 mt-1">≈ $—</div>
      </div>
    </div>
  );
}
