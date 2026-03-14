import { app } from "electron";
import fs from "fs";
import path from "path";

import type Database from "../database/sqlite";
import { SkillDB } from "../database/skill";
import type { CreateSkillParams } from "../../shared/types";

interface E2ESkillFileSeed {
  relativePath: string;
  content: string;
}

interface E2ESkillSeed {
  name: string;
  description?: string;
  content?: string;
  instructions?: string;
  author?: string;
  tags?: string[];
  localRepoName?: string;
  files?: E2ESkillFileSeed[];
}

interface E2ESeedDocument {
  settings?: Record<string, unknown>;
  skills?: E2ESkillSeed[];
}

export function isE2EEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.PROMPTHUB_E2E === "1";
}

export function shouldUseDevServer(
  appIsPackaged: boolean,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (isE2EEnabled(env)) {
    return false;
  }
  return env.NODE_ENV === "development" || !appIsPackaged;
}

export function configureE2ETestProfile(
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  if (!isE2EEnabled(env)) {
    return null;
  }

  const configuredDir = env.PROMPTHUB_E2E_USER_DATA_DIR;
  if (!configuredDir) {
    return null;
  }

  const resolvedDir = path.resolve(configuredDir);
  fs.mkdirSync(resolvedDir, { recursive: true });
  app.setName("PromptHub E2E");
  app.setPath("userData", resolvedDir);
  return resolvedDir;
}

function readSeedDocument(
  env: NodeJS.ProcessEnv = process.env,
): E2ESeedDocument | null {
  const seedPath = env.PROMPTHUB_E2E_SEED_PATH;
  if (!seedPath) {
    return null;
  }

  const resolvedPath = path.resolve(seedPath);
  const raw = fs.readFileSync(resolvedPath, "utf8");
  return JSON.parse(raw) as E2ESeedDocument;
}

function writeSeedSettings(
  db: Database.Database,
  settings?: Record<string, unknown>,
): void {
  if (!settings || Object.keys(settings).length === 0) {
    return;
  }

  const stmt = db.prepare(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
  );
  const transaction = db.transaction(() => {
    for (const [key, value] of Object.entries(settings)) {
      stmt.run(key, JSON.stringify(value));
    }
  });

  transaction();
}

function resolveSeedFiles(skill: E2ESkillSeed): E2ESkillFileSeed[] {
  if (Array.isArray(skill.files) && skill.files.length > 0) {
    return skill.files;
  }

  const skillMdContent =
    skill.instructions || skill.content || `# ${skill.name}\n\nE2E seeded skill`;

  return [
    {
      relativePath: "SKILL.md",
      content: skillMdContent,
    },
  ];
}

function writeSeedSkillFiles(skill: E2ESkillSeed, repoDir: string): string {
  const files = resolveSeedFiles(skill);

  for (const file of files) {
    const filePath = path.join(repoDir, file.relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, file.content, "utf8");
  }

  const skillMd = files.find(
    (file) => file.relativePath.toLowerCase() === "skill.md",
  );
  return skillMd?.content || files[0]?.content || "";
}

function createSeedSkillInput(skill: E2ESkillSeed, repoDir: string): CreateSkillParams {
  const content = writeSeedSkillFiles(skill, repoDir);

  return {
    name: skill.name,
    description: skill.description || null || undefined,
    instructions: content,
    content,
    protocol_type: "skill",
    author: skill.author || "E2E Seed",
    tags: skill.tags || [],
    is_favorite: false,
    local_repo_path: repoDir,
    versionTrackingEnabled: true,
  };
}

export function applyE2ESeed(
  db: Database.Database,
  env: NodeJS.ProcessEnv = process.env,
): void {
  if (!isE2EEnabled(env)) {
    return;
  }

  const seed = readSeedDocument(env);
  if (!seed) {
    return;
  }

  writeSeedSettings(db, seed.settings);

  if (!seed.skills?.length) {
    return;
  }

  const skillDb = new SkillDB(db);
  const skillsRoot = path.join(app.getPath("userData"), "skills");
  fs.mkdirSync(skillsRoot, { recursive: true });

  for (const skill of seed.skills) {
    const repoDir = path.join(skillsRoot, skill.localRepoName || skill.name);
    fs.mkdirSync(repoDir, { recursive: true });

    skillDb.create(createSeedSkillInput(skill, repoDir), {
      overwriteExisting: true,
      skipInitialVersion: true,
    });
  }
}
