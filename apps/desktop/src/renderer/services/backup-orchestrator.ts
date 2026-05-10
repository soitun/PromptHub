import {
  downloadBackup,
  downloadCompressedBackup,
} from "./database-backup";
import {
  type ManualBackupStatus,
  recordManualBackup,
} from "./backup-status";
import { createUpgradeBackup } from "./upgrade-backup";

export interface FullExportBackupOptions {
  currentVersion?: string;
  compressed: boolean;
  recordManualBackup?: boolean;
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
