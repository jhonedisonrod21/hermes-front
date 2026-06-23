import { createContext } from 'react';
import type { HermesSession } from './sessionStore';

export type AuthContextValue = {
  session: HermesSession | null;
  loading: boolean;
  authenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (session: HermesSession | null) => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
