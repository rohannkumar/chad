'use client';

interface ChadCoinProps {
  size?: number;
}

export function ChadCoin({ size = 120 }: ChadCoinProps) {
  return (
    <div
      className="mx-auto relative"
      style={{ width: size, height: size, perspective: size * 5 }}
    >
      {/* Drop shadow glow beneath coin */}
      <div
        className="absolute rounded-full blur-2xl bg-lime-400/30"
        style={{
          width: size * 0.8,
          height: size * 0.25,
          bottom: -size * 0.08,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Spinning coin */}
      <div
        className="animate-coin-spin w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ── FRONT — lime bg + chad-light logo (multiply blend) ── */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Outer gold/lime ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-lime-300 via-yellow-300 to-lime-500 p-[3px]">
            <div className="w-full h-full rounded-full bg-lime-400 flex items-center justify-center overflow-hidden">
              {/* Chad face — light version, multiply blend makes white transparent */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/chad-light.png"
                alt="Chad"
                style={{
                  width: '82%',
                  height: '82%',
                  objectFit: 'contain',
                  mixBlendMode: 'multiply',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── BACK — dark bg + chad-dark logo ── */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-lime-300 via-yellow-300 to-lime-500 p-[3px]">
            <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/chad-dark.png"
                alt="Chad"
                style={{
                  width: '82%',
                  height: '82%',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
