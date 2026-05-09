/**
 * Settings type definitions
 * 设置类型定义
 */

import type { SkillProject } from './skill';

export interface Settings {
  theme: Theme;
  language: Language;
  autoSave: boolean;
  defaultFolderId?: string;
  backgroundImageFileName?: string;
  backgroundImageOpacity?: number;
  backgroundImageBlur?: number;
  customPlatformRootPaths?: Record<string, string>;
  customSkillPlatformPaths?: Record<string, string>;
  skillPlatformOrder?: string[];
  skillProjects?: SkillProject[];
  lastManualBackupAt?: string;
  lastManualBackupVersion?: string;
  sync?: SyncSettings;
  device?: DeviceManagementSettings;
  updateChannel?: UpdateChannel;
  // Security
  // 安全相关
  security?: {
    masterPasswordConfigured: boolean;
    unlocked: boolean;
  };
}

export interface SyncSettings {
  enabled: boolean;
  provider: 'manual' | 'webdav';
  endpoint?: string;
  username?: string;
  password?: string;
  remotePath?: string;
  autoSync?: boolean;
  lastSyncAt?: string;
}

export interface DeviceManagementSettings {
  syncCadence?: 'manual' | '15m' | '1h' | '1d';
  storeAutoSync?: boolean;
  storeSyncCadence?: 'manual' | '1h' | '1d';
}

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'zh' | 'zh-TW' | 'ja' | 'fr' | 'de' | 'es';
export type UpdateChannel = 'stable' | 'preview';

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  language: 'zh',
  autoSave: true,
  backgroundImageOpacity: 0.22,
  backgroundImageBlur: 14,
  customPlatformRootPaths: {},
  customSkillPlatformPaths: {},
  skillPlatformOrder: [],
  skillProjects: [],
  sync: {
    enabled: false,
    provider: 'manual',
    autoSync: false,
  },
  device: {
    syncCadence: 'manual',
    storeAutoSync: true,
    storeSyncCadence: '1d',
  },
  updateChannel: 'stable',
};
