import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import en from "../../../src/renderer/i18n/locales/en.json";
import zh from "../../../src/renderer/i18n/locales/zh.json";
import zhTw from "../../../src/renderer/i18n/locales/zh-TW.json";
import ja from "../../../src/renderer/i18n/locales/ja.json";
import fr from "../../../src/renderer/i18n/locales/fr.json";
import de from "../../../src/renderer/i18n/locales/de.json";
import es from "../../../src/renderer/i18n/locales/es.json";
import type { Skill } from "@prompthub/shared/types";
import { SkillFullDetailPage } from "../../../src/renderer/components/skill/SkillFullDetailPage";
import { SkillManager } from "../../../src/renderer/components/skill/SkillManager";
import { SkillPlatformPanel } from "../../../src/renderer/components/skill/SkillPlatformPanel";

type TranslationTree = Record<string, unknown>;

function getPathValue(source: TranslationTree, path: string): unknown {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }
    return (current as TranslationTree)[segment];
  }, source);
}

function interpolate(template: string, values: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(values[key] ?? ""));
}

function flattenKeys(source: TranslationTree, prefix = ""): string[] {
  return Object.entries(source).flatMap(([key, value]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return flattenKeys(value as TranslationTree, nextPrefix);
    }
    return [nextPrefix];
  });
}

function translate(
  key: string,
  defaultValueOrOptions?: string | Record<string, unknown>,
  maybeOptions?: Record<string, unknown>,
): string {
  const options =
    typeof defaultValueOrOptions === "object" && defaultValueOrOptions !== null
      ? defaultValueOrOptions
      : maybeOptions || {};
  const defaultValue =
    typeof defaultValueOrOptions === "string"
      ? defaultValueOrOptions
      : typeof options.defaultValue === "string"
        ? options.defaultValue
        : key;
  const value = getPathValue(en as TranslationTree, key);
  const template = typeof value === "string" ? value : defaultValue;
  return interpolate(template, options);
}

const useSkillStoreMock = vi.fn();
const useSettingsStoreMock = vi.fn();
const useToastMock = vi.fn();
const useSkillPlatformMock = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: translate,
    i18n: { language: "en" },
  }),
}));

vi.mock("../../../src/renderer/stores/skill.store", () => ({
  useSkillStore: (selector: (state: Record<string, unknown>) => unknown) =>
    useSkillStoreMock(selector),
}));

vi.mock("../../../src/renderer/stores/settings.store", () => ({
  useSettingsStore: (selector: (state: Record<string, unknown>) => unknown) =>
    useSettingsStoreMock(selector),
}));

vi.mock("../../../src/renderer/components/ui/Toast", () => ({
  useToast: () => useToastMock(),
}));

vi.mock("../../../src/renderer/components/skill/use-skill-platform", () => ({
  useSkillPlatform: (...args: unknown[]) => useSkillPlatformMock(...args),
}));

const baseSkill: Skill = {
  id: "skill-write",
  name: "write",
  description: "Write better",
  instructions: "# Write\n\nHelp the user write better.",
  content: "# Write\n\nHelp the user write better.",
  protocol_type: "skill",
  author: "Local",
  local_repo_path: "/Users/demo/skills/write",
  tags: ["general"],
  is_favorite: false,
  currentVersion: 0,
  created_at: Date.now(),
  updated_at: Date.now(),
};

function createSkillStoreState(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    skills: [baseSkill],
    loadSkills: vi.fn().mockResolvedValue(undefined),
    loadRegistry: vi.fn().mockResolvedValue(undefined),
    deleteSkill: vi.fn().mockResolvedValue(undefined),
    toggleFavorite: vi.fn().mockResolvedValue(undefined),
    updateSkill: vi.fn().mockResolvedValue(undefined),
    syncSkillFromRepo: vi.fn().mockResolvedValue(null),
    isLoading: false,
    selectedSkillId: null,
    selectSkill: vi.fn(),
    filterType: "all",
    searchQuery: "",
    viewMode: "gallery",
    setViewMode: vi.fn(),
    storeView: "my-skills",
    setStoreView: vi.fn(),
    storeCategory: "all",
    setFilterType: vi.fn(),
    setStoreCategory: vi.fn(),
    storeSearchQuery: "",
    setStoreSearchQuery: vi.fn(),
    deployedSkillNames: new Set<string>(),
    loadDeployedStatus: vi.fn().mockResolvedValue(undefined),
    filterTags: [],
    installRegistrySkill: vi.fn().mockResolvedValue(undefined),
    scanLocalPreview: vi.fn().mockResolvedValue([]),
    selectRegistrySkill: vi.fn(),
    selectedRegistrySlug: null,
    registrySkills: [],
    selectedStoreSourceId: "official",
    selectStoreSource: vi.fn(),
    customStoreSources: [],
    addCustomStoreSource: vi.fn(),
    removeCustomStoreSource: vi.fn(),
    toggleCustomStoreSource: vi.fn(),
    remoteStoreEntries: {},
    setRemoteStoreEntry: vi.fn(),
    importScannedSkills: vi.fn().mockResolvedValue({ importedCount: 0 }),
    translateContent: vi.fn().mockResolvedValue(undefined),
    getTranslation: vi.fn().mockReturnValue(null),
    clearTranslation: vi.fn(),
    ...overrides,
  };
}

