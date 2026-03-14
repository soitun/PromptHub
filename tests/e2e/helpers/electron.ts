import { _electron as electron, expect, type ElectronApplication, type Page } from "@playwright/test";
import fs from "fs";
import os from "os";
import path from "path";

export interface LaunchedElectronApp {
  app: ElectronApplication;
  page: Page;
  userDataDir: string;
}

function getMainEntry() {
  return path.join(process.cwd(), "out/main/index.js");
}

function getSeedPath(seedFileName: string) {
  return path.join(process.cwd(), "tests/e2e/fixtures", seedFileName);
}

export async function launchPromptHub(seedFileName: string): Promise<LaunchedElectronApp> {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "prompthub-e2e-"));
  const mainEntry = getMainEntry();

  const app = await electron.launch({
    args: [mainEntry],
    env: {
      ...process.env,
      NODE_ENV: "test",
      PROMPTHUB_E2E: "1",
      PROMPTHUB_E2E_USER_DATA_DIR: userDataDir,
      PROMPTHUB_E2E_SEED_PATH: getSeedPath(seedFileName),
    },
  });

  const page = await app.firstWindow();
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("#root")).toBeVisible();

  return { app, page, userDataDir };
}

export async function setAppLanguage(page: Page, language: string) {
  await page.evaluate((nextLanguage) => {
    localStorage.setItem(
      "prompthub-settings",
      JSON.stringify({
        state: { language: nextLanguage },
      }),
    );
  }, language);
  await page.reload();
  await page.waitForLoadState("domcontentloaded");
}

export async function closePromptHub(app: ElectronApplication, userDataDir: string) {
  await app.close();
  fs.rmSync(userDataDir, { recursive: true, force: true });
}
