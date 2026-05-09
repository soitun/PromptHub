import { act, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SettingsPage } from "../../../src/renderer/components/settings/SettingsPage";
import { renderWithI18n } from "../../helpers/i18n";

vi.mock("../../../src/renderer/runtime", () => ({
  isWebRuntime: () => false,
}));

vi.mock("../../../src/renderer/components/settings/GeneralSettings", () => ({
  GeneralSettings: () => <div>general-content</div>,
}));
vi.mock("../../../src/renderer/components/settings/AppearanceSettings", () => ({
  AppearanceSettings: () => <div>appearance-content</div>,
}));
vi.mock("../../../src/renderer/components/settings/LanguageSettings", () => ({
  LanguageSettings: () => <div>language-content</div>,
}));
vi.mock("../../../src/renderer/components/settings/NotificationsSettings", () => ({
  NotificationsSettings: () => <div>notifications-content</div>,
}));
vi.mock("../../../src/renderer/components/settings/SecuritySettings", () => ({
  SecuritySettings: () => <div>security-content</div>,
}));
vi.mock("../../../src/renderer/components/settings/ShortcutsSettings", () => ({
  ShortcutsSettings: () => <div>shortcuts-content</div>,
}));
vi.mock("../../../src/renderer/components/settings/AboutSettings", () => ({
  AboutSettings: () => <div>about-content</div>,
}));
vi.mock("../../../src/renderer/components/settings/DataSettings", () => ({
  DataSettings: () => <div>data-content</div>,
}));
vi.mock("../../../src/renderer/components/settings/SkillSettings", () => ({
  SkillSettings: () => <div>skill-content</div>,
}));
vi.mock("../../../src/renderer/components/settings/AISettingsPrototype", () => ({
  AISettingsPrototype: () => <div>ai-content</div>,
}));
vi.mock("../../../src/renderer/components/settings/WebDeviceSettings", () => ({
  WebDeviceSettings: () => <div>web-device-content</div>,
}));
vi.mock("../../../src/renderer/components/settings/WebWorkspaceSettings", () => ({
  WebWorkspaceSettings: () => <div>web-workspace-content</div>,
}));

describe("SettingsPage", () => {
  it("shows a standalone agent management entry in the desktop settings navigation", async () => {
    await act(async () => {
      await renderWithI18n(<SettingsPage onBack={vi.fn()} />, {
        language: "en",
      });
    });

    const nav = screen.getByRole("navigation");
    expect(screen.getByText("general-content")).toBeInTheDocument();
    expect(nav).toHaveTextContent("General");
    expect(nav).toHaveTextContent("Data");
    expect(nav).toHaveTextContent("Agent Management");
    expect(nav).not.toHaveTextContent("Platform Preview");
    expect(nav).toHaveTextContent("Security");
    expect(nav.parentElement).not.toHaveClass("app-left-rail-glass");

    await act(async () => {
      screen.getByRole("button", { name: "Agent Management" }).click();
    });

    expect(screen.getByText("skill-content")).toBeInTheDocument();
  });
});
