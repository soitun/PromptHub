import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n, { changeLanguage } from "../i18n";
import type { Settings, SkillProject } from "@prompthub/shared/types";
import type { UpdateChannel } from "@prompthub/shared/types";
import type { AIProtocol } from "@prompthub/shared/types";
import { isPrereleaseVersion } from "../../utils/version";
import { resolveLocalImageSrc } from "../utils/media-url";

const SUPPORTED_LANGUAGES = [
  "zh",
  "zh-TW",
  "en",
  "ja",
  "es",
  "de",
  "fr",
] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const normalizeLanguage = (lang: string): SupportedLanguage => {
  if (SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
    return lang as SupportedLanguage;
  }
  const lower = (lang || "").toLowerCase();
  if (lower === "zh-tw" || lower === "zh-hant") return "zh-TW";
  if (lower.startsWith("zh")) return "zh";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("es")) return "es";
  if (lower.startsWith("de")) return "de";
  if (lower.startsWith("fr")) return "fr";
  return "en";
};

// Theme colors - Morandi color palette + classic royal blue
// 主题色 - 莫兰迪色系 + 经典宝蓝
export const MORANDI_THEMES = [
  { id: "royal-blue", hue: 220, saturation: 70, name: "Royal Blue" },
  { id: "blue", hue: 210, saturation: 35, name: "Misty Blue" },
  { id: "purple", hue: 260, saturation: 30, name: "Smoky Purple" },
  { id: "green", hue: 150, saturation: 30, name: "Bean Green" },
  { id: "orange", hue: 25, saturation: 40, name: "Apricot Orange" },
  { id: "teal", hue: 175, saturation: 30, name: "Teal Blue" },
];

export const FONT_SIZES = [
  { id: "small", value: 14, name: "Small" },
  { id: "medium", value: 16, name: "Medium" },
  { id: "large", value: 18, name: "Large" },
];

const DEFAULT_TAGS_SECTION_HEIGHT = 140;
const DEFAULT_BACKGROUND_IMAGE_OPACITY = 1;
const DEFAULT_BACKGROUND_IMAGE_BLUR = 0;
const LEGACY_BACKGROUND_IMAGE_BLUR_DEFAULT = 14;
const LOCAL_IMAGE_PROTOCOL_PREFIX = "local-image://";
const createProjectRecordId = (): string =>
  `project_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const normalizeProjectRecordPath = (value: string): string => value.trim();

function inferAIProtocol(provider: string | undefined, apiUrl: string | undefined): AIProtocol {
  const providerLower = (provider || "").trim().toLowerCase();
  const normalizedUrl = (apiUrl || "").trim().toLowerCase();

  if (providerLower === "anthropic" || normalizedUrl.includes("api.anthropic.com")) {
    return "anthropic";
  }

  if (
    providerLower === "google" ||
    providerLower === "gemini" ||
    normalizedUrl.includes("generativelanguage.googleapis.com")
  ) {
    return "gemini";
  }

  return "openai";
}

function normalizeAIProtocol(value: unknown, provider?: string, apiUrl?: string): AIProtocol {
  if (value === "openai" || value === "gemini" || value === "anthropic") {
    return value;
  }
  return inferAIProtocol(provider, apiUrl);
}

type Hs = { hue: number; saturation: number };

const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n));

function clampBackgroundImageOpacity(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_BACKGROUND_IMAGE_OPACITY;
  }
  return clamp(Number(value), 0, 1);
}

function clampBackgroundImageBlur(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_BACKGROUND_IMAGE_BLUR;
  }
  return Number(clamp(Number(value), 0, 50).toFixed(1));
}

function normalizeBackgroundImageFileName(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const fileName = trimmed.startsWith(LOCAL_IMAGE_PROTOCOL_PREFIX)
    ? trimmed.slice(LOCAL_IMAGE_PROTOCOL_PREFIX.length)
    : trimmed;

  if (
    !fileName ||
    /^(https?:|data:|blob:)/i.test(fileName) ||
    fileName.includes("..") ||
    /[\0/\\?#]/.test(fileName)
  ) {
    return undefined;
  }

  return fileName;
}

function normalizeBackgroundImageBlur(value: number, persistedVersion?: number): number {
  const normalized = clampBackgroundImageBlur(value);

  // Migrate older installs that are still using the old heavy default blur.
  if ((persistedVersion ?? 0) < 6 && normalized === LEGACY_BACKGROUND_IMAGE_BLUR_DEFAULT) {
    return DEFAULT_BACKGROUND_IMAGE_BLUR;
  }

  return normalized;
}

export function getRenderedBackgroundImageOpacity(value: number): number {
  return clamp(value, 0, 1);
}

export function getRenderedBackgroundImageBlur(value: number): number {
  return clampBackgroundImageBlur(value);
}

function applyBackgroundImageVars(options: {
  backgroundImageFileName?: string;
  backgroundImageOpacity?: number;
  backgroundImageBlur?: number;
}): void {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const fileName = normalizeBackgroundImageFileName(
    options.backgroundImageFileName,
  );
  const resolvedSrc = fileName ? resolveLocalImageSrc(fileName) : "";

  root.style.setProperty(
    "--app-background-image",
    resolvedSrc ? `url(\"${resolvedSrc.replace(/\"/g, '\\\"')}\")` : "none",
  );
  root.style.setProperty(
    "--app-background-opacity",
    String(
      clampBackgroundImageOpacity(
        options.backgroundImageOpacity ?? DEFAULT_BACKGROUND_IMAGE_OPACITY,
      ),
    ),
  );
  root.style.setProperty(
    "--app-background-blur",
    `${clampBackgroundImageBlur(
      options.backgroundImageBlur ?? DEFAULT_BACKGROUND_IMAGE_BLUR,
    )}px`,
  );
}

/**
 * Convert HEX color to HSL hue/saturation (lightness is defined by CSS variables)
 * 将 HEX 颜色转换为 HSL 的 hue/saturation（lightness 由 CSS 变量定义）
 * - Only used for theme colors:最终写入 --theme-hue / --theme-saturation
 * - 仅用于主题色：最终写入 --theme-hue / --theme-saturation
 */
const hexToHs = (hex: string): Hs => {
  const normalized = (hex || "").trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    hue: clamp(h, 0, 360),
    saturation: clamp(Math.round(s * 100), 0, 100),
  };
};

// Theme mode
// 主题模式
export type ThemeMode = "light" | "dark" | "system";

// AI model type
// AI 模型类型
export type AIModelType = "chat" | "image";