function createSettingsState(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    customSkillScanPaths: [],
    translationMode: "full",
    skillInstallMethod: "symlink",
    ...overrides,
  };
}

describe("skill i18n smoke", () => {
  it("keeps all locale skill keys aligned with english", () => {
    const locales = {
      zh,
      "zh-TW": zhTw,
      ja,
      fr,
      de,
      es,
    } as const;
    const expectedKeys = flattenKeys((en as TranslationTree).skill as TranslationTree);

    for (const [locale, messages] of Object.entries(locales)) {
      const actualKeys = new Set(
        flattenKeys((messages as TranslationTree).skill as TranslationTree),
      );
      const missing = expectedKeys.filter((key) => !actualKeys.has(key));
      expect(missing, `${locale} is missing skill keys`).toEqual([]);
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:skill-export");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    useToastMock.mockReturnValue({ showToast: vi.fn() });
    useSkillPlatformMock.mockReturnValue({
      availablePlatforms: [],
      batchInstall: vi.fn().mockResolvedValue({
        successCount: 0,
        totalCount: 0,
      }),
      deselectAllPlatforms: vi.fn(),
      installProgress: null,
      installStatus: {},
      isBatchInstalling: false,
      selectedPlatforms: new Set<string>(),
      selectAllPlatforms: vi.fn(),
      togglePlatformSelection: vi.fn(),
      uninstallFromPlatform: vi.fn().mockResolvedValue(undefined),
      uninstalledPlatforms: [],
    });

    (window as any).api = {
      skill: {
        export: vi.fn().mockResolvedValue("---\nname: write\n---\n# Write"),
        exportZip: vi.fn().mockResolvedValue({
          fileName: "write.zip",
          base64: "UEsDBA==",
        }),
        readLocalFiles: vi.fn().mockResolvedValue([
          {
            path: "SKILL.md",
            content: "---\ndescription: Write helper\n---\n\n# Write",
            isDirectory: false,
          },
        ]),
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as Window & { __PROMPTHUB_WEB__?: boolean }).__PROMPTHUB_WEB__;
  });

  it("renders skill manager actions in english and updates selection summary", async () => {
    const skillStoreState = createSkillStoreState();
    const settingsState = createSettingsState();

    useSkillStoreMock.mockImplementation((selector) => selector(skillStoreState));
    useSettingsStoreMock.mockImplementation((selector) => selector(settingsState));

    render(<SkillManager />);

    expect(screen.getByRole("button", { name: "Batch Manage" })).toBeInTheDocument();
    expect(
      screen.getByText("Manage all imported skills in one place, regardless of where they came from."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Batch Manage" }));

    expect(screen.getByText("Batch Mode")).toBeInTheDocument();
    expect(screen.getByText("0 selected")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Select All" }));

    await waitFor(() => {
      expect(screen.getByText("1 selected")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Batch Deploy" })).toBeInTheDocument();
  });

  it("renders skill detail page chrome in english without chinese fallback text", async () => {
    const syncedSkill = {
      ...baseSkill,
      description: "Write helper",
      instructions: "---\ndescription: Write helper\n---\n\n# Write",
      content: "---\ndescription: Write helper\n---\n\n# Write",
    };
    const skillStoreState = createSkillStoreState({
      selectedSkillId: baseSkill.id,
      syncSkillFromRepo: vi.fn().mockResolvedValue(syncedSkill),
    });
    const settingsState = createSettingsState();

    useSkillStoreMock.mockImplementation((selector) => selector(skillStoreState));
    useSettingsStoreMock.mockImplementation((selector) => selector(settingsState));

    await act(async () => {
      render(<SkillFullDetailPage />);
    });

    expect(screen.getByRole("button", { name: "Snapshot" })).toBeInTheDocument();
    expect(screen.getByText("Current Version v0")).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText("Source")).toBeInTheDocument();
    expect(screen.getByText("Files")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Platform Integration")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Write helper")).toBeInTheDocument();
    });
    expect(skillStoreState.syncSkillFromRepo).toHaveBeenCalledWith(baseSkill.id);
    expect(screen.getByText("Imported from Local Folder")).toBeInTheDocument();
    expect(screen.queryByText("源码/内容")).not.toBeInTheDocument();
    expect(screen.queryByText("批量管理")).not.toBeInTheDocument();
  });

  it("exports a full local repo zip from the detail panel", async () => {
    const skillStoreState = createSkillStoreState({
      selectedSkillId: baseSkill.id,
      syncSkillFromRepo: vi.fn().mockResolvedValue(baseSkill),
    });
    const settingsState = createSettingsState();
    const originalCreateElement = document.createElement.bind(document);

    useSkillStoreMock.mockImplementation((selector) => selector(skillStoreState));
    useSettingsStoreMock.mockImplementation((selector) => selector(settingsState));

    await act(async () => {
      render(<SkillFullDetailPage />);
    });

    const anchor = originalCreateElement("a");
    const clickSpy = vi.spyOn(anchor, "click").mockImplementation(() => {});
    const appendChild = vi.spyOn(document.body, "appendChild");
    const removeChild = vi.spyOn(document.body, "removeChild");
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tagName) => {
        if (tagName === "a") {
          return anchor;
        }
        return originalCreateElement(tagName);
      });

    fireEvent.click(screen.getByRole("button", { name: "ZIP" }));

    await waitFor(() => {
      expect(window.api.skill.exportZip).toHaveBeenCalledWith(baseSkill.id);
    });
    expect(anchor.download).toBe("write.zip");
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(appendChild).toHaveBeenCalledWith(anchor);
    expect(removeChild).toHaveBeenCalledWith(anchor);

    createElementSpy.mockRestore();
    clickSpy.mockRestore();
  });

  it("renders zip as the primary archive export in the platform panel", () => {
    render(
      <SkillPlatformPanel
        availablePlatforms={[]}
        handleExport={vi.fn()}
        installMode="symlink"
        installProgress={null}
        isBatchInstalling={false}
        onBatchInstall={vi.fn()}
        selectedPlatforms={new Set<string>()}
        selectedSkill={baseSkill}
        selectAllPlatforms={vi.fn()}
        deselectAllPlatforms={vi.fn()}
        setInstallMode={vi.fn()}
        skillMdInstallStatus={{}}
        t={translate as any}
        togglePlatformSelection={vi.fn()}
        uninstallFromPlatform={vi.fn()}
        uninstalledPlatforms={[]}
      />,
    );

    expect(screen.getByRole("button", { name: /SKILL\.md/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ZIP/i })).toBeInTheDocument();
    expect(screen.queryByText("JSON")).not.toBeInTheDocument();
  });

  it("hides desktop-only skill surfaces in web runtime", async () => {
    (window as Window & { __PROMPTHUB_WEB__?: boolean }).__PROMPTHUB_WEB__ = true;

    const setStoreView = vi.fn();
    const setFilterType = vi.fn();
    const skillStoreState = createSkillStoreState({
      storeView: "store",
      filterType: "pending",
      setStoreView,
      setFilterType,
      selectedSkillId: baseSkill.id,
      syncSkillFromRepo: vi.fn().mockResolvedValue(baseSkill),
    });
    const settingsState = createSettingsState();

    useSkillStoreMock.mockImplementation((selector) => selector(skillStoreState));
    useSettingsStoreMock.mockImplementation((selector) => selector(settingsState));

    const { unmount } = render(<SkillManager />);

    await waitFor(() => {
      expect(setStoreView).toHaveBeenCalledWith("my-skills");
    });
    await waitFor(() => {
      expect(setFilterType).toHaveBeenCalledWith("all");
    });
    expect(screen.queryByText("Skill Store")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Batch Deploy" })).not.toBeInTheDocument();

    unmount();

    await act(async () => {
      render(<SkillFullDetailPage />);
      await Promise.resolve();
    });

    expect(screen.queryByText("Files")).not.toBeInTheDocument();
    expect(screen.queryByText("Platform Integration")).not.toBeInTheDocument();
    expect(screen.getByText("Skill Workspace")).toBeInTheDocument();
  });

  it("finishes progressive rendering for large skill lists", async () => {
    const manySkills: Skill[] = Array.from({ length: 129 }, (_, index) => ({
      ...baseSkill,
      id: `skill-${index}`,
      name: `skill-${index}`,
      description: `Skill ${index}`,
      created_at: Date.now() + index,
      updated_at: Date.now() + index,
    }));

    const skillStoreState = createSkillStoreState({
      skills: manySkills,
    });
    const settingsState = createSettingsState();

    useSkillStoreMock.mockImplementation((selector) => selector(skillStoreState));
    useSettingsStoreMock.mockImplementation((selector) => selector(settingsState));

    render(<SkillManager />);

    expect(screen.getByText("Rendering 120/129 in chunks")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByText("Rendering 120/129 in chunks"),
      ).not.toBeInTheDocument();
    });
  });
});
