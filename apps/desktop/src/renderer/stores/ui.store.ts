import { create } from "zustand";
import { persist } from "zustand/middleware";

type ViewMode = "prompt" | "skill";

export type AppModule = ViewMode | "rules";

interface UIState {
  viewMode: ViewMode;
  appModule: AppModule;
  setViewMode: (mode: ViewMode) => void;
  setAppModule: (mode: AppModule) => void;
  // Side bar collapsed state
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      viewMode: "prompt",
      appModule: "prompt",
      setViewMode: (mode) => set({ viewMode: mode, appModule: mode }),
      setAppModule: (mode) =>
        set({
          appModule: mode,
          viewMode: mode === "rules" ? "prompt" : mode,
        }),
      isSidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) =>
        set({ isSidebarCollapsed: collapsed }),
    }),
    {
      name: "ui-storage",
      // Only persist sidebar state; viewMode always resets to 'prompt' on launch
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    },
  ),
);
