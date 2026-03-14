import { test, expect } from "@playwright/test";

import { closePromptHub, launchPromptHub, setAppLanguage } from "./helpers/electron";

test.describe("E2E: Skill smoke", () => {
  test("launches with isolated test profile and opens the seeded skill workflow", async () => {
    const { app, page, userDataDir } = await launchPromptHub("skills-smoke.seed.json");

    try {
      await setAppLanguage(page, "en");

      await expect(page).toHaveTitle(/PromptHub/);
      await expect(page.getByRole("button", { name: "Skills" })).toBeVisible();

      await page.getByRole("button", { name: "Skills" }).click();
      await expect(page.getByRole("button", { name: "My Skills" })).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "write" }),
      ).toBeVisible();

      await page.getByRole("heading", { name: "write" }).click();
      await expect(page.getByRole("button", { name: "Snapshot" })).toBeVisible();
      await expect(page.getByText("Current Version v0")).toBeVisible();

      await page.getByRole("button", { name: "Snapshot" }).click();
      await expect(page.getByRole("heading", { name: "Create Snapshot" })).toBeVisible();
      await page.getByPlaceholder("Describe what changed...").fill(
        "Smoke snapshot from Playwright",
      );
      await page
        .getByRole("button", { name: "Create Snapshot" })
        .evaluate((button) => {
          (button as HTMLButtonElement).click();
        });

      await expect(page.getByText(/Update failed:/)).toHaveCount(0);

      await expect
        .poll(() =>
          page.evaluate(async () => {
            const skills = await window.api.skill.getAll();
            return skills.find((skill) => skill.name === "write")?.currentVersion ?? -1;
          }),
        )
        .toBe(1);

      await expect(
        page.getByRole("heading", { name: "Create Snapshot" }),
      ).not.toBeVisible();
      await expect(page.getByText("Current Version v1")).toBeVisible();
    } finally {
      await closePromptHub(app, userDataDir);
    }
  });
});
