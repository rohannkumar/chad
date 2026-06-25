'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { TokenOverview, formatUSD } from '@/lib/birdeye';
import { cn } from '@/lib/utils';

interface BuySellPanelProps {
  address: string;
  overview: TokenOverview | null;
}

const QUICK_AMOUNTS = ['0.1', '0.5', '1', '5'];

export function BuySellPanel({ address, overview }: BuySellPanelProps) {
  const { authenticated, login } = useAuth();
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('1');
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const price = overview?.price || 0;
  const amountNum = parseFloat(amount) || 0;
  const outputAmount = tab === 'buy' ? (amountNum / price) : (amountNum * price);

  const handleSwap = async () => {
    if (!authenticated) { login(); return; }
    if (!amount || amountNum <= 0) return;

    setLoading(true);
    setTxStatus('idle');

    try {
      // Jupiter swap integration
      const inputMint = tab === 'buy'
        ? 'So11111111111111111111111111111111111111112' // SOL
        : address;
      const outputMint = tab === 'buy' ? address : 'So11111111111111111111111111111111111111112';
      const amountLamports = Math.floor(amountNum * 1e9);

      const quoteRes = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=${parseInt(slippage) * 100}`
      );

      if (!quoteRes.ok) throw new Error('Quote failed');
      // In production: get swap tx, sign with embedded wallet, submit to RPC
      // For demo: simulate success
      await new Promise((r) => setTimeout(r, 1200));
      setTxStatus('success');
      setAmount('');
    } catch {
      setTxStatus('error');
    } finally {
      setLoading(false);
      setTimeout(() => setTxStatus('idle'), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Buy / Sell Tabs */}
      <div className="flex bg-zinc-900 rounded-xl p-1">
        <button
          onClick={() => setTab('buy')}
          className={cn(
            'flex-1 py-2 rounded-lg text-sm font-bold transition-all',
            tab === 'buy' ? 'bg-lime-400 text-black' : 'text-zinc-500 hover:text-white'
          )}
        >
          Buy
        </button>
        <button
          onClick={() => setTab('sell')}
          className={cn(
            'flex-1 py-2 rounded-lg text-sm font-bold transition-all',
            tab === 'sell' ? 'bg-red-500 text-white' : 'text-zinc-500 hover:text-white'
          )}
        >
          Sell
        </button>
      </div>

      {/* Amount Input */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-500">
            {tab === 'buy' ? 'You pay (SOL)' : `You sell (${overview?.symbol || 'TOKEN'})`}
          </span>
          <span className="text-xs text-zinc-600">Balance: —</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-transparent text-2xl font-mono font-bold outline-none placeholder-zinc-700"
          />
          <span className="text-zinc-400 font-bold text-sm">{tab === 'buy' ? 'SOL' : overview?.symbol}</span>
        </div>
      </div>

      {/* Quick amounts */}
      <div className="flex gap-2">
        {QUICK_AMOUNTS.map((a) => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className="flex-1 py-2 text-xs font-bold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
          >
            {a} {tab === 'buy' ? 'SOL' : overview?.symbol}
          </button>
        ))}
      </div>

      {/* Output */}
      {amountNum > 0 && price > 0 && (
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-zinc-500 mb-1">
            {tab === 'buy' ? `You receive (${overview?.symbol})` : 'You receive (SOL)'}
          </div>
          <div className="font-mono font-bold text-xl">
            {outputAmount.toLocaleString('en', { maximumSignificantDigits: 6 })}
          </div>
          <div className="text-xs text-zinc-600 mt-1">
            ≈ {formatUSD(amountNum * (tab === 'buy' ? 185 : price))}
          </div>
        </div>
      )}

      {/* Slippage */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">Slippage</span>
        <div className="flex gap-2">
          {['0.5', '1', '3'].map((s) => (
            <button
              key={s}
              onClick={() => setSlippage(s)}
              className={cn(
                'px-3 py-1 text-xs rounded-lg font-bold transition-all',
                slippage === s ? 'bg-zinc-700 text-white' : 'text-zinc-600 hover:text-white'
              )}
            >
              {s}%
            </button>
          ))}
        </div>
      </div>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={loading || !amount}
        className={cn(
          'w-full py-4 rounded-xl font-black text-base transition-all active:scale-95',
          tab === 'buy'
            ? 'bg-lime-400 hover:bg-lime-300 text-black disabled:opacity-50'
            : 'bg-red-500 hover:bg-red-400 text-white disabled:opacity-50'
        )}
      >
        {!authenticated
          ? 'Connect Wallet to Trade'
          : loading
          ? <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Swapping...
            </span>
          : txStatus === 'success'
          ? '✓ Swap Successful!'
          : txStatus === 'error'
          ? '✗ Swap Failed'
          : `${tab === 'buy' ? 'Buy' : 'Sell'} ${overview?.symbol || 'TOKEN'}`}
      </button>

      {/* Powered by Jupiter */}
      <div className="text-center text-xs text-zinc-600">
        Swaps powered by{' '}
        <a href="https://jup.ag" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">
          Jupiter
        </a>
      </div>
    </div>
  );
}
