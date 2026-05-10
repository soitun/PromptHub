import type { SyncSettings } from '@prompthub/shared';
import {
  mkcolWebDavDirectory,
  pullWebDavFile,
  pushWebDavFile,
  testWebDavConnection,
} from './webdav.server.js';

export const REMOTE_BACKUP_DIR = 'prompthub-backup';
export const REMOTE_BACKUP_DATA_FILE = 'prompthub-backup/data.json';
export const REMOTE_MANIFEST_FILE = 'prompthub-backup/manifest.json';
export const LEGACY_REMOTE_BACKUP_FILE = 'prompthub-web-backup.json';

export interface WebDavPushResult {
  syncedAt: string;
  remoteFile: string;
}

export interface WebDavPullResult {
  syncedAt: string;
  remoteFile: string;
  body: string;
}

export async function pushWebDavSnapshot(
  settings: SyncSettings & { endpoint: string },
  payload: string,
  exportedAt: string,
): Promise<WebDavPushResult> {
  const connection = await testWebDavConnection(settings);
  if (!connection.ok) {
    throw new Error(`WebDAV connection failed with HTTP ${connection.status}`);
  }

  await mkcolWebDavDirectory(settings, REMOTE_BACKUP_DIR);

  const pushed = await pushWebDavFile(settings, REMOTE_BACKUP_DATA_FILE, payload);
  if (!pushed.ok) {
    throw new Error(`WebDAV upload failed with HTTP ${pushed.status}`);
  }

  const manifest = {
    version: '1',
    createdAt: exportedAt,
    dataHash: '',
    encrypted: false,
    images: {},
    videos: {},
  };
  await pushWebDavFile(settings, REMOTE_MANIFEST_FILE, JSON.stringify(manifest));

  return {
    syncedAt: new Date().toISOString(),
    remoteFile: REMOTE_BACKUP_DATA_FILE,
  };
}

export async function pullWebDavSnapshot(
  settings: SyncSettings & { endpoint: string },
): Promise<WebDavPullResult> {
  let pulled = await pullWebDavFile(settings, REMOTE_BACKUP_DATA_FILE);
  let remoteFile = REMOTE_BACKUP_DATA_FILE;

  if (!pulled.ok) {
    pulled = await pullWebDavFile(settings, LEGACY_REMOTE_BACKUP_FILE);
    remoteFile = LEGACY_REMOTE_BACKUP_FILE;
  }

  if (!pulled.ok) {
    throw new Error(
      `WebDAV download failed: no backup found at ${REMOTE_BACKUP_DATA_FILE} or ${LEGACY_REMOTE_BACKUP_FILE}`,
    );
  }

  return {
    syncedAt: new Date().toISOString(),
    remoteFile,
    body: pulled.body,
  };
}
