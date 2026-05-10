import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./webdav.server.js', () => ({
  mkcolWebDavDirectory: vi.fn(),
  pullWebDavFile: vi.fn(),
  pushWebDavFile: vi.fn(),
  testWebDavConnection: vi.fn(),
}));

import {
  LEGACY_REMOTE_BACKUP_FILE,
  REMOTE_BACKUP_DATA_FILE,
  REMOTE_MANIFEST_FILE,
  pullWebDavSnapshot,
  pushWebDavSnapshot,
} from './sync-orchestrator.js';

import {
  mkcolWebDavDirectory,
  pullWebDavFile,
  pushWebDavFile,
  testWebDavConnection,
} from './webdav.server.js';

describe('sync-orchestrator', () => {
  const config = {
    enabled: true,
    provider: 'webdav' as const,
    endpoint: 'https://dav.example.com/backup',
    username: 'alice',
    password: 'secret',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pushes snapshot and manifest to WebDAV', async () => {
    vi.mocked(testWebDavConnection).mockResolvedValue({ ok: true, status: 207 });
    vi.mocked(mkcolWebDavDirectory).mockResolvedValue(true);
    vi.mocked(pushWebDavFile).mockResolvedValue({ ok: true, status: 201 });

    const result = await pushWebDavSnapshot(config, '{"k":"v"}', '2026-05-10T00:00:00.000Z');

    expect(testWebDavConnection).toHaveBeenCalledWith(config);
    expect(mkcolWebDavDirectory).toHaveBeenCalledWith(config, 'prompthub-backup');
    expect(pushWebDavFile).toHaveBeenCalledWith(config, REMOTE_BACKUP_DATA_FILE, '{"k":"v"}');
    expect(pushWebDavFile).toHaveBeenCalledWith(
      config,
      REMOTE_MANIFEST_FILE,
      expect.stringContaining('"createdAt":"2026-05-10T00:00:00.000Z"'),
    );
    expect(result.remoteFile).toBe(REMOTE_BACKUP_DATA_FILE);
  });

  it('throws when connection check fails', async () => {
    vi.mocked(testWebDavConnection).mockResolvedValue({ ok: false, status: 401 });

    await expect(
      pushWebDavSnapshot(config, '{}', '2026-05-10T00:00:00.000Z'),
    ).rejects.toThrow('WebDAV connection failed with HTTP 401');
  });

  it('pulls from primary file first', async () => {
    vi.mocked(pullWebDavFile).mockResolvedValue({
      ok: true,
      status: 200,
      body: '{"version":"web-backup-v2"}',
    });

    const result = await pullWebDavSnapshot(config);

    expect(pullWebDavFile).toHaveBeenCalledWith(config, REMOTE_BACKUP_DATA_FILE);
    expect(result.remoteFile).toBe(REMOTE_BACKUP_DATA_FILE);
    expect(result.body).toContain('web-backup-v2');
  });

  it('falls back to legacy file when primary is missing', async () => {
    vi.mocked(pullWebDavFile)
      .mockResolvedValueOnce({ ok: false, status: 404, body: '' })
      .mockResolvedValueOnce({ ok: true, status: 200, body: '{"legacy":true}' });

    const result = await pullWebDavSnapshot(config);

    expect(pullWebDavFile).toHaveBeenNthCalledWith(1, config, REMOTE_BACKUP_DATA_FILE);
    expect(pullWebDavFile).toHaveBeenNthCalledWith(2, config, LEGACY_REMOTE_BACKUP_FILE);
    expect(result.remoteFile).toBe(LEGACY_REMOTE_BACKUP_FILE);
  });
});
