import fs from "fs";
import os from "os";
import path from "path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { closeDatabase } from "@prompthub/core";
import { createCliSkillService, runCli } from "@prompthub/core";

function makeTempRoot(tempDirs: string[]): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "prompthub-cli-app-"));
  tempDirs.push(dir);
  return dir;
}

function withDataDir(rootDir: string): string[] {
  return ["--data-dir", path.join(rootDir, "user-data")];
}

async function execCli(
  args: string[],
  skillService?: ReturnType<typeof createCliSkillService>,
) {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const exitCode = await runCli(
    args,
    {
      stdout: (message: string) => stdout.push(message),
      stderr: (message: string) => stderr.push(message),
    },
    undefined,
    undefined,
    skillService,
  );

  const joinedStdout = stdout.join("\n");
  const joinedStderr = stderr.join("\n");

  return {
    exitCode,
    stdout,
    stderr,
    joinedStdout,
    joinedStderr,
    errorJson:
      joinedStderr.trim().startsWith("{") || joinedStderr.trim().startsWith("[")
        ? JSON.parse(joinedStderr)
        : undefined,
    json:
      joinedStdout.trim().startsWith("{") || joinedStdout.trim().startsWith("[")
        ? JSON.parse(joinedStdout)
        : undefined,
  };
}

