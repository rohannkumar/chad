'use client';

import { usePrivy } from '@privy-io/react-auth';
import { AuthContext } from '@/lib/auth-context';
import { ReactNode } from 'react';

// This component must only be rendered inside a <PrivyProvider>
export function PrivyAuthBridge({ children }: { children: ReactNode }) {
  const { ready, authenticated, login, logout, user } = usePrivy();
  return (
    <AuthContext.Provider value={{ ready, authenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}
