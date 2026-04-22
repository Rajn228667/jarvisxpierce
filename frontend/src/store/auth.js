import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useAuthStore = create()(persist((set) => ({
    accessToken: null,
    refreshToken: null,
    user: null,
    setTokens: (access, refresh, user) => set((s) => ({ accessToken: access, refreshToken: refresh, user: user ?? s.user })),
    setUser: (user) => set({ user }),
    logout: () => set({ accessToken: null, refreshToken: null, user: null })
}), { name: 'pxhm.auth' }));
