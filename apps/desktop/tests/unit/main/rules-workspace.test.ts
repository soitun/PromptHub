import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { closeDatabase, initDatabase, RuleDB } from "../../../src/main/database";
import {
  configureRuntimePaths,
  getRulesDir,
  resetRuntimePaths,
} from "../../../src/main/runtime-paths";
import {
  createProjectRule,
  exportRuleBackupRecords,
  importRuleBackupRecords,
  readRuleContent,
  removeProjectRule,
  saveRuleContent,
} from "../../../src/main/services/rules-workspace";

describe("rules workspace storage", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "prompthub-rules-"));
    configureRuntimePaths({ userDataPath: tempDir });
    initDatabase();
  });

  afterEach(() => {
    closeDatabase();
    resetRuntimePaths();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("creates a managed project rule and indexes it in SQLite", async () => {
    const projectRoot = path.join(tempDir, "docs-site");
    fs.mkdirSync(projectRoot, { recursive: true });
    fs.writeFileSync(path.join(projectRoot, "AGENTS.md"), "# Existing docs rule", "utf8");

    const descriptor = await createProjectRule({
      id: "docs-site",
      name: "Docs Site",
      rootPath: projectRoot,
    });

    expect(descriptor.id).toBe("project:docs-site");

    const managedPath = path.join(getRulesDir(), "projects", "docs-site__docs-site", "AGENTS.md");
    expect(fs.existsSync(managedPath)).toBe(true);
    expect(fs.readFileSync(managedPath, "utf8")).toBe("# Existing docs rule");

    const db = new RuleDB(initDatabase());
    expect(db.getById("project:docs-site")).toEqual(
      expect.objectContaining({
        platformName: "Docs Site",
        managedPath,
        currentVersion: 1,
      }),
    );
  });

  it("saves managed content, writes versions, and updates rule index state", async () => {
    const projectRoot = path.join(tempDir, "docs-site");
    fs.mkdirSync(projectRoot, { recursive: true });

    await createProjectRule({ id: "docs-site", name: "Docs Site", rootPath: projectRoot });

    const updated = await saveRuleContent("project:docs-site", "# Updated docs rule\n\n## Policy");

    expect(updated.content).toContain("Updated docs rule");
    expect(fs.readFileSync(path.join(projectRoot, "AGENTS.md"), "utf8")).toContain("## Policy");

    const versionFile = path.join(
      getRulesDir(),
      ".versions",
      encodeURIComponent("project:docs-site"),
      "0001.md",
    );
    expect(fs.existsSync(versionFile)).toBe(true);

    const db = new RuleDB(initDatabase());
    expect(db.getById("project:docs-site")).toEqual(
      expect.objectContaining({
        syncStatus: "synced",
        currentVersion: 1,
      }),
    );
    expect(db.getVersions("project:docs-site")).toHaveLength(1);

    const content = await readRuleContent("project:docs-site");
    expect(content.versions).toHaveLength(1);
    expect(content.versions[0].content).toContain("Updated docs rule");
  });

  it("removes a project rule from files and SQLite index", async () => {
    const projectRoot = path.join(tempDir, "docs-site");
    fs.mkdirSync(projectRoot, { recursive: true });

    await createProjectRule({ id: "docs-site", name: "Docs Site", rootPath: projectRoot });
    await saveRuleContent("project:docs-site", "# Updated docs rule");

    await removeProjectRule("docs-site");

    expect(fs.existsSync(path.join(getRulesDir(), "projects", "docs-site__docs-site"))).toBe(false);
    expect(
      fs.existsSync(path.join(getRulesDir(), ".versions", encodeURIComponent("project:docs-site"))),
    ).toBe(false);

    const db = new RuleDB(initDatabase());
    expect(db.getById("project:docs-site")).toBeNull();
    expect(db.getVersions("project:docs-site")).toEqual([]);
  });

  it("imports backup records into managed files and SQLite index", async () => {
    const projectRoot = path.join(tempDir, "imported-site");
    fs.mkdirSync(projectRoot, { recursive: true });

    await importRuleBackupRecords([
      {
        id: "project:imported-site",
        platformId: "workspace",
        platformName: "Imported Site",
        platformIcon: "FolderRoot",
        platformDescription: "Imported project rules",
        name: "AGENTS.md",
        description: "Imported managed rule",
        path: path.join(projectRoot, "AGENTS.md"),
        managedPath: undefined,
        targetPath: path.join(projectRoot, "AGENTS.md"),
        projectRootPath: projectRoot,
        syncStatus: "target-missing",
        content: "# Imported rule",
        versions: [
          {
            id: "imported-version-1",
            savedAt: "2026-05-09T00:00:00.000Z",
            source: "create",
            content: "# Imported rule",
          },
        ],
      },
    ]);

    const records = await exportRuleBackupRecords();
    expect(records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "project:imported-site",
          content: "# Imported rule",
        }),
      ]),
    );

    const db = new RuleDB(initDatabase());
    expect(db.getById("project:imported-site")).toEqual(
      expect.objectContaining({
        platformName: "Imported Site",
        currentVersion: 1,
      }),
    );
  });
});
