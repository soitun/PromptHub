import type {
  RuleFileContent,
  RuleFileId,
  RuleVersionSnapshot,
} from '@prompthub/shared';
import {
  exportRuleBackupRecords,
  importRuleBackupRecords,
  readRuleVersions as readWorkspaceRuleVersions,
  removeRuleVersion as removeWorkspaceRuleVersion,
  saveRuleContent as saveWorkspaceRuleContent,
} from './rule-workspace-adapter.js';

export function readRuleContent(userId: string, ruleId: RuleFileId): RuleFileContent | null {
  const record = exportRuleBackupRecords(userId).find((item) => item.id === ruleId);
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    platformId: record.platformId,
    platformName: record.platformName,
    platformIcon: record.platformIcon,
    platformDescription: record.platformDescription,
    name: record.name,
    description: record.description,
    path: record.targetPath || record.path,
    exists: true,
    group: record.id.startsWith('project:') ? 'workspace' : 'assistant',
    managedPath: record.managedPath,
    targetPath: record.targetPath,
    projectRootPath: record.projectRootPath ?? null,
    syncStatus: record.syncStatus,
    content: record.content,
    versions: record.versions,
  };
}

export function saveRuleContent(
  userId: string,
  ruleId: RuleFileId,
  content: string,
): RuleFileContent {
  return saveWorkspaceRuleContent(userId, ruleId, content);
}

export function readRuleVersions(userId: string, ruleId: RuleFileId): RuleVersionSnapshot[] {
  return readWorkspaceRuleVersions(userId, ruleId);
}

export function removeRuleVersion(
  userId: string,
  ruleId: RuleFileId,
  versionId: string,
): RuleVersionSnapshot[] {
  return removeWorkspaceRuleVersion(userId, ruleId, versionId);
}

export { exportRuleBackupRecords, importRuleBackupRecords };
