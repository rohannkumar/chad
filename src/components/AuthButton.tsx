'use client';

import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

interface AuthButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function AuthButton({ className, size = 'md' }: AuthButtonProps) {
  const { ready, authenticated, login, logout, user } = useAuth();

  if (!ready) {
    return (
      <button disabled className={cn('bg-zinc-800 rounded-xl animate-pulse', sizeClasses[size], className)}>
        <span className="opacity-0">…</span>
      </button>
    );
  }

  if (authenticated && user) {
    const display =
      user.email?.address ||
      user.google?.name ||
      (user.apple?.subject ? user.apple.subject.slice(0, 8) : undefined) ||
      'Wallet';
    const label = (display ?? 'Wallet').length > 12 ? (display ?? 'Wallet').slice(0, 12) + '…' : (display ?? 'Wallet');
    return (
      <button
        onClick={logout}
        className={cn('bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-all', sizeClasses[size], className)}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className={cn(
        'bg-lime-400 hover:bg-lime-300 text-black font-bold rounded-xl transition-all active:scale-95',
        sizeClasses[size],
        className
      )}
    >
      Launch App
    </button>
  );
}
