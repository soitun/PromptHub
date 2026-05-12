import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/renderer/services/webdav-save-sync", () => ({
  scheduleAllSaveSync: vi.fn(),
}));

import { useRulesStore } from "../../../src/renderer/stores/rules.store";
import { useSettingsStore } from "../../../src/renderer/stores/settings.store";
import { scheduleAllSaveSync } from "../../../src/renderer/services/webdav-save-sync";
import { installWindowMocks } from "../../helpers/window";

describe("rules store", () => {
  beforeEach(() => {
    useRulesStore.setState({
      files: [],
      selectedRuleId: null,
      currentFile: null,
      draftContent: "",
      aiInstruction: "",
      aiSummary: null,
      isLoading: false,
      isSaving: false,
      isRewriting: false,
      error: null,
    });
    useSettingsStore.setState({
      aiProvider: "openai",
      aiApiKey: "test-key",
      aiApiUrl: "https://api.openai.com/v1",
      aiModel: "gpt-4o-mini",
      aiModels: [],
    });
  });

  it("loads descriptors, selects the first rule, and groups files into global/project sections", async () => {
    installWindowMocks({
      api: {
        rules: {
          list: vi.fn().mockResolvedValue([
            {
              id: "project:docs-site",
              platformId: "workspace",
              platformName: "Docs Site",
              platformIcon: "FolderRoot",
              platformDescription: "Project rules",
              name: "AGENTS.md",
              description: "Docs site rules",
              path: "/tmp/docs-site/AGENTS.md",
              exists: true,
              group: "workspace",
            },
            {
              id: "claude-global",
              platformId: "claude",
              platformName: "Claude Code",
              platformIcon: "claude",
              platformDescription: "Claude rules",
              name: "CLAUDE.md",
              description: "Claude global rule file",
              path: "/Users/test/.claude/CLAUDE.md",
              exists: true,
              group: "assistant",
            },
          ]),
          read: vi.fn().mockResolvedValue({
            id: "project:docs-site",
            platformId: "workspace",
            platformName: "Docs Site",
            platformIcon: "FolderRoot",
            platformDescription: "Project rules",
            name: "AGENTS.md",
            description: "Docs site rules",
            path: "/tmp/docs-site/AGENTS.md",
            exists: true,
            group: "workspace",
            content: "# Docs site rules",
            versions: [],
          }),
        },
      },
    });

    await useRulesStore.getState().loadFiles();

    expect(useRulesStore.getState()).toEqual(
      expect.objectContaining({
        selectedRuleId: "project:docs-site",
        draftContent: "# Docs site rules",
        currentFile: expect.objectContaining({
          platformName: "Docs Site",
          content: "# Docs site rules",
        }),
      }),
    );
    expect(useRulesStore.getState().getSidebarSections()).toEqual([
      expect.objectContaining({
        id: "global",
        items: [expect.objectContaining({ id: "claude-global", type: "global" })],
      }),
      expect.objectContaining({
        id: "project",
        items: [expect.objectContaining({ id: "project:docs-site", type: "project" })],
      }),
    ]);
  });

  it("rewrites the current rule draft with AI", async () => {
    installWindowMocks({
      api: {
        rules: {
          rewrite: vi.fn().mockResolvedValue({
            content: "# Updated by AI",
            summary: "AI rewrite generated a new draft.",
          }),
        },
      },
    });

    useRulesStore.setState({
      currentFile: {
        id: "claude-global",
        platformId: "claude",
        platformName: "Claude Code",
        platformIcon: "Bot",
        platformDescription: "Claude rules",
        name: "CLAUDE.md",
        description: "Claude rules",
        path: "/Users/test/.claude/CLAUDE.md",
        exists: true,
        group: "assistant",
        content: "# Original",
        versions: [],
      },
      selectedRuleId: "claude-global",
      draftContent: "# Original",
      aiInstruction: "Tighten the rule wording",
    });

    await useRulesStore.getState().rewriteCurrentRule();

    expect(window.api.rules.rewrite).toHaveBeenCalledWith(
      expect.objectContaining({
        instruction: "Tighten the rule wording",
        fileName: "CLAUDE.md",
        platformName: "Claude Code",
        aiConfig: expect.objectContaining({
          apiKey: "test-key",
          apiUrl: "https://api.openai.com/v1",
          model: "gpt-4o-mini",
          provider: "openai",
        }),
      }),
    );

    expect(useRulesStore.getState()).toEqual(
      expect.objectContaining({
        draftContent: "# Updated by AI",
        aiSummary: "AI rewrite generated a new draft.",
        isRewriting: false,
      }),
    );
  });

  it("schedules WebDAV save-sync after saving a rule", async () => {
    installWindowMocks({
      api: {
        rules: {
          save: vi.fn().mockResolvedValue({
            id: "claude-global",
            platformId: "claude",
            platformName: "Claude Code",
            platformIcon: "Bot",
            platformDescription: "Claude rules",
            name: "CLAUDE.md",
            description: "Claude rules",
            path: "/Users/test/.claude/CLAUDE.md",
            exists: true,
            group: "assistant",
            content: "# Saved",
            versions: [],
          }),
        },
      },
    });

    useRulesStore.setState({
      files: [
        {
          id: "claude-global",
          platformId: "claude",
          platformName: "Claude Code",
          platformIcon: "Bot",
          platformDescription: "Claude rules",
          name: "CLAUDE.md",
          description: "Claude rules",
          path: "/Users/test/.claude/CLAUDE.md",
          exists: true,
          group: "assistant",
        },
      ],
      selectedRuleId: "claude-global",
      draftContent: "# Saved",
    });

    await useRulesStore.getState().saveCurrentRule();

    expect(scheduleAllSaveSync).toHaveBeenCalledWith("rules:save");
  });
});
