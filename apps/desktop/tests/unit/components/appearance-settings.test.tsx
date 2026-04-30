import { act, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppearanceSettings } from "../../../src/renderer/components/settings/AppearanceSettings";
import { renderWithI18n } from "../../helpers/i18n";

const useSettingsStoreMock = vi.fn();

vi.mock("../../../src/renderer/runtime", () => ({
  isWebRuntime: () => false,
}));

vi.mock("../../../src/renderer/stores/settings.store", () => ({
  useSettingsStore: () => useSettingsStoreMock(),
  MORANDI_THEMES: [{ id: "blue", hue: 210, saturation: 35, name: "Misty Blue" }],
  FONT_SIZES: [{ id: "medium", value: 16, name: "Medium" }],
  getRenderedBackgroundImageOpacity: (value: number) => value,
  getRenderedBackgroundImageBlur: (value: number) => value,
}));

function createSettingsState(overrides: Record<string, unknown> = {}) {
  return {
    themeMode: "light",
    themeColor: "blue",
    customThemeHex: "#3b82f6",
    fontSize: "medium",
    backgroundImageFileName: undefined,
    backgroundImageOpacity: 0.88,
    backgroundImageBlur: 16,
    setThemeMode: vi.fn(),
    setThemeColor: vi.fn(),
    setCustomThemeHex: vi.fn(),
    setFontSize: vi.fn(),
    applyBackgroundImageSelection: vi.fn(),
    setBackgroundImageFileName: vi.fn(),
    setBackgroundImageOpacity: vi.fn(),
    setBackgroundImageBlur: vi.fn(),
    ...overrides,
  };
}

describe("AppearanceSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an empty-state preview before a background image is selected", async () => {
    useSettingsStoreMock.mockReturnValue(createSettingsState());

    await act(async () => {
      await renderWithI18n(<AppearanceSettings />, { language: "en" });
    });

    expect(screen.getByText("No background image selected")).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "Background image preview" }),
    ).not.toBeInTheDocument();
  });

  it("renders the preview with the same wallpaper shell structure used by the live app", async () => {
    useSettingsStoreMock.mockReturnValue(
      createSettingsState({ backgroundImageFileName: "wallpaper.png" }),
    );

    await act(async () => {
      await renderWithI18n(<AppearanceSettings />, { language: "en" });
    });

    const previewStage = document.querySelector(".background-preview-stage");

    expect(previewStage).not.toBeNull();
    expect(previewStage).toHaveClass("app-background-mode-image");
    expect(previewStage?.querySelector("img")).not.toBeNull();
    expect(previewStage?.querySelector(".background-preview-shell")).toHaveClass(
      "app-wallpaper-shell",
    );
    expect(previewStage?.querySelector(".app-left-rail-glass")).not.toBeNull();
    expect(previewStage?.querySelector(".sidebar-tag-section")).toHaveClass(
      "app-wallpaper-panel",
    );
    expect(previewStage?.querySelector(".sidebar-tag-section")).not.toHaveClass(
      "app-wallpaper-panel-strong",
    );
    expect(previewStage?.querySelector(".app-wallpaper-blanket")).not.toBeNull();
    expect(previewStage?.querySelector(".app-wallpaper-toolbar")).not.toBeNull();
    expect(previewStage?.querySelector(".prompt-list-pane")).not.toBeNull();
  });
});
