'use client';

import { createContext, useContext, ReactNode } from 'react';

interface AuthUser {
  email?: { address: string } | null;
  google?: { name?: string | null } | null;
  apple?: { subject?: string | null } | null;
}

interface AuthState {
  ready: boolean;
  authenticated: boolean;
  login: () => void;
  logout: () => void;
  user: AuthUser | null;
}

const defaultState: AuthState = {
  ready: true,
  authenticated: false,
  login: () => alert('Set NEXT_PUBLIC_PRIVY_APP_ID to enable auth'),
  logout: () => {},
  user: null,
};

export const AuthContext = createContext<AuthState>(defaultState);

export function useAuth() {
  return useContext(AuthContext);
}

export function NoAuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={defaultState}>
      {children}
    </AuthContext.Provider>
  );
}
