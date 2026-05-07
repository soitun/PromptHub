import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SkillFileEditor } from "../../../src/renderer/components/skill/SkillFileEditor";
import { renderWithI18n } from "../../helpers/i18n";
import { installWindowMocks } from "../../helpers/window";

vi.mock("../../../src/renderer/components/ui/Toast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

describe("SkillFileEditor", () => {
  beforeEach(() => {
    installWindowMocks({
      api: {
        skill: {
          listLocalFiles: vi.fn().mockResolvedValue([
            { path: "SKILL.md", isDirectory: false, size: 128 },
            { path: ".git", isDirectory: true },
            { path: ".prompthub", isDirectory: true },
            {
              path: ".prompthub/translations/zh-CN/full/SKILL.md",
              isDirectory: false,
              size: 256,
            },
          ]),
          readLocalFile: vi.fn().mockResolvedValue({
            path: "SKILL.md",
            isDirectory: false,
            content: "# Skill\n\nBody",
          }),
        },
      },
    });
  });

  it("hides internal repo directories from the visible file tree", async () => {
    await renderWithI18n(
      <SkillFileEditor skillId="skill-1" skillName="writer" isOpen={true} />,
      { language: "en" },
    );

    await waitFor(() => {
      expect(screen.getByText("SKILL.md")).toBeInTheDocument();
    });

    expect(screen.queryByText(".git")).not.toBeInTheDocument();
    expect(screen.queryByText(".prompthub")).not.toBeInTheDocument();
    expect(screen.queryByText("translations")).not.toBeInTheDocument();
  });
});
