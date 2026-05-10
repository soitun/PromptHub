import {
  downloadBackup,
  downloadCompressedBackup,
} from "./database-backup";
import {
  autoSync,
  downloadFromWebDAV,
  testConnection as testWebDAVConnection,
  uploadToWebDAV,
  type SyncResult,
  type WebDAVSyncOptions,
} from "./webdav";
import {
  type ManualBackupStatus,
  recordManualBackup,
} from "./backup-status";
import { createUpgradeBackup } from "./upgrade-backup";
import {
  pullFromSelfHostedWeb,
  pushToSelfHostedWeb,
  testSelfHostedConnection,
  type PullFromSelfHostedOptions,
  type SelfHostedSyncConfig,
  type SelfHostedSyncSummary,
} from "./self-hosted-sync";

export interface FullExportBackupOptions {
  currentVersion?: string;
  compressed: boolean;
  recordManualBackup?: boolean;
}

export interface WebDAVSyncConfig {
  url: string;
  username: string;
  password: string;
}

export interface WebDAVManualSyncOptions {
  config: WebDAVSyncConfig;
  options?: WebDAVSyncOptions;
}

export interface SelfHostedPullOptions {
  config: SelfHostedSyncConfig;
  options?: PullFromSelfHostedOptions;
}

export type AutoSyncReason = "startup" | "startup-resume" | "interval";

export interface SelfHostedAutoSyncResult {
  success: boolean;
  localChanged: boolean;
  message: string;
  summary?: SelfHostedSyncSummary;
}

async function createSnapshotIfPossible(currentVersion?: string): Promise<void> {
  await createUpgradeBackup(
    currentVersion ? { fromVersion: currentVersion } : undefined,
  );
}

async function downloadExportFile(compressed: boolean): Promise<void> {
  if (compressed) {
    await downloadCompressedBackup();
    return;
  }

  await downloadBackup();
}

export async function runFullExportBackup(
  options: FullExportBackupOptions,
): Promise<ManualBackupStatus | null> {
  await createSnapshotIfPossible(options.currentVersion);
  await downloadExportFile(options.compressed);

  if (options.recordManualBackup && options.currentVersion) {
    return recordManualBackup(options.currentVersion);
  }

  return null;
}

export async function runPreUpgradeBackup(
  currentVersion: string,
): Promise<ManualBackupStatus> {
  await createSnapshotIfPossible(currentVersion);
  await downloadCompressedBackup();
  return recordManualBackup(currentVersion);
}

export async function runWebDAVConnectionCheck(
  config: WebDAVSyncConfig,
): Promise<SyncResult> {
  return testWebDAVConnection(config);
}

export async function runWebDAVUpload(
  input: WebDAVManualSyncOptions,
): Promise<SyncResult> {
  return uploadToWebDAV(input.config, input.options);
}

export async function runWebDAVDownload(
  input: WebDAVManualSyncOptions,
): Promise<SyncResult> {
  return downloadFromWebDAV(input.config, input.options);
}

export async function runWebDAVAutoSync(
  input: WebDAVManualSyncOptions,
): Promise<SyncResult> {
  return autoSync(input.config, input.options);
}

export async function runSelfHostedConnectionCheck(
  config: SelfHostedSyncConfig,
): Promise<SelfHostedSyncSummary> {
  return testSelfHostedConnection(config);
}

export async function runSelfHostedPush(
  config: SelfHostedSyncConfig,
): Promise<SelfHostedSyncSummary> {
  return pushToSelfHostedWeb(config);
}

export async function runSelfHostedPull(
  input: SelfHostedPullOptions,
): Promise<SelfHostedSyncSummary> {
  return pullFromSelfHostedWeb(input.config, input.options);
}

export async function runSelfHostedAutoSync(
  reason: AutoSyncReason,
  config: SelfHostedSyncConfig,
): Promise<SelfHostedAutoSyncResult> {
  try {
    const summary =
      reason === "interval"
        ? await pushToSelfHostedWeb(config)
        : await pullFromSelfHostedWeb(config, { mode: "replace" });

    return {
      success: true,
      localChanged: reason !== "interval",
      message:
        reason === "interval"
          ? `self-hosted push synced: ${summary.prompts} prompts, ${summary.folders} folders, ${summary.skills} skills`
          : `self-hosted pull synced: ${summary.prompts} prompts, ${summary.folders} folders, ${summary.skills} skills`,
      summary,
    };
  } catch (error) {
    return {
      success: false,
      localChanged: false,
      message:
        error instanceof Error
          ? error.message
          : "self-hosted auto sync failed",
    };
  }
}
