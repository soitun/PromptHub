import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RulesManager } from "../../../src/renderer/components/rules/RulesManager";
import { useRulesStore } from "../../../src/renderer/stores/rules.store";
import { useSettingsStore } from "../../../src/renderer/stores/settings.store";
import { renderWithI18n } from "../../helpers/i18n";
import { installWindowMocks } from "../../helpers/window";

const showToast = vi.fn();

vi.mock("../../../src/renderer/components/ui/Toast", () => ({
  useToast: () => ({ showToast }),
}));

describe("RulesManager", () => {
  beforeEach(() => {
    showToast.mockReset();
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

  it("opens the selected rule location for a managed project rule", async () => {
    const { api, electron } = installWindowMocks({
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

    await act(async () => {
      await renderWithI18n(<RulesManager />, { language: "en" });
    });

    await waitFor(() => {
      expect(screen.getByText("Docs Site")).toBeInTheDocument();
      expect(screen.getByDisplayValue("# Docs site rules")).toBeInTheDocument();
    });

    expect(api.rules.list).toHaveBeenCalledTimes(1);
    expect(api.rules.read).toHaveBeenCalledWith("project:docs-site");

    fireEvent.click(screen.getByRole("button", { name: "Open Location" }));

    expect(electron.openPath).toHaveBeenCalledWith("/tmp/docs-site/AGENTS.md");
  });

  it("rewrites a rule draft with AI and then saves the updated content", async () => {
    const { api } = installWindowMocks({
      api: {
        rules: {
          list: vi.fn().mockResolvedValue([
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
          ]),
          read: vi.fn().mockResolvedValue({
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
            content: "# Claude rules",
            versions: [],
          }),
          rewrite: vi.fn().mockResolvedValue({
            content: "# Claude rules\n\n## New policy",
            summary: "AI rewrite generated a new draft.",
          }),
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
            content: "# Claude rules\n\n## New policy",
            versions: [
              {
                id: "claude-global-1",
                savedAt: "2026-05-08T00:00:00.000Z",
                content: "# Claude rules\n\n## New policy",
                source: "manual-save",
              },
            ],
          }),
        },
      },
    });

    await act(async () => {
      await renderWithI18n(<RulesManager />, { language: "en" });
    });

    const instruction = await screen.findByPlaceholderText(
      "Example: tighten coding standards, add testing requirements, and keep the existing markdown headings.",
    );

    fireEvent.change(instruction, {
      target: { value: "Add a new policy section" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Rewrite with AI" }));

    await waitFor(() => {
      expect(api.rules.rewrite).toHaveBeenCalledWith(
        expect.objectContaining({
          instruction: "Add a new policy section",
          fileName: "CLAUDE.md",
          platformName: "Claude Code",
        }),
      );
    });

    expect(screen.getAllByAltText("claude icon").length).toBeGreaterThan(0);
    expect(screen.getByText("AI rewrite generated a new draft.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(api.rules.save).toHaveBeenCalledWith(
        "claude-global",
        "# Claude rules\n\n## New policy",
      );
    });

    expect(showToast).toHaveBeenCalledWith("Saved successfully", "success");
  });

  it("previews a version snapshot and restores it to the draft", async () => {
    installWindowMocks({
      api: {
        rules: {
          list: vi.fn().mockResolvedValue([
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
          ]),
          read: vi.fn().mockResolvedValue({
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
            content: "# Current draft",
            versions: [
              {
                id: "v2",
                savedAt: "2026-05-08T12:00:00.000Z",
                content: "# Historical snapshot\n\n## Policy",
                source: "manual-save",
              },
            ],
          }),
        },
      },
    });

    await act(async () => {
      await renderWithI18n(<RulesManager />, { language: "en" });
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("# Current draft")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /saved/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Back to Draft" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Restore to Draft" })).toBeInTheDocument();
    });

    const editor = screen.getAllByRole("textbox").find((node) => {
      return (node as HTMLTextAreaElement).value.includes("Historical snapshot");
    }) as HTMLTextAreaElement | undefined;

    expect(editor).toBeDefined();
    expect(editor).toHaveAttribute("readonly");

    fireEvent.click(screen.getByRole("button", { name: "Restore to Draft" }));

    await waitFor(() => {
      const restoredEditor = screen.getAllByRole("textbox").find((node) => {
        return (node as HTMLTextAreaElement).value.includes("Historical snapshot");
      }) as HTMLTextAreaElement | undefined;

      expect(restoredEditor).toBeDefined();
      expect(restoredEditor).not.toHaveAttribute("readonly");
    });

    expect(showToast).toHaveBeenCalledWith("Snapshot restored to draft", "success");
  });

  it("renders a single editable rule textarea for the current draft", async () => {
    installWindowMocks({
      api: {
        rules: {
          list: vi.fn().mockResolvedValue([
            {
              id: "gemini-global",
              platformId: "gemini",
              platformName: "Gemini CLI",
              platformIcon: "gemini",
              platformDescription: "Gemini rules",
              name: "GEMINI.md",
              description: "Gemini global rule file",
              path: "/Users/test/.gemini/GEMINI.md",
              exists: true,
              group: "assistant",
            },
          ]),
          read: vi.fn().mockResolvedValue({
            id: "gemini-global",
            platformId: "gemini",
            platformName: "Gemini CLI",
            platformIcon: "gemini",
            platformDescription: "Gemini rules",
            name: "GEMINI.md",
            description: "Gemini global rule file",
            path: "/Users/test/.gemini/GEMINI.md",
            exists: true,
            group: "assistant",
            content: "# Gemini rules",
            versions: [],
          }),
        },
      },
    });

    await act(async () => {
      await renderWithI18n(<RulesManager />, { language: "en" });
    });

    const textboxes = screen.getAllByRole("textbox");
    const editor = textboxes.filter(
      (node) => (node as HTMLTextAreaElement).value === "# Gemini rules",
    );

    expect(editor).toHaveLength(1);
    expect(editor[0]).not.toHaveAttribute("readonly");
  });
});
