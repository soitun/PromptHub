import { cloneElement, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  SunIcon,
  MoonIcon,
  MonitorIcon,
  CheckIcon,
  ImageIcon,
  SlidersHorizontalIcon,
  TrashIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useSettingsStore,
  MORANDI_THEMES,
  FONT_SIZES,
  ThemeMode,
  getRenderedBackgroundImageBlur,
  getRenderedBackgroundImageOpacity,
} from "../../stores/settings.store";
import { SettingSection } from "./shared";
import { isWebRuntime } from "../../runtime";
import { LocalImage } from "../ui/LocalImage";

export function AppearanceSettings() {
  const { t } = useTranslation();
  const settings = useSettingsStore();
  const webRuntime = isWebRuntime();
  const [isPickingBackground, setIsPickingBackground] = useState(false);

  const hasBackgroundImage = Boolean(settings.backgroundImageFileName);
  const backgroundOpacityPercent = useMemo(
    () => Math.round(settings.backgroundImageOpacity * 100),
    [settings.backgroundImageOpacity],
  );
  const renderedBackgroundOpacity = useMemo(
    () => getRenderedBackgroundImageOpacity(settings.backgroundImageOpacity),
    [settings.backgroundImageOpacity],
  );
  const renderedBackgroundBlur = useMemo(
    () => getRenderedBackgroundImageBlur(settings.backgroundImageBlur),
    [settings.backgroundImageBlur],
  );

  const backgroundVisibilityPercent = useMemo(
    () => Math.round(renderedBackgroundOpacity * 100),
    [renderedBackgroundOpacity],
  );

  const handleSelectBackgroundImage = async () => {
    if (webRuntime || isPickingBackground) {
      return;
    }

    setIsPickingBackground(true);
    try {
      const selectedPaths = await window.electron?.selectImage?.();
      const nextImagePath = Array.isArray(selectedPaths)
        ? selectedPaths[0]
        : undefined;
      if (!nextImagePath) {
        return;
      }

      const savedFileNames = await window.electron?.saveImage?.([nextImagePath]);
      const fileName = Array.isArray(savedFileNames)
        ? savedFileNames[0]
        : undefined;
      if (!fileName) {
        return;
      }

      settings.applyBackgroundImageSelection(fileName);
    } finally {
      setIsPickingBackground(false);
    }
  };

  const handleClearBackgroundImage = () => {
    settings.setBackgroundImageFileName(undefined);
  };

  const themeModes: {
    id: ThemeMode;
    labelKey: string;
    icon: ReactNode;
  }[] = [
    {
      id: "light",
      labelKey: "settings.light",
      icon: <SunIcon className="w-5 h-5" />,
    },
    {
      id: "dark",
      labelKey: "settings.dark",
      icon: <MoonIcon className="w-5 h-5" />,
    },
    {
      id: "system",
      labelKey: "settings.system",
      icon: <MonitorIcon className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      <SettingSection title={t("settings.themeMode")}>
        {/* Segmented control */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl app-settings-subtle">
            {themeModes.map((mode) => {
              const selected = settings.themeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => settings.setThemeMode(mode.id)}
                  className={`relative flex-1 h-10 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                    selected
                      ? "app-settings-segment-active"
                      : "app-settings-segment"
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <span
                      className={`transition-transform duration-200 ${selected ? "scale-105" : ""}`}
                    >
                      {cloneElement(mode.icon as any, {
                        className: "w-4 h-4",
                      })}
                    </span>
                    {t(mode.labelKey)}
                  </span>
                  {selected && (
                    <span className="absolute inset-0 rounded-lg ring-1 ring-primary/25" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </SettingSection>

      <SettingSection title={t("settings.themeColor")}>
        <div className="p-4">
          {/* 选中颜色名称（不挤占色带空间） */}
          <div className="flex items-center justify-end mb-3">
            <div className="text-xs text-muted-foreground tabular-nums">
              {settings.themeColor === "custom"
                ? `${t("settings.customColor", "Custom")} ${settings.customThemeHex}`
                : (() => {
                    const theme = MORANDI_THEMES.find(
                      (x) => x.id === settings.themeColor,
                    );
                    if (!theme) return "";
                    const key = `settings.color${theme.id.charAt(0).toUpperCase() + theme.id.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`;
                    return t(key);
                  })()}
            </div>
          </div>
          {/* 单行色带（均匀分布 + ring 安全边距，避免裁切） */}
          <div className="flex items-center w-full px-2 py-2 overflow-y-visible">
            {MORANDI_THEMES.map((theme) => {
              const colorNameKey = `settings.color${theme.id.charAt(0).toUpperCase() + theme.id.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`;
              const selected = settings.themeColor === theme.id;
              return (
                <div
                  key={theme.id}
                  className="flex-1 flex justify-center min-w-0"
                >
                  <button
                    onClick={() => settings.setThemeColor(theme.id)}
                    className={`relative h-10 w-10 flex-shrink-0 rounded-full transition-all duration-200 ${
                      selected
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "hover:opacity-90"
                    }`}
                    title={t(colorNameKey)}
                    aria-label={t(colorNameKey)}
                    style={{
                      backgroundColor: `hsl(${theme.hue}, ${theme.saturation}%, 55%)`,
                    }}
                  >
                    {selected && (
                      <span className="absolute inset-0 grid place-items-center">
                        <CheckIcon className="w-4 h-4 text-white drop-shadow" />
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
            {/* 自定义颜色入口 */}
            <div className="flex-1 flex justify-center min-w-0">
              <button
                onClick={() => settings.setThemeColor("custom")}
                className={`relative h-10 w-10 flex-shrink-0 rounded-full transition-all duration-200 ${
                  settings.themeColor === "custom"
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "hover:opacity-95"
                }`}
                title={t("settings.customColor", "Custom")}
                aria-label={t("settings.customColor", "Custom")}
                style={{ backgroundColor: settings.customThemeHex }}
              >
                {settings.themeColor === "custom" && (
                  <span className="absolute inset-0 grid place-items-center">
                    <CheckIcon className="w-4 h-4 text-white drop-shadow" />
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 仅在选择自定义时展开 */}
          {settings.themeColor === "custom" && (
            <div className="mt-4 p-4 rounded-xl app-settings-subtle animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">
                    {t("settings.customColor", "Custom Theme Color")}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {t(
                      "settings.customColorDesc",
                      "Apply any color to the global theme instantly",
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.customThemeHex}
                    onChange={(e) => settings.setCustomThemeHex(e.target.value)}
                    className="h-9 w-10 rounded-lg border border-border bg-transparent p-1"
                    aria-label={t("settings.customColor", "Custom Theme Color")}
                  />
                  <input
                    type="text"
                    value={settings.customThemeHex}
                    onChange={(e) => settings.setCustomThemeHex(e.target.value)}
                    className="h-9 w-28 px-3 rounded-lg app-settings-input text-sm font-mono"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              {/* 紧凑预览 */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {t("settings.primary", "Primary")}
                </div>
                <div className="flex-1 h-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center text-sm font-medium">
                  {t("settings.accent", "Accent")}
                </div>
                <div className="flex-1 h-9 rounded-lg app-settings-input flex items-center justify-center text-sm font-medium">
                  {t("settings.neutral", "Neutral")}
                </div>
              </div>
            </div>
          )}
        </div>
      </SettingSection>

      <SettingSection title={t("settings.fontSize")}>
        <div className="grid grid-cols-3 gap-3 p-4">
          {FONT_SIZES.map((size) => {
            const sizeNameKey = `settings.font${size.id.charAt(0).toUpperCase() + size.id.slice(1)}`;
            return (
              <button
                key={size.id}
                onClick={() => settings.setFontSize(size.id)}
                className={`py-2.5 px-4 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  settings.fontSize === size.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "app-settings-subtle text-foreground hover:shadow"
                } hover:-translate-y-0.5 active:translate-y-0`}
              >
                {t(sizeNameKey)}
                <span className="block text-[11px] opacity-70 mt-0.5">
                  {size.value}px
                </span>
              </button>
            );
          })}
        </div>
      </SettingSection>

      {!webRuntime ? (
        <SettingSection
          title={t("settings.backgroundImage", "Background Image")}
        >
          <div className="p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  {t("settings.backgroundImageTitle", "Desktop background")}
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-6">
                  {t(
                    "settings.backgroundImageDesc",
                    "Choose a local image for the desktop app background. The file stays in PromptHub's image storage and only the reference is saved in settings.",
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => void handleSelectBackgroundImage()}
                  disabled={isPickingBackground}
                  className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {hasBackgroundImage
                    ? t("settings.changeBackgroundImage", "Change image")
                    : t("settings.selectBackgroundImage", "Choose image")}
                </button>
                <button
                  type="button"
                  onClick={handleClearBackgroundImage}
                  disabled={!hasBackgroundImage}
                  className="h-9 px-3 rounded-lg app-wallpaper-surface border border-border text-foreground text-sm hover:bg-accent/60 transition-colors disabled:opacity-40 inline-flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  {t("settings.clearBackgroundImage", "Clear")}
                </button>
              </div>
            </div>

            <div className="rounded-2xl app-settings-subtle p-3 space-y-3">
              <div className="aspect-[16/9] w-full overflow-hidden rounded-xl app-settings-input relative">
                {hasBackgroundImage && settings.backgroundImageFileName ? (
                  <>
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{
                        opacity: renderedBackgroundOpacity,
                        filter: `blur(${renderedBackgroundBlur}px)`,
                        transform: renderedBackgroundBlur > 0 ? "scale(1.03)" : undefined,
                      }}
                    >
                      <LocalImage
                        src={settings.backgroundImageFileName}
                        alt={t("settings.backgroundImagePreviewAlt", "Background image preview")}
                        className="h-full w-full object-cover"
                        fallbackClassName="h-full w-full"
                      />
                    </div>
                    <div className="absolute inset-0 bg-background/15 dark:bg-background/30" />
                  </>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                    <span className="text-sm">
                      {t(
                        "settings.backgroundImageEmpty",
                        "No background image selected",
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      {t("settings.backgroundImageOpacity", "Background visibility")}
                    </span>
                    <span>{backgroundOpacityPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={backgroundOpacityPercent}
                    onChange={(event) =>
                      settings.setBackgroundImageOpacity(
                        Number(event.target.value) / 100,
                      )
                    }
                    className="w-full accent-primary"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <SlidersHorizontalIcon className="w-3.5 h-3.5" />
                      {t("settings.backgroundImageBlur", "Blur strength")}
                    </span>
                    <span>{settings.backgroundImageBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="0.5"
                    value={settings.backgroundImageBlur}
                    onChange={(event) =>
                      settings.setBackgroundImageBlur(Number(event.target.value))
                    }
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </SettingSection>
      ) : null}
    </div>
  );
}
