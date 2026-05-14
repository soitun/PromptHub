import * as childProcess from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";

import type { SkillDB } from "@prompthub/db";
import {
  SKILL_PLATFORMS,
  type SkillPlatform,
} from "@prompthub/shared/constants/platforms";
import type { ScannedSkill, SkillManifest } from "@prompthub/shared/types";

import { getSkillsDir } from "../runtime-paths";
import { installSkillFromSource } from "../skills/install-flow";

interface ParsedSkillMd {
  frontmatter: {
    name?: string;
    description?: string;
    version?: string;
    author?: string;
    tags?: string[];
  };
}

function resolvePlatformPath(template: string): string {
  const home = os.homedir();
  return template
    .replace(/^~/, home)
    .replace(/%USERPROFILE%/gi, home)
    .replace(/%APPDATA%/gi, path.join(home, "AppData", "Roaming"));
}

function getPlatformSkillsDir(platform: SkillPlatform): string {
  const osKey = process.platform as "darwin" | "win32" | "linux";
  const rootDir = platform.rootDir[osKey] || platform.rootDir.linux;
  return resolvePlatformPath(
    [rootDir, platform.skillsRelativePath].filter(Boolean).join("/"),
  );
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function sanitizeString(
  value: unknown,
  fallback?: string,
  maxLength = 10_000,
): string | undefined {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim().slice(0, maxLength);
  return trimmed || fallback;
}

function sanitizeTags(primary: unknown, fallback: unknown): string[] {
const source = Array.isArray(primary)
    ? primary
    : Array.isArray(fallback)
      ? fallback
      : [];

  return source
    .filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    )
    .map((item) => item.trim().slice(0, 128));
}

function sanitizeStringList(
  value: unknown,
  maxLength = 256,
): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value
    .filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    )
    .map((item) => item.trim().slice(0, maxLength));

  return items.length > 0 ? items : undefined;
}

function sanitizeProtocolType(value: unknown): "skill" | "mcp" | "claude-code" {
  return value === "mcp" || value === "claude-code" ? value : "skill";
}

function validateSkillName(skillName: string): string {
  const normalizedName = skillName.trim();
  if (!normalizedName) {
    throw new Error("Invalid skill name: must not be empty");
  }
  if (normalizedName.includes("\0")) {
    throw new Error("Invalid skill name: must not contain null bytes");
  }
  if (
    normalizedName.includes("..") ||
    normalizedName.includes("/") ||
    normalizedName.includes("\\")
  ) {
    throw new Error(
      `Invalid skill name: must not contain "..", "/" or "\\": ${normalizedName}`,
    );
  }
  if (/^[a-zA-Z]:/.test(normalizedName)) {
    throw new Error(
      `Invalid skill name: must not be an absolute path: ${normalizedName}`,
    );
  }

  return normalizedName;
}

