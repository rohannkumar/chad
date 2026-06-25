'use client';

import { useEffect, useRef, useState } from 'react';
import { OHLCVData } from '@/lib/birdeye';
import { cn } from '@/lib/utils';

interface PriceChartProps {
  data: OHLCVData[];
  loading?: boolean;
  onResolutionChange?: (res: string) => void;
}

const RESOLUTIONS = [
  { label: '1m',  value: '1m' },
  { label: '5m',  value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1H',  value: '1H' },
  { label: '4H',  value: '4H' },
  { label: '1D',  value: '1D' },
];

function toCandles(data: OHLCVData[]) {
  return [...data]
    .sort((a, b) => a.unixTime - b.unixTime)
    .map((d) => ({ time: d.unixTime as any, open: d.o, high: d.h, low: d.l, close: d.c }));
}

export function PriceChart({ data, loading, onResolutionChange }: PriceChartProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const chartRef      = useRef<any>(null);
  const seriesRef     = useRef<any>(null);
  // Always tracks the latest data so the init callback can read it after the async import
  const latestDataRef = useRef<OHLCVData[]>([]);
  latestDataRef.current = data;

  const [activeRes, setActiveRes] = useState('15m');

  // ── Init chart ONCE ───────────────────────────────────────
  useEffect(() => {
    let ro: ResizeObserver | null = null;
    let destroyed = false;

    import('lightweight-charts').then((lc) => {
      if (destroyed) return;
      const { createChart, ColorType, CandlestickSeries } = lc;
      const el = containerRef.current;
      if (!el) return;

      const chart = createChart(el, {
        layout: {
          background: { type: ColorType.Solid, color: '#050505' },
          textColor: '#71717a',
        },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.04)' },
          horzLines: { color: 'rgba(255,255,255,0.04)' },
        },
        crosshair: {
          vertLine: { color: '#a3e635', labelBackgroundColor: '#a3e635' },
          horzLine: { color: '#a3e635', labelBackgroundColor: '#a3e635' },
        },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)' },
        timeScale: {
          borderColor: 'rgba(255,255,255,0.06)',
          timeVisible: true,
          secondsVisible: false,
        },
        width:  el.clientWidth  || 600,
        height: el.clientHeight || 400,
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor:         '#a3e635',
        downColor:       '#f87171',
        borderUpColor:   '#a3e635',
        borderDownColor: '#f87171',
        wickUpColor:     '#a3e635',
        wickDownColor:   '#f87171',
      });

      chartRef.current  = chart;
      seriesRef.current = series;

      // ← KEY FIX: read whatever data arrived while we were loading the lib
      const current = latestDataRef.current;
      if (current.length > 0) {
        series.setData(toCandles(current));
        chart.timeScale().fitContent();
      }

      ro = new ResizeObserver(() => {
        const c = containerRef.current;
        if (c && chartRef.current) {
          chartRef.current.resize(c.clientWidth, c.clientHeight || 400);
        }
      });
      ro.observe(el);
    });

    return () => {
      destroyed = true;
      ro?.disconnect();
      if (chartRef.current) {
        try { chartRef.current.remove(); } catch {}
        chartRef.current  = null;
        seriesRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update data whenever it changes (handles resolution changes / live updates) ──
  useEffect(() => {
    if (!seriesRef.current || !data.length) return;
    try {
      seriesRef.current.setData(toCandles(data));
      chartRef.current?.timeScale().fitContent();
    } catch { /* ignore stale updates on unmount */ }
  }, [data]);

  const handleResChange = (res: string) => {
    setActiveRes(res);
    onResolutionChange?.(res);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Resolution bar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 shrink-0">
        {RESOLUTIONS.map((r) => (
          <button
            key={r.value}
            onClick={() => handleResChange(r.value)}
            className={cn(
              'px-3 py-1 text-xs rounded-lg font-bold transition-all',
              activeRes === r.value
                ? 'bg-lime-400 text-black'
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Canvas — absolute-fills parent so it always has a real pixel size */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {loading && !seriesRef.current && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#050505]">
            <div className="w-7 h-7 rounded-full border-2 border-lime-400 border-t-transparent animate-spin" />
          </div>
        )}
        <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      </div>
    </div>
  );
}
