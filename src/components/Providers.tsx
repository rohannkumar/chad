'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { NoAuthProvider } from '@/lib/auth-context';
import { PrivyAuthBridge } from './PrivyAuthBridge';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }));

  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  return (
    <QueryClientProvider client={queryClient}>
      {privyAppId ? (
        <PrivyProvider
          appId={privyAppId}
          config={{
            appearance: {
              theme: 'dark',
              accentColor: '#a3e635',
            },
            loginMethods: ['google', 'apple', 'wallet'],
            embeddedWallets: {
              solana: { createOnLogin: 'users-without-wallets' },
            },
          }}
        >
          <PrivyAuthBridge>{children}</PrivyAuthBridge>
        </PrivyProvider>
      ) : (
        <NoAuthProvider>{children}</NoAuthProvider>
      )}
    </QueryClientProvider>
  );
}
