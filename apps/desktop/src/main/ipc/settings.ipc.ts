import { ipcMain } from 'electron';
import Database from '../database/sqlite';
import { IPC_CHANNELS } from '@prompthub/shared/constants';
import {
  getPlatformById,
  normalizeLegacySkillPathToRootTemplate,
} from '@prompthub/shared/constants/platforms';
import type { Settings } from '@prompthub/shared/types';
import { DEFAULT_SETTINGS } from '@prompthub/shared/types';

/**
 * Get minimizeOnLaunch setting from database
 * 从数据库读取启动时最小化设置
 * @param db Database instance
 * @returns boolean - whether to minimize on launch
 */
export function getMinimizeOnLaunchSetting(db: Database.Database): boolean {
  try {
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const row = stmt.get('minimizeOnLaunch') as { value: string } | undefined;
    if (row) {
      return JSON.parse(row.value) === true;
    }
  } catch (e) {
    console.error('Failed to read minimizeOnLaunch setting:', e);
  }
  return false; // Default to false
}

/**
 * Read the user's configured GitHub personal access token from the settings
 * database. The token is used to authenticate GitHub API calls made from the
 * skill store (e.g. listing repository trees) so users can raise the API
 * rate limit from the unauthenticated 60 req/h to the authenticated limit.
 *
 * Returns the trimmed token, or `null` if no valid token is configured.
 * This function never throws — callers should treat a missing token as a
 * normal "unauthenticated" scenario.
 *
 * Security: only callers whose target host is a trusted GitHub endpoint
 * (api.github.com, raw.githubusercontent.com) should attach the token.
 * 从 settings 表读取用户配置的 GitHub PAT，用于给 Skill Store 的 GitHub API
 * 请求加鉴权头，避免未登录状态下触发 60 次/小时的限额 (#108)。
 */
export function getGithubTokenSetting(db: Database.Database): string | null {
  try {
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const row = stmt.get('githubToken') as { value: string } | undefined;
    if (!row) {
      return null;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(row.value);
    } catch {
      // Tolerate a legacy plain-string row, but only if it looks like a
      // printable token — we never want to attach raw garbage to a header.
      parsed = row.value;
    }
    if (typeof parsed !== 'string') {
      return null;
    }
    // Reject anything containing CR/LF or other control bytes BEFORE
    // trimming — `trim()` would silently drop trailing \n and hide an
    // attempted header injection from the validator.
    // 必须在 trim 之前校验：trim() 会把末尾的 \n 吃掉，导致 header 注入的
    // 探测被静默放行。
    if (/[\r\n\x00-\x1f\x7f]/.test(parsed)) {
      return null;
    }
    const trimmed = parsed.trim();
    if (trimmed.length === 0) {
      return null;
    }
    return trimmed;
  } catch (e) {
    // Never log the token content, only the error class.
    console.error(
      'Failed to read githubToken setting:',
      e instanceof Error ? e.message : 'unknown',
    );
    return null;
  }
}

/**
 * Register settings-related IPC handlers
 * 注册设置相关 IPC 处理器
 */
export function registerSettingsIPC(db: Database.Database): void {
  // Get settings
  // 获取设置
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => {
    const settings: Settings = { ...DEFAULT_SETTINGS };

    const stmt = db.prepare('SELECT key, value FROM settings');
    const rows = stmt.all() as { key: string; value: string }[];

    for (const row of rows) {
      try {
        (settings as any)[row.key] = JSON.parse(row.value);
      } catch {
        (settings as any)[row.key] = row.value;
      }
    }

    if (
      (!settings.customPlatformRootPaths ||
        Object.keys(settings.customPlatformRootPaths).length === 0) &&
      settings.customSkillPlatformPaths &&
      Object.keys(settings.customSkillPlatformPaths).length > 0
    ) {
      settings.customPlatformRootPaths = Object.fromEntries(
        Object.entries(settings.customSkillPlatformPaths).map(
          ([platformId, skillPath]) => {
            const platform = getPlatformById(platformId);
            if (!platform) {
              return [platformId, skillPath];
            }
            return [
              platformId,
              normalizeLegacySkillPathToRootTemplate(platform, skillPath),
            ];
          },
        ),
      );
    }

    return settings;
  });

  // Save settings
  // 保存设置
  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, async (_event, newSettings: Partial<Settings>) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
    `);

    const transaction = db.transaction(() => {
      for (const [key, value] of Object.entries(newSettings)) {
        stmt.run(key, JSON.stringify(value));
      }
    });

    transaction();
    return true;
  });
}
