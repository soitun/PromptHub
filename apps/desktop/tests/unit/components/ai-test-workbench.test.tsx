import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AiTestModal } from "../../../src/renderer/components/prompt/AiTestModal";
import { ToastProvider } from "../../../src/renderer/components/ui/Toast";
import type { Prompt } from "@prompthub/shared/types";
import { renderWithI18n } from "../../helpers/i18n";

const prompt: Prompt = {
  id: "prompt-1",
  title: "Screenshot Analyzer",
  systemPrompt: "You inspect product screenshots.",
  userPrompt: "Describe {{feature}} in the attached image.",
  variables: [],
  tags: [],
  isFavorite: false,
  isPinned: false,
  version: 1,
  currentVersion: 1,
  usageCount: 0,
  createdAt: new Date("2026-05-01T00:00:00.000Z").toISOString(),
  updatedAt: new Date("2026-05-01T00:00:00.000Z").toISOString(),
};

describe("AiTestModal workbench", () => {
  it("renders the unified test drawer with variables and compare mode for text prompts", async () => {
    await renderWithI18n(
      <ToastProvider>
        <AiTestModal
          isOpen
          onClose={vi.fn()}
          prompt={prompt}
          initialMode="compare"
        />
      </ToastProvider>,
      { language: "en" },
    );

    expect(screen.getByText("Screenshot Analyzer")).toBeInTheDocument();
    expect(screen.queryByText("Reference Images")).not.toBeInTheDocument();
    expect(screen.queryByText("Add Images")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Multi-Model Compare" })).toHaveClass("bg-primary");
    expect(screen.getByText("{{feature}}")).toBeInTheDocument();
  });

  it("shows reference image controls only for image prompts", async () => {
    await renderWithI18n(
      <ToastProvider>
        <AiTestModal
          isOpen
          onClose={vi.fn()}
          prompt={{
            ...prompt,
            id: "image-prompt-1",
            promptType: "image",
            images: ["reference.png"],
          }}
        />
      </ToastProvider>,
      { language: "en" },
    );

    expect(screen.getByText("Reference Images")).toBeInTheDocument();
    expect(screen.getByText("Add Images")).toBeInTheDocument();
    expect(screen.getByText("Selected")).toBeInTheDocument();
  });
});
