import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SkillStore } from "../../../src/renderer/components/skill/SkillStore";
import { useSkillStore } from "../../../src/renderer/stores/skill.store";
import { renderWithI18n } from "../../helpers/i18n";
import { installWindowMocks } from "../../helpers/window";

const { showToast } = vi.hoisted(() => ({
  showToast: vi.fn(),
}));

vi.mock("../../../src/renderer/components/ui/Toast", () => ({
  useToast: () => ({ showToast }),
}));

describe("SkillStore custom sources", () => {
  it("renames a custom store source from the detail panel", async () => {
    installWindowMocks({
      api: {
        skill: {
          fetchRemoteContent: vi.fn().mockResolvedValue(JSON.stringify({ skills: [] })),
          scanLocalPreview: vi.fn().mockResolvedValue([]),
          scanSafety: vi.fn().mockResolvedValue({
            level: "safe",
            summary: "safe",
            findings: [],
            recommendedAction: "allow",
            scannedAt: Date.now(),
            checkedFileCount: 1,
            scanMethod: "static",
          }),
        },
      },
    });

    useSkillStore.setState({
      storeView: "store",
      customStoreSources: [
        {
          id: "custom-docs",
          name: "Docs Store",
          type: "marketplace-json",
          url: "https://example.com/store.json",
          enabled: true,
          order: 0,
          createdAt: Date.now(),
        },
      ],
      selectedStoreSourceId: "custom-docs",
    } as never);

    await act(async () => {
      await renderWithI18n(<SkillStore />, { language: "en" });
    });

    fireEvent.click(screen.getByTitle("Edit"));

    const input = screen.getByDisplayValue("Docs Store");
    fireEvent.change(input, { target: { value: "Docs Store Renamed" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(useSkillStore.getState().customStoreSources[0]?.name).toBe(
        "Docs Store Renamed",
      );
    });

    expect(screen.getAllByText("Docs Store Renamed").length).toBeGreaterThan(0);
  });
});
