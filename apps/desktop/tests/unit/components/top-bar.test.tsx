import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TopBar } from "../../../src/renderer/components/layout/TopBar";
import { usePromptStore } from "../../../src/renderer/stores/prompt.store";
import { useSettingsStore } from "../../../src/renderer/stores/settings.store";
import { useFolderStore } from "../../../src/renderer/stores/folder.store";
import { useSkillStore } from "../../../src/renderer/stores/skill.store";
import { useUIStore } from "../../../src/renderer/stores/ui.store";
import { renderWithI18n } from "../../helpers/i18n";
import { installWindowMocks } from "../../helpers/window";

vi.mock("../../../src/renderer/components/prompt/CreatePromptModal", () => ({
  CreatePromptModal: () => null,
}));

vi.mock("../../../src/renderer/components/prompt/QuickAddModal", () => ({
  QuickAddModal: () => null,
}));

vi.mock("../../../src/renderer/components/skill/CreateSkillModal", () => ({
  CreateSkillModal: () => null,
}));

describe("TopBar", () => {
  beforeEach(() => {
    installWindowMocks();

    usePromptStore.setState({
      prompts: [],
      selectedId: null,
      selectedIds: [],
      isLoading: false,
      searchQuery: "",
      filterTags: [],
      promptTypeFilter: "all",
      sortBy: "updatedAt",
      sortOrder: "desc",
      viewMode: "card",
      galleryImageSize: "medium",
      kanbanColumns: 3,
    });

    useSettingsStore.setState({
      isDarkMode: false,
      aiModels: [],
      aiApiKey: "",
      creationMode: "manual",
    } as Partial<ReturnType<typeof useSettingsStore.getState>>);

    useFolderStore.setState({
      selectedFolderId: null,
      folders: [],
      unlockedFolderIds: [],
    } as Partial<ReturnType<typeof useFolderStore.getState>>);

    useSkillStore.setState({
      skills: [],
      searchQuery: "",
      filterType: "all",
      filterTags: [],
      deployedSkillNames: new Set<string>(),
      storeView: "store",
      selectedSkillId: null,
    } as Partial<ReturnType<typeof useSkillStore.getState>>);

    useUIStore.setState({
      viewMode: "prompt",
      isSidebarCollapsed: false,
    });
  });

  it("renders the create mode dropdown in a portal when the split button is opened", async () => {
    await act(async () => {
      await renderWithI18n(
        <TopBar onOpenSettings={vi.fn()} updateAvailable={null} />,
        { language: "zh" },
      );
    });

    const triggerButtons = screen.getAllByRole("button");
    const toggleButton = triggerButtons.find(
      (button) => button.getAttribute("aria-haspopup") === "menu",
    );

    expect(toggleButton).toBeDefined();

    fireEvent.click(toggleButton!);

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("手动填写 Prompt 详细信息")).toBeInTheDocument();
    expect(screen.getByText("粘贴内容由 AI 智能分析并分类")).toBeInTheDocument();
  });

  it("closes the create mode dropdown when clicking outside", async () => {
    await act(async () => {
      await renderWithI18n(
        <TopBar onOpenSettings={vi.fn()} updateAvailable={null} />,
        { language: "zh" },
      );
    });

    const triggerButtons = screen.getAllByRole("button");
    const toggleButton = triggerButtons.find(
      (button) => button.getAttribute("aria-haspopup") === "menu",
    );

    expect(toggleButton).toBeDefined();

    fireEvent.click(toggleButton!);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("switches creation mode from the portal menu", async () => {
    useSettingsStore.setState({
      creationMode: "manual",
    } as Partial<ReturnType<typeof useSettingsStore.getState>>);

    await act(async () => {
      await renderWithI18n(
        <TopBar onOpenSettings={vi.fn()} updateAvailable={null} />,
        { language: "en" },
      );
    });

    const triggerButtons = screen.getAllByRole("button");
    const toggleButton = triggerButtons.find(
      (button) => button.getAttribute("aria-haspopup") === "menu",
    );

    expect(toggleButton).toBeDefined();

    fireEvent.click(toggleButton!);
    fireEvent.click(screen.getByText("Quick Add"));

    await waitFor(() => {
      expect(useSettingsStore.getState().creationMode).toBe("quick");
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });
});