function parseSkillMd(content: string): ParsedSkillMd | null {
  if (!content || typeof content !== "string") {
    return null;
  }

  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!frontmatterMatch) {
    return { frontmatter: {} };
  }

  const frontmatter: ParsedSkillMd["frontmatter"] = {};
  for (const line of frontmatterMatch[1].split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, colonIndex).trim();
    let value = trimmed.slice(colonIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (value.startsWith("[") && value.endsWith("]")) {
      const items = value
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
      if (key === "tags") {
        frontmatter.tags = items;
      }
      continue;
    }

    if (key === "name") frontmatter.name = value;
    if (key === "description") frontmatter.description = value;
    if (key === "version") frontmatter.version = value;
    if (key === "author") frontmatter.author = value;
    if (key === "tags" && !frontmatter.tags) {
      frontmatter.tags = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return { frontmatter };
}

type FetchLike = typeof fetch;

const GIT_CLONE_TIMEOUT_MS = 60_000;

async function fetchRemoteContent(
  sourceUrl: string,
  fetchImpl: FetchLike,
): Promise<string> {
  const parsedUrl = new URL(sourceUrl);
  if (parsedUrl.protocol !== "https:") {
    throw new Error("Only HTTPS skill URLs are supported");
  }

  const response = await fetchImpl(sourceUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch remote skill: ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
}

async function gitClone(url: string, destinationDir: string): Promise<void> {
  if (!url.trim()) {
    throw new Error("Git clone URL cannot be empty");
  }
  if (url.startsWith("-")) {
    throw new Error("Git clone URL cannot start with '-'");
  }

  const parsedUrl = new URL(url);
  if (parsedUrl.protocol !== "https:") {
    throw new Error("Only HTTPS Git clone URLs are allowed");
  }

  await new Promise<void>((resolve, reject) => {
    const processRef = childProcess.spawn(
      "git",
      ["clone", "--depth", "1", "--", url, destinationDir],
      {
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    let stderr = "";
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      processRef.kill("SIGKILL");
      reject(
        new Error(
          `Git clone timed out after ${GIT_CLONE_TIMEOUT_MS / 1000}s for URL: ${url}`,
        ),
      );
    }, GIT_CLONE_TIMEOUT_MS);

    processRef.stderr?.on("data", (data: Buffer | string) => {
      stderr += data.toString();
    });

    processRef.on("close", (code) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Git clone failed with code ${code}: ${stderr}`));
    });

    processRef.on("error", (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      reject(new Error(`Git clone error: ${error.message}`));
    });
  });
}

async function readManifest(skillDir: string): Promise<SkillManifest> {
  const manifestPath = path.join(skillDir, "manifest.json");
  try {
    const content = await fs.readFile(manifestPath, "utf-8");
    const parsed = JSON.parse(content) as Record<string, unknown>;
    return {
      name: sanitizeString(parsed.name),
      description: sanitizeString(parsed.description),
      version: sanitizeString(parsed.version, undefined, 256),
      author: sanitizeString(parsed.author, undefined, 256),
      tags: sanitizeTags(parsed.tags, undefined),
      instructions: sanitizeString(parsed.instructions),
    };
  } catch (error) {
    const errorCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : undefined;
    if (errorCode === "ENOENT") {
      return {};
    }
    throw new Error(
      `Failed to parse manifest.json in ${skillDir}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function saveRepo(skillName: string, sourceDir: string): Promise<string> {
  const managedSkillsDir = getSkillsDir();
  const destinationDir = path.join(managedSkillsDir, validateSkillName(skillName));
  await fs.mkdir(managedSkillsDir, { recursive: true });

  if (await fileExists(destinationDir)) {
    await fs.rm(destinationDir, { recursive: true, force: true });
  }

  await fs.cp(sourceDir, destinationDir, {
    recursive: true,
    filter: async (sourcePath: string) => {
      try {
        const stat = await fs.lstat(sourcePath);
        return !stat.isSymbolicLink();
      } catch {
        return false;
      }
    },
  });

  return destinationDir;
}

async function saveContent(skillName: string, content: string): Promise<string> {
  const managedSkillsDir = getSkillsDir();
  const destinationDir = path.join(managedSkillsDir, validateSkillName(skillName));
  await fs.mkdir(destinationDir, { recursive: true });
  await fs.writeFile(path.join(destinationDir, "SKILL.md"), content, "utf-8");
  return destinationDir;
}

async function installFromSkillContent(
  skillContent: string,
  skillDb: SkillDB,
  options?: {
    name?: string;
    sourceUrl?: string;
    repoSourceDir?: string;
  },
): Promise<string> {
  const parsed = parseSkillMd(skillContent);
  const manifest = options?.repoSourceDir
    ? await readManifest(options.repoSourceDir)
    : {};
  const fallbackName = options?.repoSourceDir
    ? path.basename(options.repoSourceDir)
    : undefined;
  const skillName =
    sanitizeString(options?.name) ||
    sanitizeString(parsed?.frontmatter.name) ||
    sanitizeString(manifest.name) ||
    fallbackName;

  if (!skillName) {
    throw new Error(
      "Skill name is required; pass --name or add SKILL.md frontmatter",
    );
  }

  const normalizedName = validateSkillName(skillName);
  const localRepoPath = options?.repoSourceDir
    ? await saveRepo(normalizedName, options.repoSourceDir)
    : await saveContent(normalizedName, skillContent);

  return skillDb.create({
    name: normalizedName,
    description:
      sanitizeString(
        parsed?.frontmatter.description,
        sanitizeString(
          manifest.description,
          `Installed from ${options?.sourceUrl ?? "local source"}`,
        ),
      ) || `Installed from ${options?.sourceUrl ?? "local source"}`,
    instructions: skillContent,
    content: skillContent,
    protocol_type: "skill",
    version:
      sanitizeString(
        parsed?.frontmatter.version,
        sanitizeString(manifest.version, "1.0.0", 256),
        256,
      ) || "1.0.0",
    author:
      sanitizeString(
        parsed?.frontmatter.author,
        sanitizeString(manifest.author, "Local", 256),
        256,
      ) || "Local",
    tags: [],
    original_tags: sanitizeTags(parsed?.frontmatter.tags, manifest.tags),
    is_favorite: false,
    source_url: options?.sourceUrl,
    local_repo_path: localRepoPath,
  }).id;
}

async function installFromGithub(
  sourceUrl: string,
  skillDb: SkillDB,
  gitCloneImpl: typeof gitClone,
): Promise<string> {
  const matches = sourceUrl.match(
    /^https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/,
  );
  if (!matches) {
    throw new Error(
      "Invalid GitHub URL: must be https://github.com/{owner}/{repo}",
    );
  }

  const owner = matches[1];
  const repoName = matches[2];
  const installDir = path.join(getSkillsDir(), `${owner}-${repoName}`);
  const relative = path.relative(path.resolve(getSkillsDir()), path.resolve(installDir));
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Path traversal detected: installDir is outside skills directory");
  }

  try {
    await fs.access(installDir);
    throw new Error(
      `Skill ${owner}/${repoName} already exists. Please delete it first.`,
    );
  } catch (error) {
    const errorCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : undefined;
    if (errorCode !== "ENOENT") {
      throw error;
    }
  }

  const existingByName = skillDb.getByName(repoName);
  if (existingByName) {
    throw new Error(
      `A skill named "${repoName}" already exists in the library (id: ${existingByName.id}). Delete it first or use a different repository.`,
    );
  }

  try {
    await fs.mkdir(path.dirname(installDir), { recursive: true });
    await gitCloneImpl(sourceUrl, installDir);
    const manifest = await readManifest(installDir);

    if (!manifest.instructions) {
      try {
        manifest.instructions = await fs.readFile(
          path.join(installDir, "SKILL.md"),
          "utf-8",
        );
      } catch {
        // Fall through to README fallback.
      }
    }

    if (!manifest.instructions) {
      try {
        manifest.instructions = await fs.readFile(
          path.join(installDir, "README.md"),
          "utf-8",
        );
      } catch {
        // Leave empty if no markdown entry file exists.
      }
    }

    return skillDb.create({
      name: manifest.name || repoName,
      description: manifest.description || `Installed from ${sourceUrl}`,
      version: manifest.version || "1.0.0",
      author: manifest.author || owner,
      content: manifest.instructions || "",
      instructions: manifest.instructions || "",
      protocol_type: "skill",
      source_url: sourceUrl,
      local_repo_path: installDir,
      is_favorite: false,
      tags: [],
      original_tags: manifest.tags || ["github"],
    }).id;
  } catch (error) {
    await fs.rm(installDir, { recursive: true, force: true }).catch(() => undefined);
    throw error;
  }
}

async function importFromJson(
  jsonContent: string,
  skillDb: SkillDB,
): Promise<string> {
  const parsed = JSON.parse(jsonContent) as Record<string, unknown>;
  const skillName = sanitizeString(parsed.name)?.trim();
  if (!skillName) {
    throw new Error("Invalid skill JSON: missing name");
  }

  return skillDb.create({
    name: skillName,
    description: sanitizeString(parsed.description, undefined, 10_000),
    version: sanitizeString(parsed.version, undefined, 256),
    author: sanitizeString(parsed.author, undefined, 256),
    instructions: sanitizeString(parsed.instructions),
    content: sanitizeString(parsed.instructions),
    protocol_type: sanitizeProtocolType(parsed.protocol_type),
    tags: sanitizeTags(parsed.tags, ["imported"]),
    is_favorite: false,
    icon_url: sanitizeString(parsed.icon_url, undefined, 500_000),
    icon_emoji: sanitizeString(parsed.icon_emoji, undefined, 32),
    icon_background: sanitizeString(parsed.icon_background, undefined, 64),
    prerequisites: sanitizeStringList(parsed.prerequisites),
    compatibility: sanitizeStringList(parsed.compatibility),
    source_url: sanitizeString(parsed.source_url, undefined, 500_000),
  }).id;
}

async function collectSkillDirs(scanPath: string): Promise<string[]> {
  if (!(await fileExists(scanPath))) {
    return [];
  }

  const entries = await fs.readdir(scanPath, { withFileTypes: true });
  const skillDirs: string[] = [];
  const baseDirs = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => path.join(scanPath, entry.name));

  for (const baseDir of baseDirs) {
    if (await fileExists(path.join(baseDir, "SKILL.md"))) {
      skillDirs.push(baseDir);
      continue;
    }

    try {
      const nestedEntries = await fs.readdir(baseDir, { withFileTypes: true });
      for (const nestedEntry of nestedEntries) {
        if (!nestedEntry.isDirectory() || nestedEntry.name.startsWith(".")) {
          continue;
        }

        const nestedDir = path.join(baseDir, nestedEntry.name);
        if (await fileExists(path.join(nestedDir, "SKILL.md"))) {
          skillDirs.push(nestedDir);
        }
      }
    } catch {
      // Ignore unreadable nested directories during scan preview.
    }
  }

  return skillDirs;
}

function markNameConflicts(results: ScannedSkill[], skillDb?: SkillDB): void {
  const counts = new Map<string, number>();
  for (const result of results) {
    const key = result.name.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  for (const result of results) {
    if ((counts.get(result.name.toLowerCase()) ?? 0) > 1) {
      result.nameConflict = true;
      continue;
    }

    if (skillDb?.getByName(result.name)) {
      result.nameConflict = true;
    }
  }
}

export interface CliSkillService {
  deleteRepoByPath(absolutePath: string): Promise<void>;
  getSupportedPlatforms(): SkillPlatform[];
  installFromSource(
    source: string,
    skillDb: SkillDB,
    options?: { name?: string },
  ): Promise<string>;
  isManagedRepoPath(absolutePath: string): Promise<boolean>;
  scanLocalPreview(customPaths?: string[], skillDb?: SkillDB): Promise<ScannedSkill[]>;
  uninstallSkillMd(skillName: string, platformId: string): Promise<void>;
}

export interface CliSkillServiceDeps {
  fetchImpl?: FetchLike;
  gitCloneImpl?: typeof gitClone;
}

export function createCliSkillService(
  deps: CliSkillServiceDeps = {},
): CliSkillService {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const gitCloneImpl = deps.gitCloneImpl ?? gitClone;

  return {
  async deleteRepoByPath(absolutePath: string): Promise<void> {
    await fs.rm(path.resolve(absolutePath), { recursive: true, force: true });
  },

  getSupportedPlatforms(): SkillPlatform[] {
    return SKILL_PLATFORMS;
  },

  async installFromSource(
    source: string,
    skillDb: SkillDB,
    options?: { name?: string },
  ): Promise<string> {
    return installSkillFromSource(
      source,
      skillDb,
      {
        fetchRemoteContent: (sourceUrl) => fetchRemoteContent(sourceUrl, fetchImpl),
        importFromJson,
        installFromGithub: (sourceUrl, targetSkillDb) =>
          installFromGithub(sourceUrl, targetSkillDb, gitCloneImpl),
        installFromSkillContent,
      },
      options,
    );
  },

  async isManagedRepoPath(absolutePath: string): Promise<boolean> {
    const managedSkillsDir = path.resolve(getSkillsDir());
    const targetPath = path.resolve(absolutePath);
    const relative = path.relative(managedSkillsDir, targetPath);
    return !relative.startsWith("..") && !path.isAbsolute(relative);
  },

  async scanLocalPreview(
    customPaths?: string[],
    skillDb?: SkillDB,
  ): Promise<ScannedSkill[]> {
    const skillMap = new Map<string, ScannedSkill>();
    const scanEntries =
      customPaths && customPaths.length > 0
        ? customPaths
            .map((customPath) => resolvePlatformPath(customPath.trim()))
            .filter(Boolean)
            .map((scanPath) => ({ path: scanPath, platformName: "Custom" }))
        : [
            { path: getSkillsDir(), platformName: "PromptHub" },
            ...SKILL_PLATFORMS.map((platform) => ({
              path: getPlatformSkillsDir(platform),
              platformName: platform.name,
            })),
          ];

    await Promise.all(
      scanEntries.map(async ({ path: scanPath, platformName }) => {
        if (!(await fileExists(scanPath))) {
          return;
        }

        const skillDirs = await collectSkillDirs(scanPath);
        for (const skillFolderPath of skillDirs) {
          const skillMdPath = path.join(skillFolderPath, "SKILL.md");
          try {
            const instructions = await fs.readFile(skillMdPath, "utf-8");
            const manifest = await readManifest(skillFolderPath);
            const parsed = parseSkillMd(instructions);
            const name =
              sanitizeString(parsed?.frontmatter.name) ||
              sanitizeString(manifest.name) ||
              path.basename(skillFolderPath);
            if (!name) {
              continue;
            }

            const existing = skillMap.get(skillFolderPath);
            if (existing) {
              if (!existing.platforms.includes(platformName)) {
                existing.platforms.push(platformName);
              }
              continue;
            }

            skillMap.set(skillFolderPath, {
              name,
              description:
                sanitizeString(
                  parsed?.frontmatter.description,
                  sanitizeString(manifest.description, ""),
                ) || "",
              version: sanitizeString(
                parsed?.frontmatter.version,
                sanitizeString(manifest.version, undefined, 256),
                256,
              ),
              author:
                sanitizeString(
                  parsed?.frontmatter.author,
                  sanitizeString(manifest.author, "Local", 256),
                  256,
                ) || "Local",
              tags: sanitizeTags(parsed?.frontmatter.tags, manifest.tags),
              instructions,
              filePath: skillMdPath,
              localPath: skillFolderPath,
              platforms: [platformName],
            });
          } catch {
            // Ignore malformed skills so scan previews remain resilient.
          }
        }
      }),
    );

    const results = Array.from(skillMap.values());
    markNameConflicts(results, skillDb);
    return results;
  },

  async uninstallSkillMd(skillName: string, platformId: string): Promise<void> {
    const platform = SKILL_PLATFORMS.find((item) => item.id === platformId);
    if (!platform) {
      throw new Error(`Unknown platform: ${platformId}`);
    }

    const skillDir = path.join(
      getPlatformSkillsDir(platform),
      validateSkillName(skillName),
    );
    if (await fileExists(skillDir)) {
      await fs.rm(skillDir, { recursive: true, force: true });
    }
  },
  };
}

export const coreCliSkillService = createCliSkillService();
