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
  it("does not show a standalone Skill entry in the desktop settings navigation", async () => {
    await act(async () => {
      await renderWithI18n(<SettingsPage onBack={vi.fn()} />, {
        language: "zh",
      });
    });

    const nav = screen.getByRole("navigation");
    expect(nav).not.toHaveTextContent(/^Skill$/);
    expect(nav).not.toHaveTextContent(/^技能$/);
    expect(nav).toHaveTextContent("常规设置");
    expect(nav).toHaveTextContent("数据设置");
    expect(nav).toHaveTextContent("安全");
    expect(nav.parentElement).not.toHaveClass("app-left-rail-glass");
  });
});
