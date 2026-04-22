import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  presentationMode: boolean;
  setTheme: (t: 'dark' | 'light') => void;
  toggleSidebar: () => void;
  setPresentation: (v: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarCollapsed: false,
      presentationMode: true,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setPresentation: (v) => set({ presentationMode: v })
    }),
    { name: 'pxhm.ui' }
  )
);