// 对话模型参数配置
// Chat model parameters configuration
export interface ChatModelParams {
  temperature?: number; // 温度 (0-2)，控制随机性 / Temperature, controls randomness
  maxTokens?: number; // 最大输出 token 数 / Max output tokens
  topP?: number; // Top-P 采样 (0-1) / Top-P sampling
  topK?: number; // Top-K 采样 / Top-K sampling
  frequencyPenalty?: number; // 频率惩罚 (-2 to 2) / Frequency penalty
  presencePenalty?: number; // 存在惩罚 (-2 to 2) / Presence penalty
  stream?: boolean; // 是否启用流式输出 / Enable streaming output
  enableThinking?: boolean; // 是否启用思考模式（思考模型专用）/ Enable thinking mode
  customParams?: Record<string, string | number | boolean>; // 自定义参数 / Custom parameters
}

// 图像模型参数配置
// Image model parameters configuration
export interface ImageModelParams {
  size?: string; // 图像尺寸，如 1024x1024 / Image size
  quality?: "standard" | "hd"; // 图像质量 / Image quality
  style?: "vivid" | "natural"; // 图像风格 / Image style
  n?: number; // 生成数量 / Number of images to generate
}

// AI model configuration type
// AI 模型配置类型
export interface AIModelConfig {
  id: string;
  type: AIModelType; // Model type: chat model or image generation model
  // 模型类型：对话模型或生图模型
  name?: string; // Custom name (optional), used for display
  // 自定义名称（可选），用于显示
  provider: string; // 供应商 ID
  apiProtocol: AIProtocol;
  apiKey: string;
  apiUrl: string;
  model: string; // Model name, such as gpt-4o, dall-e-3
  // 模型名称，如 gpt-4o, dall-e-3
  isDefault?: boolean;
  // Custom parameters
  // 自定义参数
  chatParams?: ChatModelParams;
  imageParams?: ImageModelParams;
}

export type CreationMode = "manual" | "quick";
export type TranslationMode = "immersive" | "full";
export type AIUsageScenario =
  | "quickAdd"
  | "promptTest"
  | "imageTest"
  | "translation";

export type ScenarioModelDefaults = Partial<Record<AIUsageScenario, string>>;

interface SettingsState {
  creationMode: CreationMode;
  // Clipboard auto-import
  // 剪切板自动导入
  clipboardImportEnabled: boolean;

  // Display settings
  // 显示设置
  themeMode: ThemeMode;
  isDarkMode: boolean;
  themeColor: string;
  themeHue: number;
  themeSaturation: number;
  customThemeHex: string; // Custom theme color (HEX)
  // 自定义主题色（HEX）
  settingsUpdatedAt: string; // Settings last update time (used for WebDAV/backup consistency check)
  // 设置最后更新时间（用于 WebDAV/备份一致性判断）
  fontSize: string;
  backgroundImageFileName?: string;
  backgroundImageOpacity: number;
  backgroundImageBlur: number;
  renderMarkdown: boolean; // Default use Markdown rendering in detail page
  // 详情页默认使用 Markdown 渲染
  editorMarkdownPreview: boolean; // Editor default enable preview
  // 编辑器默认开启预览

  // General settings
  // 常规设置
  autoSave: boolean;
  showLineNumbers: boolean;
  launchAtStartup: boolean;
  minimizeOnLaunch: boolean;
  debugMode: boolean;

  // 关闭行为设置 (Windows) / Close behavior settings (Windows)
  closeAction: "ask" | "minimize" | "exit"; // ask=prompt every time, minimize=minimize to tray, exit=exit directly
  // ask=每次询问, minimize=最小化到托盘, exit=直接退出

  // 快捷键模式配置 / Shortcut modes configuration
  // key: shortcut action id, value: 'global' | 'local'
  shortcutModes: Record<string, "global" | "local">;
  // 全局/局部快捷键模式，默认 showApp 为 global，其他 recommended 为 local

  // Notification settings
  // 通知设置
  enableNotifications: boolean;
  showCopyNotification: boolean;
  showSaveNotification: boolean;

  // 语言设置 / Language settings
  language: SupportedLanguage; // zh, zh-TW, en, ja, es, de, fr

  // Data path
  // 数据路径
  dataPath: string;

  // WebDAV sync settings
  // SECURITY NOTE: webdavPassword is stored in localStorage (plaintext).
  // In Electron, localStorage is sandboxed to the app data directory and not
  // accessible to other apps, but it is readable on disk. Consider migrating
  // sensitive fields (webdavPassword, webdavEncryptionPassword, aiApiKey) to
  // the main process using Electron's safeStorage API for at-rest encryption.
  webdavEnabled: boolean;
  webdavUrl: string;
  webdavUsername: string;
  webdavPassword: string;
  webdavAutoSync: boolean; // Legacy compatibility, equivalent to webdavSyncOnStartup
  // 旧版兼容，等同于 webdavSyncOnStartup
  webdavSyncOnStartup: boolean; // Auto sync once after startup
  // 启动后自动同步一次
  webdavSyncOnStartupDelay: number; // Delay seconds after startup (0-60)
  // 启动后延迟秒数（0-60）
  webdavAutoSyncInterval: number; // Auto sync interval (minutes, 0=disabled)
  // 自动同步间隔（分钟，0=关闭）
  webdavSyncOnSave: boolean; // Sync on save (experimental)
  // 保存时同步（实验性）
  webdavIncludeImages: boolean; // Whether to include images
  // 是否包含图片
  webdavIncrementalSync: boolean; // Whether to use incremental sync
  // 是否使用增量同步
  webdavEncryptionEnabled: boolean; // Whether to enable encryption (experimental)
  // 是否启用加密（实验性）
  webdavEncryptionPassword: string; // Encryption password
  // 加密密码
  selfHostedSyncEnabled: boolean;
  selfHostedSyncUrl: string;
  selfHostedSyncUsername: string;
  selfHostedSyncPassword: string;
  selfHostedSyncOnStartup: boolean;
  selfHostedSyncOnStartupDelay: number;
  selfHostedAutoSyncInterval: number;

  // Update settings
  // 更新设置
  autoCheckUpdate: boolean;
  useUpdateMirror: boolean; // Use GitHub accelerator mirror (e.g. ghfast.top)
  // 使用 GitHub 加速镜像（如 ghfast.top）
  updateChannel: UpdateChannel;
  updateChannelExplicitlySet: boolean;

  // Sidebar settings
  // 侧边栏设置
  tagsSectionHeight: number;
  isTagsSectionCollapsed: boolean;
  skillTagsSectionHeight: number;
  isSkillTagsSectionCollapsed: boolean;

