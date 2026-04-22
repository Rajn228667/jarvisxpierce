import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  surname: string;
  name: string;
  patronymic?: string | null;
  role: string | number;
  avatarUrl?: string | null;
  institutionId?: string | null;
  theme?: string | null;
  language?: string | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setTokens: (access: string, refresh: string, user?: AuthUser | null) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (access, refresh, user) => set((s) => ({ accessToken: access, refreshToken: refresh, user: user ?? s.user })),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null })
    }),
    { name: 'pxhm.auth' }
  )
);
