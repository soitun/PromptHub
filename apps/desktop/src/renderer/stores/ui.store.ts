import { create } from "zustand";
import { persist } from "zustand/middleware";

type ViewMode = "prompt" | "skill";

export type AppModule = ViewMode | "rules";

/**
 * Default and safe bounds for the resizable folder sidebar panel.
 * The max is generous so 4K users can take full advantage of their screen
 * real estate (#119).
 * 可拖拽的文件夹侧栏宽度的默认值与安全边界。
 * 上限较宽，便于 4K 用户充分利用屏幕 (#119)。
 */
export const SIDEBAR_PANEL_WIDTH_DEFAULT = 288; // matches the original Tailwind `w-72`
export const SIDEBAR_PANEL_WIDTH_MIN = 220;
export const SIDEBAR_PANEL_WIDTH_MAX = 640;

/**
 * Default and safe bounds for the resizable prompt-list pane (card view).
 * 可拖拽的 Prompt 列表栏宽度（卡片视图）的默认值与安全边界。
 */
export const PROMPT_LIST_PANE_WIDTH_DEFAULT = 320; // matches the original Tailwind `w-80`
export const PROMPT_LIST_PANE_WIDTH_MIN = 240;
export const PROMPT_LIST_PANE_WIDTH_MAX = 720;

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

interface UIState {
  viewMode: ViewMode;
  appModule: AppModule;
  setViewMode: (mode: ViewMode) => void;
  setAppModule: (mode: AppModule) => void;
  // Side bar collapsed state
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  // Resizable column widths (#119)
  // 可拖拽列宽 (#119)
  sidebarPanelWidth: number;
  promptListPaneWidth: number;
  setSidebarPanelWidth: (width: number) => void;
  setPromptListPaneWidth: (width: number) => void;
  resetColumnWidths: () => void;
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
      sidebarPanelWidth: SIDEBAR_PANEL_WIDTH_DEFAULT,
      promptListPaneWidth: PROMPT_LIST_PANE_WIDTH_DEFAULT,
      setSidebarPanelWidth: (width) =>
        set({
          sidebarPanelWidth: clamp(
            width,
            SIDEBAR_PANEL_WIDTH_MIN,
            SIDEBAR_PANEL_WIDTH_MAX,
          ),
        }),
      setPromptListPaneWidth: (width) =>
        set({
          promptListPaneWidth: clamp(
            width,
            PROMPT_LIST_PANE_WIDTH_MIN,
            PROMPT_LIST_PANE_WIDTH_MAX,
          ),
        }),
      resetColumnWidths: () =>
        set({
          sidebarPanelWidth: SIDEBAR_PANEL_WIDTH_DEFAULT,
          promptListPaneWidth: PROMPT_LIST_PANE_WIDTH_DEFAULT,
        }),
    }),
    {
      name: "ui-storage",
      // Persist sidebar collapse state AND the user's chosen column widths
      // so the layout survives across sessions (#119). viewMode still resets
      // to 'prompt' on launch by design.
      // 同时持久化用户拖拽后的列宽，让布局跨会话保留 (#119)。
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        sidebarPanelWidth: state.sidebarPanelWidth,
        promptListPaneWidth: state.promptListPaneWidth,
      }),
      // Safety net: if a persisted width is outside the current bounds (for
      // example after a version bump that narrowed the range), clamp it to
      // a sane value instead of leaving the column in a broken state.
      // 历史持久化的宽度越界时，收敛到合法范围，避免列宽卡在异常状态。
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<UIState>) };
        return {
          ...merged,
          sidebarPanelWidth: clamp(
            merged.sidebarPanelWidth ?? SIDEBAR_PANEL_WIDTH_DEFAULT,
            SIDEBAR_PANEL_WIDTH_MIN,
            SIDEBAR_PANEL_WIDTH_MAX,
          ),
          promptListPaneWidth: clamp(
            merged.promptListPaneWidth ?? PROMPT_LIST_PANE_WIDTH_DEFAULT,
            PROMPT_LIST_PANE_WIDTH_MIN,
            PROMPT_LIST_PANE_WIDTH_MAX,
          ),
        } as UIState;
      },
    },
  ),
);
