import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import crypto from "crypto";

import { KNOWN_RULE_FILE_TEMPLATES } from "@prompthub/shared/constants/rules";
import { getPlatformById } from "@prompthub/shared/constants/platforms";
import type {
  CreateRuleProjectInput,
  KnownRuleFileId,
  RuleBackupRecord,
  RuleFileContent,
  RuleFileDescriptor,
  RuleFileGroup,
  RuleFileId,
  RuleRecord,
  RuleSyncStatus,
  RuleVersionRecord,
  RuleVersionSnapshot,
} from "@prompthub/shared/types";
import { initDatabase, RuleDB } from "../database";
import { getRulesDir } from "../runtime-paths";
import { getPlatformGlobalRulePath } from "./skill-installer-utils";

const RULE_VERSION_LIMIT = 20;
const RULE_META_FILE_NAME = "_rule.json";

interface StoredRuleMeta {
  id: RuleFileId;
  scope: "global" | "project";
  platformId: RuleFileDescriptor["platformId"];
  platformName: string;
  platformIcon: string;
  platformDescription: string;
  canonicalFileName: string;
  description: string;
  managedPath: string;
  targetPath: string;
  projectRootPath?: string | null;
  syncStatus?: RuleSyncStatus;
  createdAt: string;
  updatedAt: string;
}

interface StoredRuleVersionIndexEntry {
  id: string;
  savedAt: string;
  source: RuleVersionSnapshot["source"];
  fileName: string;
}

function ensureDir(targetPath: string): void {
  fs.mkdirSync(targetPath, { recursive: true });
}