  // AI model configuration (legacy single model compatibility)
  // SECURITY NOTE: aiApiKey is stored in localStorage (plaintext).
  // See WebDAV comment above for migration guidance.
  aiProvider: string;
  aiApiProtocol: AIProtocol;
  aiApiKey: string;
  aiApiUrl: string;
  aiModel: string;

  // Multi-model configuration (new version)
  // 多模型配置（新版）
  aiModels: AIModelConfig[];
  scenarioModelDefaults: ScenarioModelDefaults;

  // Translation mode setting / 翻译模式设置
  translationMode: TranslationMode; // immersive=沉浸式, full=全文翻译

  // 来源历史 / Source history for autocomplete
  sourceHistory: string[];

  // Custom skill scan paths / 自定义 Skill 扫描路径
  customSkillScanPaths: string[];
  skillProjects: SkillProject[];

  // Custom platform root paths / 自定义平台根目录
  customPlatformRootPaths: Record<string, string>;
  customSkillPlatformPaths: Record<string, string>;
  skillPlatformOrder: string[];

  // Skill install method / Skill 安装方式
  skillInstallMethod: "symlink" | "copy";
  autoScanInstalledSkills: boolean;
  autoScanStoreSkillsBeforeInstall: boolean;

  // Actions
  // 操作
  setThemeMode: (mode: ThemeMode) => void;
  setDarkMode: (isDark: boolean) => void;
  setThemeColor: (colorId: string) => void;
  setCustomThemeHex: (hex: string) => void;
  setClipboardImportEnabled: (enabled: boolean) => void;
  setFontSize: (size: string) => void;
  applyBackgroundImageSelection: (fileName: string) => void;
  setBackgroundImageFileName: (fileName?: string) => void;
  setBackgroundImageOpacity: (opacity: number) => void;
  setBackgroundImageBlur: (blur: number) => void;
  setRenderMarkdown: (enabled: boolean) => void;
  setEditorMarkdownPreview: (enabled: boolean) => void;
  setAutoSave: (enabled: boolean) => void;
  setShowLineNumbers: (enabled: boolean) => void;
  setLaunchAtStartup: (enabled: boolean) => void;
  setMinimizeOnLaunch: (enabled: boolean) => void;
  setDebugMode: (enabled: boolean) => void;
  setEnableNotifications: (enabled: boolean) => void;
  setCloseAction: (action: "ask" | "minimize" | "exit") => void;
  setShortcutMode: (key: string, mode: "global" | "local") => void;
  setShowCopyNotification: (enabled: boolean) => void;
  setShowSaveNotification: (enabled: boolean) => void;
  setLanguage: (lang: string) => void;
  setDataPath: (path: string) => void;
  setWebdavEnabled: (enabled: boolean) => void;
  setWebdavUrl: (url: string) => void;
  setWebdavUsername: (username: string) => void;
  setWebdavPassword: (password: string) => void;
  setWebdavAutoSync: (enabled: boolean) => void;
  setWebdavSyncOnStartup: (enabled: boolean) => void;
  setWebdavSyncOnStartupDelay: (delay: number) => void;
  setWebdavAutoSyncInterval: (interval: number) => void;
  setWebdavSyncOnSave: (enabled: boolean) => void;
  setWebdavIncludeImages: (enabled: boolean) => void;
  setWebdavIncrementalSync: (enabled: boolean) => void;
  setWebdavEncryptionEnabled: (enabled: boolean) => void;
  setWebdavEncryptionPassword: (password: string) => void;
  setSelfHostedSyncEnabled: (enabled: boolean) => void;
  setSelfHostedSyncUrl: (url: string) => void;
  setSelfHostedSyncUsername: (username: string) => void;
  setSelfHostedSyncPassword: (password: string) => void;
  setSelfHostedSyncOnStartup: (enabled: boolean) => void;
  setSelfHostedSyncOnStartupDelay: (delay: number) => void;
  setSelfHostedAutoSyncInterval: (interval: number) => void;
  setAutoCheckUpdate: (enabled: boolean) => void;
  setUseUpdateMirror: (enabled: boolean) => void;
  setUpdateChannel: (channel: UpdateChannel) => void;
  inferUpdateChannel: (version: string) => void;
  setTagsSectionHeight: (height: number) => void;
  setIsTagsSectionCollapsed: (collapsed: boolean) => void;
  setSkillTagsSectionHeight: (height: number) => void;
  setIsSkillTagsSectionCollapsed: (collapsed: boolean) => void;
  setAiProvider: (provider: string) => void;
  setAiApiProtocol: (protocol: AIProtocol) => void;
  setAiApiKey: (key: string) => void;
  setAiApiUrl: (url: string) => void;
  setAiModel: (model: string) => void;
  // 多模型管理
  addAiModel: (config: Omit<AIModelConfig, "id">) => void;
  updateAiModel: (id: string, config: Partial<AIModelConfig>) => void;
  deleteAiModel: (id: string) => void;
  setDefaultAiModel: (id: string) => void;
  setScenarioModelDefault: (
    scenario: AIUsageScenario,
    modelId: string | null,
  ) => void;
  setCreationMode: (mode: CreationMode) => void;
  setTranslationMode: (mode: TranslationMode) => void;
  addSourceHistory: (source: string) => void;
  applyTheme: () => void;
  // Custom skill scan paths actions / 自定义 Skill 扫描路径操作
  setCustomSkillScanPaths: (paths: string[]) => void;
  addCustomSkillScanPath: (path: string) => void;
  removeCustomSkillScanPath: (path: string) => void;
  addSkillProject: (input: {
    name: string;
    rootPath: string;
    scanPaths?: string[];
  }) => SkillProject;
  updateSkillProject: (
    projectId: string,
    updates: Partial<Pick<SkillProject, "name" | "rootPath" | "scanPaths" | "lastScannedAt">>,
  ) => void;
  removeSkillProject: (projectId: string) => void;
  setCustomPlatformRootPath: (platformId: string, path: string) => void;
  resetCustomPlatformRootPath: (platformId: string) => void;
  setCustomSkillPlatformPath: (platformId: string, path: string) => void;
  resetCustomSkillPlatformPath: (platformId: string) => void;
  setSkillPlatformOrder: (order: string[]) => void;
  moveSkillPlatformOrder: (
    platformId: string,
    direction: "up" | "down",
  ) => void;
  resetSkillPlatformOrder: () => void;
  // Skill install method action / Skill 安装方式操作
  setSkillInstallMethod: (method: "symlink" | "copy") => void;
  setAutoScanInstalledSkills: (enabled: boolean) => void;
  setAutoScanStoreSkillsBeforeInstall: (enabled: boolean) => void;
}

