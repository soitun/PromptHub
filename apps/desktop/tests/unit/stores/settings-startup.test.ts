import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// See issue #115 — when the user toggles "minimize on launch" in the UI,
// the setting was only persisted to localStorage (zustand persist). The main
// process — which reads from the SQLite settings table — never saw it.
// This suite guards that the store now also pushes the value to main via
// window.api.settings.set.

const changeLanguageMock = vi.fn();

vi.mock("../../../src/renderer/i18n", () => ({
  __esModule: true,
  default: { language: "en" },
  changeLanguage: changeLanguageMock,
}));

async function importStoreWithSpy() {
  vi.resetModules();
  localStorage.clear();
  const setSpy = vi.fn().mockResolvedValue(undefined);
  window.api = {
    ...(window.api ?? {}),
    settings: {
      ...(window.api?.settings ?? {}),
      set: setSpy,
    },
  };
  const mod = await import("../../../src/renderer/stores/settings.store");
  // Wait one microtask so any async rehydration callback can settle.
  await Promise.resolve();
  return { useSettingsStore: mod.useSettingsStore, setSpy };
}

function lastPayloadWithKey(
  spy: ReturnType<typeof vi.fn>,
  key: string,
): Record<string, unknown> | undefined {
  // Scan from the most recent call backwards so we pick up the latest write.
  for (let i = spy.mock.calls.length - 1; i >= 0; i -= 1) {
    const payload = spy.mock.calls[i]?.[0] as
      | Record<string, unknown>
      | undefined;
    if (payload && key in payload) {
      return payload;
    }
  }
  return undefined;
}

describe("settings startup behavior sync (issue #115)", () => {
  beforeEach(() => {
    changeLanguageMock.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("syncs minimizeOnLaunch=true to the main process when toggled", async () => {
    const { useSettingsStore, setSpy } = await importStoreWithSpy();

    useSettingsStore.getState().setMinimizeOnLaunch(true);

    expect(useSettingsStore.getState().minimizeOnLaunch).toBe(true);
    const payload = lastPayloadWithKey(setSpy, "minimizeOnLaunch");
    expect(payload).toBeDefined();
    expect(payload?.minimizeOnLaunch).toBe(true);
  });

  it("syncs minimizeOnLaunch=false to the main process when toggled off", async () => {
    const { useSettingsStore, setSpy } = await importStoreWithSpy();

    useSettingsStore.getState().setMinimizeOnLaunch(false);

    expect(useSettingsStore.getState().minimizeOnLaunch).toBe(false);
    const payload = lastPayloadWithKey(setSpy, "minimizeOnLaunch");
    expect(payload).toBeDefined();
    expect(payload?.minimizeOnLaunch).toBe(false);
  });

  it("syncs launchAtStartup to the main process when toggled", async () => {
    const { useSettingsStore, setSpy } = await importStoreWithSpy();

    useSettingsStore.getState().setLaunchAtStartup(true);

    expect(useSettingsStore.getState().launchAtStartup).toBe(true);
    const payload = lastPayloadWithKey(setSpy, "launchAtStartup");
    expect(payload).toBeDefined();
    expect(payload?.launchAtStartup).toBe(true);
  });
});