function slugify(input: string | null | undefined): string {
  const normalized = (input ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "rule";
}

function encodeRuleId(ruleId: RuleFileId): string {
  return encodeURIComponent(ruleId);
}

function hashContent(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function getRuleDb(): RuleDB {
  return new RuleDB(initDatabase());
}

function getRuleProjectsRoot(): string {
  return path.join(getRulesDir(), "projects");
}

function getRuleVersionsRoot(): string {
  return path.join(getRulesDir(), ".versions");
}

function getRuleVersionsDir(ruleId: RuleFileId): string {
  return path.join(getRuleVersionsRoot(), encodeRuleId(ruleId));
}

function getRuleVersionIndexPath(ruleId: RuleFileId): string {
  return path.join(getRuleVersionsDir(ruleId), "index.json");
}

function getRuleMetaPath(managedPath: string): string {
  return path.join(path.dirname(managedPath), RULE_META_FILE_NAME);
}

function getManagedPlatformRulePath(ruleId: KnownRuleFileId): string {
  const template = KNOWN_RULE_FILE_TEMPLATES[ruleId];
  const platform = getPlatformById(template.platformId);
  if (!platform) {
    throw new Error(`Unknown rules platform: ${template.platformId}`);
  }
  const rulePath = getPlatformGlobalRulePath(platform);
  if (!rulePath) {
    throw new Error(`Rules file path is not defined for platform: ${template.platformId}`);
  }
  return rulePath;
}

function getManagedCopyPathForGlobal(ruleId: KnownRuleFileId): string {
  const template = KNOWN_RULE_FILE_TEMPLATES[ruleId];
  return path.join(getRulesDir(), "global", template.platformId, template.name);
}

function buildGlobalMeta(ruleId: KnownRuleFileId): StoredRuleMeta {
  const template = KNOWN_RULE_FILE_TEMPLATES[ruleId];
  return {
    id: ruleId,
    scope: "global",
    platformId: template.platformId,
    platformName: template.platformName,
    platformIcon: template.platformIcon,
    platformDescription: template.platformDescription,
    canonicalFileName: template.name,
    description: template.description,
    managedPath: getManagedCopyPathForGlobal(ruleId),
    targetPath: getManagedPlatformRulePath(ruleId),
    syncStatus: "target-missing",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fsp.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fsp.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await fsp.writeFile(filePath, JSON.stringify(value, null, 2), "utf-8");
}

async function readVersionIndex(ruleId: RuleFileId): Promise<StoredRuleVersionIndexEntry[]> {
  return (await readJsonFile<StoredRuleVersionIndexEntry[]>(getRuleVersionIndexPath(ruleId))) ?? [];
}

async function writeVersionIndex(
  ruleId: RuleFileId,
  index: StoredRuleVersionIndexEntry[],
): Promise<void> {
  await writeJsonFile(getRuleVersionIndexPath(ruleId), index);
}

async function readRuleVersions(ruleId: RuleFileId): Promise<RuleVersionSnapshot[]> {
  const index = await readVersionIndex(ruleId);
  const versionDir = getRuleVersionsDir(ruleId);
  const versions = await Promise.all(
    index.map(async (entry) => {
      const content = await fsp.readFile(path.join(versionDir, entry.fileName), "utf-8");
      return {
        id: entry.id,
        savedAt: entry.savedAt,
        source: entry.source,
        content,
      } satisfies RuleVersionSnapshot;
    }),
  );
  return versions;
}

async function appendRuleVersion(
  ruleId: RuleFileId,
  content: string,
  source: RuleVersionSnapshot["source"],
): Promise<RuleVersionSnapshot[]> {
  const current = await readRuleVersions(ruleId);
  if (current[0]?.content === content) {
    return current;
  }

  const versionDir = getRuleVersionsDir(ruleId);
  ensureDir(versionDir);
  const versionNumber = current.length + 1;
  const fileName = `${String(versionNumber).padStart(4, "0")}.md`;
  const nextVersion: RuleVersionSnapshot = {
    id: `${encodeRuleId(ruleId)}-${Date.now()}`,
    savedAt: new Date().toISOString(),
    content,
    source,
  };

  await fsp.writeFile(path.join(versionDir, fileName), content, "utf-8");

  const previousIndex = await readVersionIndex(ruleId);
  const nextIndex: StoredRuleVersionIndexEntry[] = [
    {
      id: nextVersion.id,
      savedAt: nextVersion.savedAt,
      source: nextVersion.source,
      fileName,
    },
    ...previousIndex,
  ].slice(0, RULE_VERSION_LIMIT);

  const staleEntries = previousIndex.slice(RULE_VERSION_LIMIT - 1);
  await writeVersionIndex(ruleId, nextIndex);

  await Promise.all(
    staleEntries.map(async (entry) => {
      try {
        await fsp.rm(path.join(versionDir, entry.fileName), { force: true });
      } catch {
        // ignore stale cleanup failures
      }
    }),
  );

  return readRuleVersions(ruleId);
}

async function writeManagedRule(meta: StoredRuleMeta, content: string): Promise<void> {
  await fsp.mkdir(path.dirname(meta.managedPath), { recursive: true });
  await fsp.writeFile(meta.managedPath, content, "utf-8");
}

async function readStoredMeta(metaPath: string): Promise<StoredRuleMeta | null> {
  return readJsonFile<StoredRuleMeta>(metaPath);
}

async function writeMeta(meta: StoredRuleMeta): Promise<void> {
  await writeJsonFile(getRuleMetaPath(meta.managedPath), meta);
}

async function syncStatusForMeta(meta: StoredRuleMeta): Promise<RuleSyncStatus> {
  if (!(await fileExists(meta.targetPath))) {
    return "target-missing";
  }

  try {
    const [managedContent, targetContent] = await Promise.all([
      fileExists(meta.managedPath) ? fsp.readFile(meta.managedPath, "utf-8") : Promise.resolve(""),
      fsp.readFile(meta.targetPath, "utf-8"),
    ]);
    return hashContent(managedContent) === hashContent(targetContent)
      ? "synced"
      : "out-of-sync";
  } catch {
    return "sync-error";
  }
}

async function buildDescriptor(meta: StoredRuleMeta): Promise<RuleFileDescriptor> {
  const exists = await fileExists(meta.targetPath);
  return {
    id: meta.id,
    platformId: meta.platformId,
    platformName: meta.platformName,
    platformIcon: meta.platformIcon,
    platformDescription: meta.platformDescription,
    name: meta.canonicalFileName,
    description: meta.description,
    path: meta.targetPath,
    targetPath: meta.targetPath,
    managedPath: meta.managedPath,
    projectRootPath: meta.projectRootPath ?? null,
    exists,
    group: meta.scope === "project" ? "workspace" : ruleGroupForKnownId(meta.id),
    syncStatus: await syncStatusForMeta(meta),
  };
}

function toRuleRecord(meta: StoredRuleMeta, currentVersion: number, contentHash: string): RuleRecord {
  return {
    id: meta.id,
    scope: meta.scope,
    platformId: meta.platformId,
    platformName: meta.platformName,
    platformIcon: meta.platformIcon,
    platformDescription: meta.platformDescription,
    canonicalFileName: meta.canonicalFileName,
    description: meta.description,
    managedPath: meta.managedPath,
    targetPath: meta.targetPath,
    projectRootPath: meta.projectRootPath ?? null,
    syncStatus: meta.syncStatus ?? "target-missing",
    currentVersion,
    contentHash,
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
  };
}

function toRuleVersionRecords(
  ruleId: RuleFileId,
  index: StoredRuleVersionIndexEntry[],
): RuleVersionRecord[] {
  return index.map((entry, indexPosition) => ({
    id: entry.id,
    ruleId,
    version: index.length - indexPosition,
    filePath: path.join(getRuleVersionsDir(ruleId), entry.fileName),
    source: entry.source,
    createdAt: entry.savedAt,
  }));
}

async function syncRuleIndex(meta: StoredRuleMeta): Promise<void> {
  const db = getRuleDb();
  const content = (await fileExists(meta.managedPath))
    ? await fsp.readFile(meta.managedPath, "utf-8")
    : "";
  const versionIndex = await readVersionIndex(meta.id);
  db.upsert(toRuleRecord(meta, versionIndex.length, hashContent(content)));
  db.replaceVersions(meta.id, toRuleVersionRecords(meta.id, versionIndex));
}

function ruleGroupForKnownId(ruleId: RuleFileId): RuleFileGroup {
  if (ruleId.startsWith("project:")) {
    return "workspace";
  }
  return KNOWN_RULE_FILE_TEMPLATES[ruleId].group;
}

async function ensureGlobalRuleMaterialized(ruleId: KnownRuleFileId): Promise<StoredRuleMeta> {
  const fallbackMeta = buildGlobalMeta(ruleId);
  const metaPath = getRuleMetaPath(fallbackMeta.managedPath);
  const existingMeta = await readStoredMeta(metaPath);
  const meta = existingMeta ?? fallbackMeta;

  if (!(await fileExists(meta.managedPath))) {
    const targetExists = await fileExists(meta.targetPath);
    if (targetExists) {
      const importedContent = await fsp.readFile(meta.targetPath, "utf-8");
      await writeManagedRule(meta, importedContent);
      await appendRuleVersion(meta.id, importedContent, "create");
    }
  }

  meta.syncStatus = await syncStatusForMeta(meta);
  await writeMeta(meta);
  await syncRuleIndex(meta);
  return meta;
}

async function listProjectMetaPaths(): Promise<string[]> {
  const root = getRuleProjectsRoot();
  if (!(await fileExists(root))) {
    return [];
  }
  const entries = await fsp.readdir(root, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name, RULE_META_FILE_NAME));
}

export async function listRuleDescriptors(): Promise<RuleFileDescriptor[]> {
  const globalDescriptors = await Promise.all(
    (Object.keys(KNOWN_RULE_FILE_TEMPLATES) as KnownRuleFileId[]).map(async (ruleId) =>
      buildDescriptor(await ensureGlobalRuleMaterialized(ruleId)),
    ),
  );

  const projectDescriptors = await Promise.all(
    (await listProjectMetaPaths()).map(async (metaPath) => {
      const meta = await readStoredMeta(metaPath);
      if (!meta) {
        return null;
      }
      return buildDescriptor(meta);
    }),
  );

  return [...globalDescriptors, ...projectDescriptors.filter((item): item is RuleFileDescriptor => item !== null)];
}

export async function getProjectMetaById(ruleId: `project:${string}`): Promise<StoredRuleMeta | null> {
  const metaPaths = await listProjectMetaPaths();
  for (const metaPath of metaPaths) {
    const meta = await readStoredMeta(metaPath);
    if (meta?.id === ruleId) {
      return meta;
    }
  }
  return null;
}

export async function resolveRuleMeta(ruleId: RuleFileId): Promise<StoredRuleMeta> {
  if (ruleId.startsWith("project:")) {
    const projectMeta = await getProjectMetaById(ruleId);
    if (!projectMeta) {
      throw new Error(`Unknown rule file id: ${ruleId}`);
    }
    return projectMeta;
  }
  return ensureGlobalRuleMaterialized(ruleId);
}

export async function readRuleContent(ruleId: RuleFileId): Promise<RuleFileContent> {
  const meta = await resolveRuleMeta(ruleId);
  await syncRuleIndex(meta);
  const descriptor = await buildDescriptor(meta);
  const content = (await fileExists(meta.managedPath))
    ? await fsp.readFile(meta.managedPath, "utf-8")
    : descriptor.exists
      ? await fsp.readFile(meta.targetPath, "utf-8")
      : "";
  const versions = await readRuleVersions(ruleId);

  return {
    ...descriptor,
    content,
    versions,
  };
}

export async function saveRuleContent(
  ruleId: RuleFileId,
  content: string,
): Promise<RuleFileContent> {
  const meta = await resolveRuleMeta(ruleId);
  const existedBefore = await fileExists(meta.managedPath);

  await writeManagedRule(meta, content);

  let syncStatus: RuleSyncStatus = "synced";
  try {
    await fsp.mkdir(path.dirname(meta.targetPath), { recursive: true });
    await fsp.writeFile(meta.targetPath, content, "utf-8");
  } catch {
    syncStatus = "sync-error";
  }

  const versions = await appendRuleVersion(
    ruleId,
    content,
    existedBefore ? "manual-save" : "create",
  );

  const nextMeta: StoredRuleMeta = {
    ...meta,
    syncStatus,
    updatedAt: new Date().toISOString(),
  };
  await writeMeta(nextMeta);
  await syncRuleIndex(nextMeta);

  const descriptor = await buildDescriptor(nextMeta);
  return {
    ...descriptor,
    content,
    versions,
  };
}

export async function createProjectRule(
  input: CreateRuleProjectInput,
): Promise<RuleFileDescriptor> {
  const name = input.name.trim();
  const rootPath = input.rootPath.trim();
  if (!name || !rootPath) {
    throw new Error("Rule project name and rootPath are required");
  }

  const existingProjectMeta = await Promise.all(
    (await listProjectMetaPaths()).map((metaPath) => readStoredMeta(metaPath)),
  );
  const duplicate = existingProjectMeta.find(
    (meta) => meta?.projectRootPath?.toLowerCase() === rootPath.toLowerCase(),
  );
  if (duplicate) {
    throw new Error("Rule project root path already exists");
  }

  const projectId = input.id ?? crypto.randomUUID();
  const ruleId = `project:${projectId}` as RuleFileId;
  const dirName = `${slugify(name)}__${projectId}`;
  const managedPath = path.join(getRuleProjectsRoot(), dirName, "AGENTS.md");
  const targetPath = path.join(rootPath, "AGENTS.md");
  const now = new Date().toISOString();
  const meta: StoredRuleMeta = {
    id: ruleId,
    scope: "project",
    platformId: "workspace",
    platformName: name,
    platformIcon: "FolderRoot",
    platformDescription: `Project rules from ${rootPath}`,
    canonicalFileName: "AGENTS.md",
    description: "Project rule file loaded from a user-managed directory.",
    managedPath,
    targetPath,
    projectRootPath: rootPath,
    syncStatus: "target-missing",
    createdAt: now,
    updatedAt: now,
  };

  const targetExists = await fileExists(targetPath);
  const initialContent = targetExists ? await fsp.readFile(targetPath, "utf-8") : "";
  await writeManagedRule(meta, initialContent);
  if (initialContent.trim()) {
    await appendRuleVersion(ruleId, initialContent, "create");
  }
  await writeMeta(meta);
  await syncRuleIndex(meta);
  return buildDescriptor(meta);
}

export async function removeProjectRule(projectId: string): Promise<void> {
  const meta = await getProjectMetaById(`project:${projectId}` as RuleFileId);
  if (!meta) {
    return;
  }
  await fsp.rm(path.dirname(meta.managedPath), { recursive: true, force: true });
  await fsp.rm(getRuleVersionsDir(meta.id), { recursive: true, force: true });
  getRuleDb().delete(meta.id);
}

export async function exportRuleBackupRecords(): Promise<RuleBackupRecord[]> {
  const descriptors = await listRuleDescriptors();
  return Promise.all(
    descriptors.map(async (descriptor) => {
      const content = await readRuleContent(descriptor.id);
      return {
        id: content.id,
        platformId: content.platformId,
        platformName: content.platformName,
        platformIcon: content.platformIcon,
        platformDescription: content.platformDescription,
        name: content.name,
        description: content.description,
        path: content.path,
        managedPath: content.managedPath,
        targetPath: content.targetPath,
        projectRootPath: content.projectRootPath ?? null,
        syncStatus: content.syncStatus,
        content: content.content,
        versions: content.versions,
      } satisfies RuleBackupRecord;
    }),
  );
}

export async function importRuleBackupRecords(records: RuleBackupRecord[]): Promise<void> {
  for (const record of records) {
    if (record.id.startsWith("project:")) {
      const projectId = record.id.slice("project:".length);
      const existing = await getProjectMetaById(record.id);
      if (!existing) {
        await createProjectRule({
          id: projectId,
          name: record.platformName,
          rootPath: record.projectRootPath ?? path.dirname(record.targetPath ?? record.path),
        });
      }
    }

    const meta = await resolveRuleMeta(record.id);
    await writeManagedRule(meta, record.content);
    await fsp.rm(getRuleVersionsDir(record.id), { recursive: true, force: true });
    const versionDir = getRuleVersionsDir(record.id);
    ensureDir(versionDir);

    const index: StoredRuleVersionIndexEntry[] = [];
    const orderedVersions = [...record.versions]
      .sort((left, right) => new Date(left.savedAt).getTime() - new Date(right.savedAt).getTime())
      .slice(-RULE_VERSION_LIMIT);

    for (const [indexPosition, version] of orderedVersions.entries()) {
      const fileName = `${String(indexPosition + 1).padStart(4, "0")}.md`;
      await fsp.writeFile(path.join(versionDir, fileName), version.content, "utf-8");
      index.unshift({
        id: version.id,
        savedAt: version.savedAt,
        source: version.source,
        fileName,
      });
    }

    await writeVersionIndex(record.id, index);
    const nextMeta: StoredRuleMeta = {
      ...meta,
      syncStatus: record.syncStatus ?? (await syncStatusForMeta(meta)),
      updatedAt: new Date().toISOString(),
    };
    await writeMeta(nextMeta);
    await syncRuleIndex(nextMeta);
  }
}
