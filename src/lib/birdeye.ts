const BIRDEYE_BASE = 'https://public-api.birdeye.so';
const API_KEY = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '';

const headers: Record<string, string> = {
  'X-API-KEY': API_KEY,
  'x-chain': 'solana',
};

export interface TokenOverview {
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  price: number;
  priceChange24hPercent: number;
  v24hUSD: number;
  mc: number;
  liquidity: number;
}

export interface TrendingToken {
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  price: number;
  priceChange24hPercent: number;
  v24hUSD: number;
  rank: number;
}

export interface OHLCVData {
  unixTime: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface Trade {
  txHash: string;
  blockUnixTime: number;
  side: 'buy' | 'sell';
  priceInUsd: number;
  from: { symbol: string; amount: number };
  to: { symbol: string; amount: number };
  owner: string;
}

export interface Holder {
  owner: string;
  amount: number;
  percentage: number;
  uiAmount: number;
}

const hasKey = () => !!API_KEY;

/* ─── Trending tokens (/defi/tokenlist) ──────────────────── */
export async function getTrendingTokens(limit = 20): Promise<TrendingToken[]> {
  if (!hasKey()) return FALLBACK_TOKENS.slice(0, limit);
  try {
    const res = await fetch(
      `${BIRDEYE_BASE}/defi/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=${limit}&min_liquidity=10000`,
      { headers, next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    const tokens = data?.data?.tokens || [];
    if (!tokens.length) return FALLBACK_TOKENS.slice(0, limit);
    return tokens.map((t: any, i: number) => ({
      address: t.address,
      symbol: t.symbol,
      name: t.name,
      logoURI: t.logoURI || '',
      price: t.price || 0,
      priceChange24hPercent: t.v24hChangePercent || 0,
      v24hUSD: t.v24hUSD || 0,
      rank: i + 1,
    }));
  } catch {
    return FALLBACK_TOKENS.slice(0, limit);
  }
}

/* ─── Token overview (/defi/tokenlist single + /defi/price) ─ */
export async function getTokenOverview(address: string): Promise<TokenOverview | null> {
  if (!hasKey()) {
    const fb = FALLBACK_TOKENS.find(t => t.address === address) || FALLBACK_TOKENS[0];
    return { ...fb, mc: fb.v24hUSD * 4, liquidity: fb.v24hUSD * 0.1 };
  }
  try {
    // price endpoint gives us live price + 24h change
    const [priceRes, listRes] = await Promise.all([
      fetch(`${BIRDEYE_BASE}/defi/price?address=${address}`, { headers, next: { revalidate: 15 } }),
      fetch(`${BIRDEYE_BASE}/defi/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=50&min_liquidity=0`, { headers, next: { revalidate: 60 } }),
    ]);

    const priceData = priceRes.ok ? (await priceRes.json())?.data : null;
    const listData  = listRes.ok  ? (await listRes.json())?.data?.tokens || [] : [];
    const meta = listData.find((t: any) => t.address === address) || {};

    if (!priceData && !meta.symbol) return null;

    return {
      address,
      symbol:               meta.symbol       || address.slice(0, 6),
      name:                 meta.name         || meta.symbol || address.slice(0, 8),
      logoURI:              meta.logoURI       || '',
      price:                priceData?.value   || meta.price || 0,
      priceChange24hPercent: priceData?.priceChange24h || meta.v24hChangePercent || 0,
      v24hUSD:              meta.v24hUSD       || 0,
      mc:                   meta.mc            || (meta.price || 0) * 1e9,
      liquidity:            meta.liquidity     || 0,
    };
  } catch {
    return null;
  }
}

/* ─── OHLCV — falls back to generated data on free plan ───── */
export async function getOHLCV(address: string, resolution = '15m', from?: number, to?: number): Promise<OHLCVData[]> {
  if (!hasKey()) return generateFallbackOHLCV(resolution);
  const now   = Math.floor(Date.now() / 1000);
  const start = from || now - 86400;
  const end   = to   || now;
  try {
    const res = await fetch(
      `${BIRDEYE_BASE}/defi/ohlcv?address=${address}&type=${resolution}&time_from=${start}&time_to=${end}`,
      { headers }
    );
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    const items: OHLCVData[] = data?.data?.items || [];
    return items.length > 0 ? items : generateFallbackOHLCV(resolution);
  } catch {
    return generateFallbackOHLCV(resolution);
  }
}

/* ─── Live trades (/defi/txs/token) ──────────────────────── */
export async function getLiveTrades(address: string, limit = 30): Promise<Trade[]> {
  if (!hasKey()) return generateFallbackTrades(limit);
  try {
    const res = await fetch(
      `${BIRDEYE_BASE}/defi/txs/token?address=${address}&tx_type=swap&limit=${limit}`,
      { headers }
    );
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    const items: any[] = data?.data?.items || [];
    if (!items.length) return generateFallbackTrades(limit);

    return items.map((tx: any) => {
      // base = the token being traded, quote = the pairing token (usually SOL/USDC)
      const base  = tx.base  || {};
      const quote = tx.quote || {};
      // If base changeAmount < 0 → tokens went out → sell; > 0 → tokens came in → buy
      const side: 'buy' | 'sell' = (base.uiChangeAmount ?? base.changeAmount ?? 0) > 0 ? 'buy' : 'sell';
      return {
        txHash:        tx.txHash || tx.signature || '',
        blockUnixTime: tx.blockUnixTime || 0,
        side,
        priceInUsd:    base.price || base.nearestPrice || 0,
        from: { symbol: side === 'buy' ? (quote.symbol || 'SOL') : (base.symbol || 'TOKEN'), amount: Math.abs(side === 'buy' ? (quote.uiAmount || 0) : (base.uiAmount || 0)) },
        to:   { symbol: side === 'buy' ? (base.symbol || 'TOKEN') : (quote.symbol || 'SOL'),  amount: Math.abs(side === 'buy' ? (base.uiAmount || 0) : (quote.uiAmount || 0)) },
        owner: tx.owner || tx.source || '',
      };
    });
  } catch {
    return generateFallbackTrades(limit);
  }
}

/* ─── Holders (/defi/v3/token/holder) ────────────────────── */
export async function getTokenHolders(address: string, limit = 20): Promise<Holder[]> {
  if (!hasKey()) return generateFallbackHolders(limit);
  try {
    const res = await fetch(
      `${BIRDEYE_BASE}/defi/v3/token/holder?address=${address}&offset=0&limit=${limit}`,
      { headers }
    );
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    const items: Holder[] = data?.data?.items || [];
    return items.length > 0 ? items : generateFallbackHolders(limit);
  } catch {
    return generateFallbackHolders(limit);
  }
}

/* ─── Formatters ─────────────────────────────────────────── */
export function formatUSD(n: number): string {
  if (!n) return '$0.00';
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3)  return `$${(n / 1e3).toFixed(2)}K`;
  if (n < 0.001) return `$${n.toFixed(8)}`;
  if (n < 0.1)   return `$${n.toFixed(6)}`;
  return `$${n.toFixed(4)}`;
}

export function formatPct(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

export function shortenAddress(addr: string): string {
  if (!addr || addr.length < 8) return addr || '—';
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

/* ─── Fallback / demo data (used when no key or API returns empty) ── */
export const FALLBACK_TOKENS: TrendingToken[] = [
  { address: 'So11111111111111111111111111111111111111112',    symbol: 'SOL',  name: 'Solana',            logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png', price: 185.42,     priceChange24hPercent: 3.21,  v24hUSD: 2_400_000_000, rank: 1 },
  { address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', name: 'USD Coin',           logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png', price: 1.00,       priceChange24hPercent: 0.01,  v24hUSD: 1_200_000_000, rank: 2 },
  { address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK', name: 'Bonk',               logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q89FnBRBU-V8',                                                                   price: 0.0000231,  priceChange24hPercent: 12.5,  v24hUSD: 380_000_000,   rank: 3 },
  { address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',  symbol: 'JUP',  name: 'Jupiter',            logoURI: 'https://static.jup.ag/jup/icon.png',                                                                                               price: 0.82,       priceChange24hPercent: 7.8,   v24hUSD: 145_000_000,   rank: 4 },
  { address: 'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5',  symbol: 'MEW',  name: 'cat in a dogs world',logoURI: 'https://bafkreibk3covs5ltyqxa272uodhkulbt6bhsklcldymsgg5zdpora6znhq.ipfs.nftstorage.link',                                          price: 0.0078,     priceChange24hPercent: 18.9,  v24hUSD: 67_000_000,    rank: 5 },
  { address: 'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk',  symbol: 'WEN',  name: 'Wen',                logoURI: 'https://shdw-drive.genesysgo.net/GwJapVHVvfM4Mw4sySoHzt3s6UsHMKgACuFqPBH5dGmB/wen.png',                                          price: 0.000124,   priceChange24hPercent: -5.3,  v24hUSD: 95_000_000,    rank: 6 },
  { address: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', symbol: 'PYTH', name: 'Pyth Network',       logoURI: 'https://pyth.network/token.svg',                                                                                                   price: 0.34,       priceChange24hPercent: -2.1,  v24hUSD: 88_000_000,    rank: 7 },
  { address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', symbol: 'mSOL', name: 'Marinade SOL',       logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',price: 210.5,      priceChange24hPercent: 4.1,   v24hUSD: 52_000_000,    rank: 8 },
];

function generateFallbackOHLCV(resolution: string): OHLCVData[] {
  const steps: Record<string, number> = { '1m': 60, '5m': 300, '15m': 900, '1H': 3600, '4H': 14400, '1D': 86400 };
  const step  = steps[resolution] || 900;
  const count = resolution === '1D' ? 90 : 200;
  const now   = Math.floor(Date.now() / 1000);
  const candles: OHLCVData[] = [];
  let price = 185;
  for (let i = count; i >= 0; i--) {
    const t      = now - i * step;
    const change = (Math.random() - 0.48) * price * 0.018;
    const open   = price;
    price        = Math.max(price + change, price * 0.5);
    const close  = price;
    const high   = Math.max(open, close) * (1 + Math.random() * 0.008);
    const low    = Math.min(open, close) * (1 - Math.random() * 0.008);
    candles.push({ unixTime: t, o: open, h: high, l: low, c: close, v: Math.random() * 1e6 });
  }
  return candles;
}

const DEMO_WALLETS = [
  'GsbwXfJraMomNxBcjK59zFQXF7MBmHQwCev32Hn3sqMJ',
  '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
  'CuieVDEDtLo7FypAQHf5YHvnCPWFhFJPGcMdXUYzM7n2',
  'Hk7AoZcBZpXFSMCeRTjCjt7oFiTWUhPkbmpFM48Zpump',
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe8cSC',
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
];

function generateFallbackTrades(limit: number): Trade[] {
  const now = Math.floor(Date.now() / 1000);
  return Array.from({ length: limit }, (_, i) => {
    const side: 'buy' | 'sell' = Math.random() > 0.45 ? 'buy' : 'sell';
    const price    = 185 + (Math.random() - 0.5) * 4;
    const solAmt   = +(Math.random() * 50 + 0.1).toFixed(3);
    const tokenAmt = +(solAmt / price * 1e6).toFixed(0);
    return {
      txHash:        `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
      blockUnixTime: now - i * Math.floor(Math.random() * 30 + 5),
      side,
      priceInUsd:    price,
      from: { symbol: side === 'buy' ? 'SOL' : 'TOKEN', amount: side === 'buy' ? solAmt : tokenAmt },
      to:   { symbol: side === 'buy' ? 'TOKEN' : 'SOL',  amount: side === 'buy' ? tokenAmt : solAmt },
      owner: DEMO_WALLETS[Math.floor(Math.random() * DEMO_WALLETS.length)],
    };
  });
}

function generateFallbackHolders(limit: number): Holder[] {
  const pcts = [18.4, 9.2, 6.7, 5.1, 4.3, 3.8, 3.2, 2.9, 2.4, 2.1, 1.9, 1.7, 1.5, 1.3, 1.2, 1.1, 0.9, 0.8, 0.7, 0.6];
  return Array.from({ length: Math.min(limit, pcts.length) }, (_, i) => ({
    owner:      DEMO_WALLETS[i % DEMO_WALLETS.length],
    amount:     Math.floor(pcts[i] * 1e8),
    percentage: pcts[i],
    uiAmount:   pcts[i] * 1e6,
  }));
}
