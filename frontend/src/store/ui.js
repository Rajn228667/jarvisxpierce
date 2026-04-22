import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useUIStore = create()(persist((set) => ({
    theme: 'dark',
    sidebarCollapsed: false,
    presentationMode: true,
    setTheme: (theme) => set({ theme }),
    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    setPresentation: (v) => set({ presentationMode: v })
}), { name: 'pxhm.ui' }));
