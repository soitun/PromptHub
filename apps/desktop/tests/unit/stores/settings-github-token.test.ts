import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * Renderer-side tests for the GitHub token setter (issue #108).
 *
 * Besides functional behavior, we also guard:
 *   - Control characters (CR/LF/null bytes) are stripped before the value
 *     lands in persisted state — this is a defence-in-depth layer against
 *     HTTP header injection; the main process re-validates before sending.
 *   - Every store change is pushed to the main-process DB via
 *     window.api.settings.set so the main process sees the same value when
 *     it attaches Authorization headers.
 */

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
  await Promise.resolve();
  return { useSettingsStore: mod.useSettingsStore, setSpy };
}

function lastPayloadWithKey(
  spy: ReturnType<typeof vi.fn>,
  key: string,
): Record<string, unknown> | undefined {
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

describe("settings store · setGithubToken (issue #108)", () => {
  beforeEach(() => {
    changeLanguageMock.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("stores a valid token and pushes it to the main process", async () => {
    const { useSettingsStore, setSpy } = await importStoreWithSpy();

    useSettingsStore.getState().setGithubToken("ghp_ValidToken123");

    expect(useSettingsStore.getState().githubToken).toBe("ghp_ValidToken123");
    const payload = lastPayloadWithKey(setSpy, "githubToken");
    expect(payload).toBeDefined();
    expect(payload?.githubToken).toBe("ghp_ValidToken123");
  });

  it("trims surrounding whitespace", async () => {
    const { useSettingsStore, setSpy } = await importStoreWithSpy();

    useSettingsStore.getState().setGithubToken("   ghp_Trimmed   ");

    expect(useSettingsStore.getState().githubToken).toBe("ghp_Trimmed");
    const payload = lastPayloadWithKey(setSpy, "githubToken");
    expect(payload?.githubToken).toBe("ghp_Trimmed");
  });

  it.each([
    ["newline", "ghp_value\nextra"],
    ["carriage return", "ghp_value\rextra"],
    ["CRLF", "ghp_value\r\nextra"],
    ["null byte", "ghp_value\x00extra"],
    ["tab (falls under control range)", "ghp_value\textra"],
  ])(
    "strips control characters to prevent header injection (%s)",
    async (_label, dangerous) => {
      const { useSettingsStore } = await importStoreWithSpy();

      useSettingsStore.getState().setGithubToken(dangerous);

      const stored = useSettingsStore.getState().githubToken;
      expect(stored).not.toMatch(/[\r\n\x00-\x1f\x7f]/);
      // The safe prefix survives so the caller still gets a usable token.
      expect(stored.startsWith("ghp_value")).toBe(true);
    },
  );

  it("clearing the token also clears the main-process value", async () => {
    const { useSettingsStore, setSpy } = await importStoreWithSpy();

    useSettingsStore.getState().setGithubToken("ghp_First");
    useSettingsStore.getState().setGithubToken("");

    expect(useSettingsStore.getState().githubToken).toBe("");
    const payload = lastPayloadWithKey(setSpy, "githubToken");
    expect(payload?.githubToken).toBe("");
  });
});