describe("standalone cli wiring", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    vi.restoreAllMocks();
    closeDatabase();
    for (const dir of tempDirs.splice(0)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("shows root help", async () => {
    const stdout: string[] = [];
    const stderr: string[] = [];

    const exitCode = await runCli(["--help"], {
      stdout: (message: string) => stdout.push(message),
      stderr: (message: string) => stderr.push(message),
    });

    expect(exitCode).toBe(0);
    expect(stdout.join("\n")).toContain("PromptHub CLI");
    expect(stderr).toEqual([]);
  });

  it("returns a usage error when --data-dir has no value", async () => {
    const result = await execCli(["--data-dir"]);

    expect(result.exitCode).toBe(2);
    expect(result.errorJson.error.code).toBe("USAGE_ERROR");
    expect(result.errorJson.error.message).toContain("--data-dir");
  });

  it("supports prompt create and list in an isolated data dir", async () => {
    const root = makeTempRoot(tempDirs);

    const createRes = await execCli([
      ...withDataDir(root),
      "prompt",
      "create",
      "--title",
      "CLI Prompt",
      "--user-prompt",
      "Hello CLI",
    ]);
    expect(createRes.exitCode).toBe(0);

    const listRes = await execCli([...withDataDir(root), "prompt", "list"]);
    expect(listRes.exitCode).toBe(0);
    expect(listRes.json).toHaveLength(1);
    expect(listRes.json[0].title).toBe("CLI Prompt");
  });

  it("normalizes CSV tags by trimming whitespace and dropping empty items", async () => {
    const root = makeTempRoot(tempDirs);

    const createRes = await execCli([
      ...withDataDir(root),
      "prompt",
      "create",
      "--title",
      "CSV Prompt",
      "--user-prompt",
      "Hello CSV",
      "--tags",
      " tag1 , tag2 , , tag3 ",
    ]);

    expect(createRes.exitCode).toBe(0);
    expect(createRes.json.tags).toEqual(["tag1", "tag2", "tag3"]);
  });

  it("rejects using inline and file system prompt inputs together", async () => {
    const root = makeTempRoot(tempDirs);
    const systemPromptFile = path.join(root, "system.md");
    fs.writeFileSync(systemPromptFile, "System prompt from file", "utf8");

    const result = await execCli([
      ...withDataDir(root),
      "prompt",
      "create",
      "--title",
      "Prompt With Conflict",
      "--user-prompt",
      "Hello conflict",
      "--system-prompt",
      "Inline system prompt",
      "--system-prompt-file",
      systemPromptFile,
    ]);

    expect(result.exitCode).toBe(2);
    expect(result.errorJson.error.code).toBe("USAGE_ERROR");
    expect(result.errorJson.error.message).toContain("不能同时使用");
  });

  it("supports the full prompt lifecycle", async () => {
    const root = makeTempRoot(tempDirs);

    const createRes = await execCli([
      ...withDataDir(root),
      "prompt",
      "create",
      "--title",
      "Lifecycle Prompt",
      "--user-prompt",
      "Initial content",
      "--tags",
      "lifecycle,test",
    ]);
    expect(createRes.exitCode).toBe(0);
    const promptId = createRes.json.id as string;

    const updateRes = await execCli([
      ...withDataDir(root),
      "prompt",
      "update",
      promptId,
      "--title",
      "Updated Lifecycle Prompt",
      "--favorite",
    ]);
    expect(updateRes.exitCode).toBe(0);
    expect(updateRes.json.title).toBe("Updated Lifecycle Prompt");
    expect(updateRes.json.isFavorite).toBe(true);

    const searchRes = await execCli([
      ...withDataDir(root),
      "prompt",
      "search",
      "Lifecycle",
      "--favorite",
    ]);
    expect(searchRes.exitCode).toBe(0);
    expect(searchRes.json).toHaveLength(1);
    expect(searchRes.json[0].id).toBe(promptId);

    const deleteRes = await execCli([
      ...withDataDir(root),
      "prompt",
      "delete",
      promptId,
    ]);
    expect(deleteRes.exitCode).toBe(0);
    expect(deleteRes.json.deleted).toBe(true);

    const missingRes = await execCli([
      ...withDataDir(root),
      "prompt",
      "get",
      promptId,
    ]);
    expect(missingRes.exitCode).toBe(3);
    expect(missingRes.errorJson.error.code).toBe("NOT_FOUND");
  });

  it("renders empty table output for prompt list", async () => {
    const root = makeTempRoot(tempDirs);

    const result = await execCli([
      ...withDataDir(root),
      "-o",
      "table",
      "prompt",
      "list",
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.joinedStdout).toContain("(empty)");
  });

  it("installs a local skill from JSON", async () => {
    const root = makeTempRoot(tempDirs);
    const skillJsonPath = path.join(root, "skill.json");
    fs.writeFileSync(
      skillJsonPath,
      JSON.stringify(
        {
          name: "json-skill",
          description: "Imported from json",
          version: "1.2.3",
          author: "CLI Test",
          instructions: "# JSON Skill",
          tags: ["json"],
        },
        null,
        2,
      ),
      "utf8",
    );

    const stdout: string[] = [];
    const stderr: string[] = [];
    const exitCode = await runCli([...withDataDir(root), "skill", "install", skillJsonPath], {
      stdout: (message: string) => stdout.push(message),
      stderr: (message: string) => stderr.push(message),
    });

    expect(exitCode).toBe(0);
    expect(stderr).toEqual([]);
    expect(JSON.parse(stdout.join("\n")).name).toBe("json-skill");
  });

  it("scans a custom local skill directory", async () => {
    const root = makeTempRoot(tempDirs);
    const scanRoot = path.join(root, "scan-root");
    const skillDir = path.join(scanRoot, "writer-skill");
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(
      path.join(skillDir, "SKILL.md"),
      [
        "---",
        "name: writer-skill",
        "description: Skill scan target",
        "version: 1.0.0",
        "author: CLI Scan",
        "tags: [scan, test]",
        "---",
        "",
        "# Writer Skill",
      ].join("\n"),
      "utf8",
    );

    const result = await execCli([
      ...withDataDir(root),
      "skill",
      "scan",
      scanRoot,
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.json).toHaveLength(1);
    expect(result.json[0]).toMatchObject({
      name: "writer-skill",
      localPath: skillDir,
    });
  });

  it("installs a remote https skill with injected fetch", async () => {
    const root = makeTempRoot(tempDirs);
    const stdout: string[] = [];
    const stderr: string[] = [];
    const fetchImpl = vi.fn(async () =>
      new Response(
        [
          "---",
          "name: remote-skill",
          "description: Remote install",
          "version: 0.9.0",
          "author: Remote",
          "---",
          "",
          "# Remote Skill",
        ].join("\n"),
        { status: 200 },
      ),
    );

    const exitCode = await runCli(
      [...withDataDir(root), "skill", "install", "https://example.com/skill.md"],
      {
        stdout: (message: string) => stdout.push(message),
        stderr: (message: string) => stderr.push(message),
      },
      undefined,
      undefined,
      createCliSkillService({ fetchImpl }),
    );

    expect(exitCode).toBe(0);
    expect(stderr).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledWith("https://example.com/skill.md");
    expect(JSON.parse(stdout.join("\n")).name).toBe("remote-skill");
  });

  it("installs a github skill with injected git clone", async () => {
    const root = makeTempRoot(tempDirs);
    const stdout: string[] = [];
    const stderr: string[] = [];
    const gitCloneImpl = vi.fn(async (_url: string, destinationDir: string) => {
      fs.mkdirSync(destinationDir, { recursive: true });
      fs.writeFileSync(
        path.join(destinationDir, "SKILL.md"),
        [
          "---",
          "name: github-skill",
          "description: Github install",
          "version: 2.0.0",
          "author: Github",
          "---",
          "",
          "# Github Skill",
        ].join("\n"),
        "utf8",
      );
    });

    const exitCode = await runCli(
      [...withDataDir(root), "skill", "install", "https://github.com/acme/github-skill"],
      {
        stdout: (message: string) => stdout.push(message),
        stderr: (message: string) => stderr.push(message),
      },
      undefined,
      undefined,
      createCliSkillService({ gitCloneImpl }),
    );

    expect(exitCode).toBe(0);
    expect(stderr).toEqual([]);
    expect(gitCloneImpl).toHaveBeenCalled();
    expect(JSON.parse(stdout.join("\n")).name).toBe("github-skill");
  });

  it("deletes a skill while keeping platform installs when requested", async () => {
    const root = makeTempRoot(tempDirs);
    const skillDir = path.join(root, "keep-platform-skill");
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(
      path.join(skillDir, "SKILL.md"),
      [
        "---",
        "name: keep-platform-skill",
        "description: Keep platform install flag",
        "version: 1.0.0",
        "author: CLI Test",
        "---",
        "",
        "# Keep Platform Skill",
      ].join("\n"),
      "utf8",
    );

    const installRes = await execCli([
      ...withDataDir(root),
      "skill",
      "install",
      skillDir,
    ]);
    expect(installRes.exitCode).toBe(0);

    const uninstallSkillMd = vi.fn(async () => undefined);
    const skillService = {
      ...createCliSkillService(),
      uninstallSkillMd,
    };

    const deleteRes = await execCli(
      [
        ...withDataDir(root),
        "skill",
        "delete",
        "keep-platform-skill",
        "--keep-platform-installs",
      ],
      skillService,
    );

    expect(deleteRes.exitCode).toBe(0);
    expect(deleteRes.json.platformInstallsKept).toBe(true);
    expect(deleteRes.json.uninstallResults).toEqual([]);
    expect(uninstallSkillMd).not.toHaveBeenCalled();
  });

  it("captures platform uninstall failures during skill delete", async () => {
    const root = makeTempRoot(tempDirs);
    const skillDir = path.join(root, "uninstall-failure-skill");
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(
      path.join(skillDir, "SKILL.md"),
      [
        "---",
        "name: uninstall-failure-skill",
        "description: Delete flow coverage",
        "version: 1.0.0",
        "author: CLI Test",
        "---",
        "",
        "# Uninstall Failure Skill",
      ].join("\n"),
      "utf8",
    );

    const installRes = await execCli([
      ...withDataDir(root),
      "skill",
      "install",
      skillDir,
    ]);
    expect(installRes.exitCode).toBe(0);

    const baseSkillService = createCliSkillService();
    const firstPlatform = baseSkillService.getSupportedPlatforms()[0];
    const skillService = {
      ...baseSkillService,
      uninstallSkillMd: vi.fn(async (_skillName: string, platformId: string) => {
        if (platformId === firstPlatform.id) {
          throw new Error("mock uninstall failure");
        }
      }),
    };

    const deleteRes = await execCli(
      [...withDataDir(root), "skill", "delete", "uninstall-failure-skill"],
      skillService,
    );

    expect(deleteRes.exitCode).toBe(0);
    expect(deleteRes.json.deleted).toBe(true);
    const rejected = deleteRes.json.uninstallResults.find(
      (result: { platform: string; status: string }) =>
        result.platform === firstPlatform.id && result.status === "rejected",
    );
    expect(rejected).toMatchObject({
      platform: firstPlatform.id,
      status: "rejected",
      reason: "mock uninstall failure",
    });
  });
});