function syncSettingsToMain(settings: Partial<Settings>): void {
  if (typeof window === "undefined") {
    return;
  }

  void window.api?.settings
    ?.set(settings)
    .catch((error: unknown) =>
      console.warn("Failed to sync settings to main process:", error),
    );
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => {
      const touch = (): string => new Date().toISOString();
      const setTouched = (partial: Partial<SettingsState>) =>
        set({ ...partial, settingsUpdatedAt: touch() } as SettingsState);
      const normalizeProjectScanPaths = (
        scanPaths: string[] | undefined,
        rootPath: string,
      ): string[] => {
        const normalized = Array.from(
          new Set(
            (scanPaths ?? [rootPath])
              .map((entry) => normalizeProjectRecordPath(entry))
              .filter((entry) => entry.length > 0),
          ),
        );

        return normalized.length > 0 ? normalized : [rootPath];
      };

      return {
        // Default values
        // 默认值
        clipboardImportEnabled: false,
        themeMode: "system" as ThemeMode,
        isDarkMode: true,
        themeColor: "royal-blue",
        themeHue: 220,
        themeSaturation: 70,
        customThemeHex: "#3b82f6",
        settingsUpdatedAt: new Date().toISOString(),
        fontSize: "medium",
        backgroundImageFileName: undefined,
        backgroundImageOpacity: DEFAULT_BACKGROUND_IMAGE_OPACITY,
        backgroundImageBlur: DEFAULT_BACKGROUND_IMAGE_BLUR,
        renderMarkdown: true,
        editorMarkdownPreview: false,
        autoSave: true,
        showLineNumbers: false,
        launchAtStartup: false,
        minimizeOnLaunch: true,
        debugMode: false,
        closeAction: "ask" as const, // Default to ask every time / 默认每次询问
        shortcutModes: {
          showApp: "global",
          newPrompt: "local",
          search: "local",
          settings: "local",
        },
        enableNotifications: true,
        showCopyNotification: true,
        showSaveNotification: true,
        language: normalizeLanguage(i18n.language),
        dataPath: "",
        webdavEnabled: false,
        webdavUrl: "",
        webdavUsername: "",
        webdavPassword: "",
        webdavAutoSync: false,
        webdavSyncOnStartup: true,
        webdavSyncOnStartupDelay: 10,
        webdavAutoSyncInterval: 0,
        webdavSyncOnSave: false,
        webdavIncludeImages: true,
        webdavIncrementalSync: true,
        webdavEncryptionEnabled: false,
        webdavEncryptionPassword: "",
        selfHostedSyncEnabled: false,
        selfHostedSyncUrl: "",
        selfHostedSyncUsername: "",
        selfHostedSyncPassword: "",
        selfHostedSyncOnStartup: false,
        selfHostedSyncOnStartupDelay: 10,
        selfHostedAutoSyncInterval: 0,
        autoCheckUpdate: true,
        useUpdateMirror: false,
        updateChannel: "stable",
        updateChannelExplicitlySet: false,
        tagsSectionHeight: DEFAULT_TAGS_SECTION_HEIGHT,
        isTagsSectionCollapsed: false,
        skillTagsSectionHeight: DEFAULT_TAGS_SECTION_HEIGHT,
        isSkillTagsSectionCollapsed: false,
        aiProvider: "openai",
        aiApiProtocol: "openai",
        aiApiKey: "",
        aiApiUrl: "",
        aiModel: "gpt-4o",
        aiModels: [],
        scenarioModelDefaults: {},
        creationMode: "manual" as CreationMode,
        translationMode: "immersive" as TranslationMode,
        sourceHistory: [],
        customSkillScanPaths: [],
        skillProjects: [],
        customPlatformRootPaths: {},
        customSkillPlatformPaths: {},
        skillPlatformOrder: [],
        skillInstallMethod: "symlink" as const,
        autoScanInstalledSkills: false,
        autoScanStoreSkillsBeforeInstall: false,

        setCreationMode: (mode) => setTouched({ creationMode: mode }),
        setTranslationMode: (mode) => setTouched({ translationMode: mode }),

        addSourceHistory: (source) => {
          if (!source.trim()) return;
          const history = get().sourceHistory;
          // 移除重复项，放到最前面 / Remove duplicate and add to front
          const filtered = history.filter((s) => s !== source.trim());
          const updated = [source.trim(), ...filtered].slice(0, 20);
          setTouched({ sourceHistory: updated });
        },

        setThemeMode: (mode) => {
          if (mode === "system") {
            const prefersDark = window.matchMedia(
              "(prefers-color-scheme: dark)",
            ).matches;
            setTouched({ themeMode: mode, isDarkMode: prefersDark });
            document.documentElement.classList.toggle("dark", prefersDark);
          } else {
            const isDark = mode === "dark";
            setTouched({ themeMode: mode, isDarkMode: isDark });
            document.documentElement.classList.toggle("dark", isDark);
          }
        },

        setDarkMode: (isDark) => {
          setTouched({
            isDarkMode: isDark,
            themeMode: isDark ? "dark" : "light",
          });
          document.documentElement.classList.toggle("dark", isDark);
        },

        setThemeColor: (colorId) => {
          if (colorId === "custom") {
            const state = get();
            const hs = hexToHs(state.customThemeHex);
            setTouched({
              themeColor: "custom",
              themeHue: hs.hue,
              themeSaturation: hs.saturation,
            });
            document.documentElement.style.setProperty(
              "--theme-hue",
              String(hs.hue),
            );
            document.documentElement.style.setProperty(
              "--theme-saturation",
              String(hs.saturation),
            );
            return;
          }
          const theme = MORANDI_THEMES.find((t) => t.id === colorId);
          if (theme) {
            setTouched({
              themeColor: colorId,
              themeHue: theme.hue,
              themeSaturation: theme.saturation,
            });
            document.documentElement.style.setProperty(
              "--theme-hue",
              String(theme.hue),
            );
            document.documentElement.style.setProperty(
              "--theme-saturation",
              String(theme.saturation),
            );
          }
        },
        setCustomThemeHex: (hex) => {
          const hs = hexToHs(hex);
          setTouched({
            customThemeHex: `#${hex.replace(/^#/, "")}`,
            themeColor: "custom",
            themeHue: hs.hue,
            themeSaturation: hs.saturation,
          });
          document.documentElement.style.setProperty(
            "--theme-hue",
            String(hs.hue),
          );
          document.documentElement.style.setProperty(
            "--theme-saturation",
            String(hs.saturation),
          );
        },
        setRenderMarkdown: (enabled) => setTouched({ renderMarkdown: enabled }),
        setEditorMarkdownPreview: (enabled) =>
          setTouched({ editorMarkdownPreview: enabled }),

        setFontSize: (size) => {
          setTouched({ fontSize: size });
          const fontConfig = FONT_SIZES.find((f) => f.id === size);
          if (fontConfig) {
            document.documentElement.style.setProperty(
              "--base-font-size",
              `${fontConfig.value}px`,
            );
          }
        },

        applyBackgroundImageSelection: (fileName) => {
          const normalized = normalizeBackgroundImageFileName(fileName);
          if (!normalized) {
            return;
          }

          const nextOpacity = get().backgroundImageOpacity;
          const nextBlur = get().backgroundImageBlur;

          setTouched({
            backgroundImageFileName: normalized,
            backgroundImageOpacity: nextOpacity,
            backgroundImageBlur: nextBlur,
          });
          applyBackgroundImageVars({
            backgroundImageFileName: normalized,
            backgroundImageOpacity: nextOpacity,
            backgroundImageBlur: nextBlur,
          });
        },
        setBackgroundImageFileName: (fileName) => {
          const normalized = normalizeBackgroundImageFileName(fileName);
          if (get().backgroundImageFileName === normalized) {
            return;
          }
          setTouched({ backgroundImageFileName: normalized });
          applyBackgroundImageVars({
            backgroundImageFileName: normalized,
            backgroundImageOpacity: get().backgroundImageOpacity,
            backgroundImageBlur: get().backgroundImageBlur,
          });
        },
        setBackgroundImageOpacity: (opacity) => {
          const normalized = clampBackgroundImageOpacity(opacity);
          if (get().backgroundImageOpacity === normalized) {
            return;
          }
          setTouched({ backgroundImageOpacity: normalized });
          applyBackgroundImageVars({
            backgroundImageFileName: get().backgroundImageFileName,
            backgroundImageOpacity: normalized,
            backgroundImageBlur: get().backgroundImageBlur,
          });
        },
        setBackgroundImageBlur: (blur) => {
          const normalized = clampBackgroundImageBlur(blur);
          if (get().backgroundImageBlur === normalized) {
            return;
          }
          setTouched({ backgroundImageBlur: normalized });
          applyBackgroundImageVars({
            backgroundImageFileName: get().backgroundImageFileName,
            backgroundImageOpacity: get().backgroundImageOpacity,
            backgroundImageBlur: normalized,
          });
        },

        setClipboardImportEnabled: (enabled) =>
          setTouched({ clipboardImportEnabled: enabled }),
        setAutoSave: (enabled) => setTouched({ autoSave: enabled }),
        setShowLineNumbers: (enabled) =>
          setTouched({ showLineNumbers: enabled }),
        setLaunchAtStartup: (enabled) => {
          setTouched({ launchAtStartup: enabled });
          // Update auto launch with current minimizeOnLaunch setting
          const minimizeOnLaunch = get().minimizeOnLaunch;
          window.electron?.setAutoLaunch?.(enabled, minimizeOnLaunch);
          // Persist to main process DB so the main-process startup path
          // can read the setting on next launch (#115).
          syncSettingsToMain({ launchAtStartup: enabled });
        },
        setMinimizeOnLaunch: (enabled) => {
          setTouched({ minimizeOnLaunch: enabled });
          // Notify main process to update tray status
          window.electron?.setMinimizeToTray?.(enabled);
          // If auto launch is enabled, update the openAsHidden setting
          const launchAtStartup = get().launchAtStartup;
          if (launchAtStartup) {
            window.electron?.setAutoLaunch?.(true, enabled);
          }
          // Persist to main process DB so the main-process startup path
          // can read the setting on next launch (#115). Without this, the
          // main process always saw the DB default (false) even when the
          // user had enabled "minimize on launch" in the UI.
          syncSettingsToMain({ minimizeOnLaunch: enabled });
        },
        setCloseAction: (action) => {
          setTouched({ closeAction: action });
          // Notify main process of close action change / 通知主进程更新关闭行为
          window.electron?.setCloseAction?.(action);
        },
        setDebugMode: (enabled) => {
          setTouched({ debugMode: enabled });
          window.electron?.setDebugMode?.(enabled);
        },
        setShortcutMode: (key, mode) => {
          const currentModes = get().shortcutModes || {};
          const newModes = { ...currentModes, [key]: mode };
          setTouched({ shortcutModes: newModes });
          // Notify main process to update shortcut registration
          // 通知主进程更新快捷键注册
          window.electron?.setShortcutMode?.(newModes);
        },
        setEnableNotifications: (enabled) =>
          setTouched({ enableNotifications: enabled }),
        setShowCopyNotification: (enabled) =>
          setTouched({ showCopyNotification: enabled }),
        setShowSaveNotification: (enabled) =>
          setTouched({ showSaveNotification: enabled }),
        setLanguage: (lang) => {
          const normalized = normalizeLanguage(lang);
          setTouched({ language: normalized });
          changeLanguage(normalized);
        },
        setDataPath: (path) => setTouched({ dataPath: path }),
        setWebdavEnabled: (enabled) => setTouched({ webdavEnabled: enabled }),
        setWebdavUrl: (url) => setTouched({ webdavUrl: url }),
        setWebdavUsername: (username) =>
          setTouched({ webdavUsername: username }),
        setWebdavPassword: (password) =>
          setTouched({ webdavPassword: password }),
        setWebdavAutoSync: (enabled) =>
          setTouched({ webdavAutoSync: enabled, webdavSyncOnStartup: enabled }),
        setWebdavSyncOnStartup: (enabled) =>
          setTouched({ webdavSyncOnStartup: enabled }),
        setWebdavSyncOnStartupDelay: (delay) =>
          setTouched({
            webdavSyncOnStartupDelay: Math.max(0, Math.min(60, delay)),
          }),
        setWebdavAutoSyncInterval: (interval) =>
          setTouched({ webdavAutoSyncInterval: Math.max(0, interval) }),
        setWebdavSyncOnSave: (enabled) =>
          setTouched({ webdavSyncOnSave: enabled }),
        setWebdavIncludeImages: (enabled) =>
          setTouched({ webdavIncludeImages: enabled }),
        setWebdavIncrementalSync: (enabled) =>
          setTouched({ webdavIncrementalSync: enabled }),
        setWebdavEncryptionEnabled: (enabled) =>
          setTouched({ webdavEncryptionEnabled: enabled }),
        setWebdavEncryptionPassword: (password) =>
          setTouched({ webdavEncryptionPassword: password }),
        setSelfHostedSyncEnabled: (enabled) =>
          setTouched({ selfHostedSyncEnabled: enabled }),
        setSelfHostedSyncUrl: (url) => setTouched({ selfHostedSyncUrl: url }),
        setSelfHostedSyncUsername: (username) =>
          setTouched({ selfHostedSyncUsername: username }),
        setSelfHostedSyncPassword: (password) =>
          setTouched({ selfHostedSyncPassword: password }),
        setSelfHostedSyncOnStartup: (enabled) =>
          setTouched({ selfHostedSyncOnStartup: enabled }),
        setSelfHostedSyncOnStartupDelay: (delay) =>
          setTouched({
            selfHostedSyncOnStartupDelay: Math.max(0, Math.min(60, delay)),
          }),
        setSelfHostedAutoSyncInterval: (interval) =>
          setTouched({ selfHostedAutoSyncInterval: Math.max(0, interval) }),
        setAutoCheckUpdate: (enabled) =>
          setTouched({ autoCheckUpdate: enabled }),
        setUseUpdateMirror: (enabled) =>
          setTouched({ useUpdateMirror: enabled }),
        setUpdateChannel: (channel) =>
          setTouched({
            updateChannel: channel,
            updateChannelExplicitlySet: true,
          }),
        inferUpdateChannel: (version) => {
          const state = get();
          if (state.updateChannelExplicitlySet) {
            return;
          }

          const inferredChannel = isPrereleaseVersion(version)
            ? "preview"
            : "stable";

          if (state.updateChannel === inferredChannel) {
            return;
          }

          setTouched({ updateChannel: inferredChannel });
        },
        setTagsSectionHeight: (height) =>
          setTouched({ tagsSectionHeight: height }),
        setIsTagsSectionCollapsed: (collapsed) =>
          setTouched({ isTagsSectionCollapsed: collapsed }),
        setSkillTagsSectionHeight: (height) =>
          setTouched({ skillTagsSectionHeight: height }),
        setIsSkillTagsSectionCollapsed: (collapsed) =>
          setTouched({ isSkillTagsSectionCollapsed: collapsed }),
        setAiProvider: (provider) => setTouched({ aiProvider: provider }),
        setAiApiProtocol: (protocol) => setTouched({ aiApiProtocol: protocol }),
        setAiApiKey: (key) => setTouched({ aiApiKey: key }),
        setAiApiUrl: (url) => setTouched({ aiApiUrl: url }),
        setAiModel: (model) => setTouched({ aiModel: model }),

        // Multi-model management methods
        // 多模型管理方法
        addAiModel: (config) => {
          const id = `model_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
          const models = get().aiModels;
          const isFirst = models.length === 0;
          setTouched({
            aiModels: [...models, { ...config, id, isDefault: isFirst }],
          });
          // If it's the first model, sync to legacy configuration
          // 如果是第一个模型，同步到旧版配置
          if (isFirst) {
            setTouched({
              aiProvider: config.provider,
              aiApiProtocol: config.apiProtocol,
              aiApiKey: config.apiKey,
              aiApiUrl: config.apiUrl,
              aiModel: config.model,
            });
          }
        },

        updateAiModel: (id, config) => {
          const models = get().aiModels.map((m) =>
            m.id === id ? { ...m, ...config } : m,
          );
          setTouched({ aiModels: models });
          // If updating the default model, sync to legacy configuration
          // 如果更新的是默认模型，同步到旧版配置
          const updated = models.find((m) => m.id === id);
          if (updated?.isDefault) {
            setTouched({
              aiProvider: updated.provider,
              aiApiProtocol: updated.apiProtocol,
              aiApiKey: updated.apiKey,
              aiApiUrl: updated.apiUrl,
              aiModel: updated.model,
            });
          }
        },

        deleteAiModel: (id) => {
          const models = get().aiModels;
          const toDelete = models.find((m) => m.id === id);
          const remaining = models.filter((m) => m.id !== id);
          const scenarioModelDefaults = { ...get().scenarioModelDefaults };
          for (const [scenario, modelId] of Object.entries(
            scenarioModelDefaults,
          )) {
            if (modelId === id) {
              delete scenarioModelDefaults[scenario as AIUsageScenario];
            }
          }
          // If deleting the default model, set the first one as default
          // 如果删除的是默认模型，设置第一个为默认
          if (toDelete?.isDefault && remaining.length > 0) {
            remaining[0] = { ...remaining[0], isDefault: true };
            setTouched({
              aiProvider: remaining[0].provider,
              aiApiProtocol: remaining[0].apiProtocol,
              aiApiKey: remaining[0].apiKey,
              aiApiUrl: remaining[0].apiUrl,
              aiModel: remaining[0].model,
            });
          }
          setTouched({ aiModels: remaining, scenarioModelDefaults });
        },

        setDefaultAiModel: (id) => {
          const targetModel = get().aiModels.find((m) => m.id === id);
          if (!targetModel) return;

          const targetType = targetModel.type || "chat";

          // Only update isDefault status for models of the same type
          // 只更新同类型模型的 isDefault 状态
          const models = get().aiModels.map((m) => {
            const modelType = m.type || "chat";
            if (modelType === targetType) {
              return { ...m, isDefault: m.id === id };
            }
            return m;
          });
          setTouched({ aiModels: models });

          // Only chat models sync to legacy configuration
          // 只有对话模型才同步到旧版配置
          if (targetType === "chat") {
            setTouched({
              aiProvider: targetModel.provider,
              aiApiProtocol: targetModel.apiProtocol,
              aiApiKey: targetModel.apiKey,
              aiApiUrl: targetModel.apiUrl,
              aiModel: targetModel.model,
            });
          }
        },

        setScenarioModelDefault: (scenario, modelId) => {
          const nextDefaults = { ...get().scenarioModelDefaults };
          if (modelId) {
            nextDefaults[scenario] = modelId;
          } else {
            delete nextDefaults[scenario];
          }
          setTouched({ scenarioModelDefaults: nextDefaults });
        },

        applyTheme: () => {
          const state = get();
          // Handle theme mode
          // 处理主题模式
          let isDark = state.isDarkMode;
          if (state.themeMode === "system") {
            isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          } else {
            isDark = state.themeMode === "dark";
          }
          document.documentElement.classList.toggle("dark", isDark);
          document.documentElement.style.setProperty(
            "--theme-hue",
            String(state.themeHue),
          );
          document.documentElement.style.setProperty(
            "--theme-saturation",
            String(state.themeSaturation),
          );
          const fontConfig = FONT_SIZES.find((f) => f.id === state.fontSize);
          if (fontConfig) {
            document.documentElement.style.setProperty(
              "--base-font-size",
              `${fontConfig.value}px`,
            );
          }
          applyBackgroundImageVars(state);
          // Initialize tray status
          // 初始化托盘状态
          if (state.minimizeOnLaunch) {
            window.electron?.setMinimizeToTray?.(true);
          }
          if (state.debugMode) {
            window.electron?.setDebugMode?.(true);
          }
          // Sync close action
          if (state.closeAction) {
            window.electron?.setCloseAction?.(state.closeAction);
          }
        },

        // Custom skill scan paths actions / 自定义 Skill 扫描路径操作
        setCustomSkillScanPaths: (paths) =>
          setTouched({ customSkillScanPaths: paths }),
        addCustomSkillScanPath: (path) =>
          setTouched({
            customSkillScanPaths: get().customSkillScanPaths.includes(path)
              ? get().customSkillScanPaths
              : [...get().customSkillScanPaths, path],
          }),
        removeCustomSkillScanPath: (path) =>
          setTouched({
            customSkillScanPaths: get().customSkillScanPaths.filter(
              (p) => p !== path,
            ),
          }),
        addSkillProject: (input) => {
          const name = input.name.trim();
          const rootPath = normalizeProjectRecordPath(input.rootPath);
          if (!name || !rootPath) {
            throw new Error("Skill project name and rootPath are required");
          }

          const now = Date.now();
          const nextProject: SkillProject = {
            id: createProjectRecordId(),
            name,
            rootPath,
            scanPaths: normalizeProjectScanPaths(input.scanPaths, rootPath),
            createdAt: now,
            updatedAt: now,
          };

          const existingProjects = get().skillProjects;
          const hasConflict = existingProjects.some(
            (project) =>
              project.rootPath.toLowerCase() === nextProject.rootPath.toLowerCase(),
          );
          if (hasConflict) {
            throw new Error("Skill project root path already exists");
          }

          setTouched({ skillProjects: [nextProject, ...existingProjects] });
          syncSettingsToMain({ skillProjects: [nextProject, ...existingProjects] });
          return nextProject;
        },
        updateSkillProject: (projectId, updates) => {
          const currentProjects = get().skillProjects;
          const currentProject = currentProjects.find(
            (project) => project.id === projectId,
          );
          if (!currentProject) {
            return;
          }

          const nextRootPath =
            typeof updates.rootPath === "string"
              ? normalizeProjectRecordPath(updates.rootPath)
              : currentProject.rootPath;
          const nextName =
            typeof updates.name === "string"
              ? updates.name.trim()
              : currentProject.name;

          if (!nextName || !nextRootPath) {
            throw new Error("Skill project name and rootPath are required");
          }

          const hasConflict = currentProjects.some(
            (project) =>
              project.id !== projectId &&
              project.rootPath.toLowerCase() === nextRootPath.toLowerCase(),
          );
          if (hasConflict) {
            throw new Error("Skill project root path already exists");
          }

          const nextProjects = currentProjects.map((project) => {
            if (project.id !== projectId) {
              return project;
            }

            return {
              ...project,
              name: nextName,
              rootPath: nextRootPath,
              scanPaths:
                updates.scanPaths === undefined
                  ? project.scanPaths
                  : normalizeProjectScanPaths(updates.scanPaths, nextRootPath),
              lastScannedAt:
                updates.lastScannedAt === undefined
                  ? project.lastScannedAt
                  : updates.lastScannedAt,
              updatedAt: Date.now(),
            };
          });

          setTouched({ skillProjects: nextProjects });
          syncSettingsToMain({ skillProjects: nextProjects });
        },
        removeSkillProject: (projectId) => {
          const nextProjects = get().skillProjects.filter(
            (project) => project.id !== projectId,
          );
          setTouched({ skillProjects: nextProjects });
          syncSettingsToMain({ skillProjects: nextProjects });
        },
        setCustomPlatformRootPath: (platformId, pathValue) => {
          const normalizedPath = pathValue.trim();
          const nextPaths = { ...get().customPlatformRootPaths };
          if (normalizedPath) {
            nextPaths[platformId] = normalizedPath;
          } else {
            delete nextPaths[platformId];
          }
          setTouched({ customPlatformRootPaths: nextPaths });
          syncSettingsToMain({ customPlatformRootPaths: nextPaths });
        },
        resetCustomPlatformRootPath: (platformId) => {
          const nextPaths = { ...get().customPlatformRootPaths };
          delete nextPaths[platformId];
          setTouched({ customPlatformRootPaths: nextPaths });
          syncSettingsToMain({ customPlatformRootPaths: nextPaths });
        },
        setCustomSkillPlatformPath: (platformId, pathValue) => {
          get().setCustomPlatformRootPath(platformId, pathValue);
        },
        resetCustomSkillPlatformPath: (platformId) => {
          get().resetCustomPlatformRootPath(platformId);
        },
        setSkillPlatformOrder: (order) => {
          const nextOrder = order.filter(
            (platformId, index) =>
              typeof platformId === "string" &&
              platformId.trim().length > 0 &&
              order.indexOf(platformId) === index,
          );
          setTouched({ skillPlatformOrder: nextOrder });
          syncSettingsToMain({ skillPlatformOrder: nextOrder });
        },
        moveSkillPlatformOrder: (platformId, direction) => {
          const currentOrder = [...get().skillPlatformOrder];
          const currentIndex = currentOrder.indexOf(platformId);
          if (currentIndex === -1) {
            return;
          }

          const targetIndex =
            direction === "up" ? currentIndex - 1 : currentIndex + 1;
          if (targetIndex < 0 || targetIndex >= currentOrder.length) {
            return;
          }

          [currentOrder[currentIndex], currentOrder[targetIndex]] = [
            currentOrder[targetIndex],
            currentOrder[currentIndex],
          ];

          setTouched({ skillPlatformOrder: currentOrder });
          syncSettingsToMain({ skillPlatformOrder: currentOrder });
        },
        resetSkillPlatformOrder: () => {
          setTouched({ skillPlatformOrder: [] });
          syncSettingsToMain({ skillPlatformOrder: [] });
        },
        // Skill install method action / Skill 安装方式操作
        setSkillInstallMethod: (method) =>
          setTouched({ skillInstallMethod: method }),
        setAutoScanInstalledSkills: (enabled) =>
          setTouched({ autoScanInstalledSkills: enabled }),
        setAutoScanStoreSkillsBeforeInstall: (enabled) =>
          setTouched({ autoScanStoreSkillsBeforeInstall: enabled }),
      };
    },
    {
      name: "prompthub-settings",
      version: 8,
      migrate: (state, version) => {
        if (!state || typeof state !== "object") {
          return state as SettingsState;
        }
        const next = { ...(state as SettingsState) };
        next.aiApiProtocol = normalizeAIProtocol(
          next.aiApiProtocol,
          next.aiProvider,
          next.aiApiUrl,
        );
        if (!Array.isArray(next.aiModels)) {
          next.aiModels = [];
        } else {
          next.aiModels = next.aiModels
            .filter((model): model is AIModelConfig => {
              return Boolean(
                model &&
                  typeof model.id === "string" &&
                  typeof model.provider === "string" &&
                  typeof model.apiUrl === "string" &&
                  typeof model.model === "string",
              );
            })
            .map((model) => ({
              ...model,
              apiProtocol: normalizeAIProtocol(
                model.apiProtocol,
                model.provider,
                model.apiUrl,
              ),
            }));
        }
        if (
          typeof next.tagsSectionHeight === "number" &&
          next.tagsSectionHeight < DEFAULT_TAGS_SECTION_HEIGHT
        ) {
          next.tagsSectionHeight = DEFAULT_TAGS_SECTION_HEIGHT;
        }
        if (
          !next.scenarioModelDefaults ||
          typeof next.scenarioModelDefaults !== "object" ||
          Array.isArray(next.scenarioModelDefaults)
        ) {
          next.scenarioModelDefaults = {};
        }
        if (
          !next.customPlatformRootPaths ||
          typeof next.customPlatformRootPaths !== "object" ||
          Array.isArray(next.customPlatformRootPaths)
        ) {
          next.customPlatformRootPaths = {};
        }
        if (
          !next.customSkillPlatformPaths ||
          typeof next.customSkillPlatformPaths !== "object" ||
          Array.isArray(next.customSkillPlatformPaths)
        ) {
          next.customSkillPlatformPaths = {};
        }
        if (
          version < 7 &&
          Object.keys(next.customPlatformRootPaths).length === 0 &&
          Object.keys(next.customSkillPlatformPaths).length > 0
        ) {
          next.customPlatformRootPaths = { ...next.customSkillPlatformPaths };
        }
        if (
          !Array.isArray(next.skillPlatformOrder) ||
          next.skillPlatformOrder.some(
            (platformId) => typeof platformId !== "string",
          )
        ) {
          next.skillPlatformOrder = [];
        }
        if (!Array.isArray(next.skillProjects)) {
          next.skillProjects = [];
        } else {
          next.skillProjects = next.skillProjects
            .filter((project): project is SkillProject => {
              return Boolean(
                project &&
                  typeof project.id === "string" &&
                  typeof project.name === "string" &&
                  typeof project.rootPath === "string",
              );
            })
            .map((project) => {
              const normalizedRootPath =
                typeof project.rootPath === "string"
                  ? project.rootPath.trim()
                  : "";
              const normalizedScanPaths = Array.from(
                new Set(
                  (Array.isArray(project.scanPaths)
                    ? project.scanPaths
                    : [normalizedRootPath]
                  )
                    .map((entry) =>
                      typeof entry === "string" ? entry.trim() : "",
                    )
                    .filter((entry) => entry.length > 0),
                ),
              );

              return {
                ...project,
                name: project.name.trim(),
                rootPath: normalizedRootPath,
                scanPaths:
                  normalizedScanPaths.length > 0
                    ? normalizedScanPaths
                    : [normalizedRootPath],
                createdAt:
                  typeof project.createdAt === "number"
                    ? project.createdAt
                    : Date.now(),
                updatedAt:
                  typeof project.updatedAt === "number"
                    ? project.updatedAt
                    : Date.now(),
                lastScannedAt:
                  typeof project.lastScannedAt === "number"
                    ? project.lastScannedAt
                    : undefined,
              };
            })
            .filter(
              (project) => project.name.length > 0 && project.rootPath.length > 0,
            );
        }
        if (typeof next.autoScanInstalledSkills !== "boolean") {
          next.autoScanInstalledSkills = false;
        }
        if (typeof next.autoScanStoreSkillsBeforeInstall !== "boolean") {
          next.autoScanStoreSkillsBeforeInstall = false;
        }
        if (typeof next.updateChannelExplicitlySet !== "boolean") {
          next.updateChannelExplicitlySet = false;
        }
        if (version < 8) {
          next.aiApiProtocol = normalizeAIProtocol(
            next.aiApiProtocol,
            next.aiProvider,
            next.aiApiUrl,
          );
          next.aiModels = next.aiModels.map((model) => ({
            ...model,
            apiProtocol: normalizeAIProtocol(
              model.apiProtocol,
              model.provider,
              model.apiUrl,
            ),
          }));
        }
        next.backgroundImageFileName = normalizeBackgroundImageFileName(
          next.backgroundImageFileName,
        );
        next.backgroundImageOpacity = clampBackgroundImageOpacity(
          typeof next.backgroundImageOpacity === "number"
            ? next.backgroundImageOpacity
            : DEFAULT_BACKGROUND_IMAGE_OPACITY,
        );
        next.backgroundImageBlur = normalizeBackgroundImageBlur(
          typeof next.backgroundImageBlur === "number"
            ? next.backgroundImageBlur
            : DEFAULT_BACKGROUND_IMAGE_BLUR,
          version,
        );
        return next;
      },
      onRehydrateStorage: () => (state) => {
        applyBackgroundImageVars({
          backgroundImageFileName: state?.backgroundImageFileName,
          backgroundImageOpacity: state?.backgroundImageOpacity,
          backgroundImageBlur: state?.backgroundImageBlur,
        });
        syncSettingsToMain({
          customPlatformRootPaths: state?.customPlatformRootPaths || {},
          customSkillPlatformPaths: state?.customSkillPlatformPaths || {},
          skillPlatformOrder: state?.skillPlatformOrder || [],
          skillProjects: state?.skillProjects || [],
          // Re-sync startup behavior to main DB on rehydrate so the main
          // process can honor the user's preference on next launch (#115).
          // This also migrates existing users whose value lives only in
          // localStorage today.
          launchAtStartup: state?.launchAtStartup ?? false,
          minimizeOnLaunch: state?.minimizeOnLaunch ?? false,
        });
      },
    },
  ),
);
