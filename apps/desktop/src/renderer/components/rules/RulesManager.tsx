import { useEffect, useMemo, useState } from "react";
import type { RuleVersionSnapshot } from "@prompthub/shared/types";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  FolderIcon,
  FolderOpenIcon,
  HistoryIcon,
  RotateCcwIcon,
  SaveIcon,
  SparklesIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useRulesStore } from "../../stores/rules.store";
import { useToast } from "../ui/Toast";
import { PlatformIcon } from "../ui/PlatformIcon";
import { generateTextDiff } from "../skill/detail-utils";

export function RulesManager() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const currentFile = useRulesStore((state) => state.currentFile);
  const draftContent = useRulesStore((state) => state.draftContent);
  const aiInstruction = useRulesStore((state) => state.aiInstruction);
  const aiSummary = useRulesStore((state) => state.aiSummary);
  const isLoading = useRulesStore((state) => state.isLoading);
  const isSaving = useRulesStore((state) => state.isSaving);
  const isRewriting = useRulesStore((state) => state.isRewriting);
  const error = useRulesStore((state) => state.error);
  const loadFiles = useRulesStore((state) => state.loadFiles);
  const setDraftContent = useRulesStore((state) => state.setDraftContent);
  const setAiInstruction = useRulesStore((state) => state.setAiInstruction);
  const saveCurrentRule = useRulesStore((state) => state.saveCurrentRule);
  const rewriteCurrentRule = useRulesStore((state) => state.rewriteCurrentRule);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    setSelectedVersionId(null);
  }, [currentFile?.id]);

  useEffect(() => {
    if (
      selectedVersionId &&
      !currentFile?.versions.some((version) => version.id === selectedVersionId)
    ) {
      setSelectedVersionId(null);
    }
  }, [currentFile?.versions, selectedVersionId]);

  const hasChanges = currentFile ? draftContent !== currentFile.content : false;
  const selectedVersion = useMemo(
    () =>
      currentFile?.versions.find((version) => version.id === selectedVersionId) ??
      null,
    [currentFile?.versions, selectedVersionId],
  );
  const diffStats = useMemo(() => {
    if (!currentFile) {
      return { added: 0, removed: 0 };
    }
    const diff = generateTextDiff(currentFile.content, draftContent);
    return {
      added: diff.filter((line) => line.type === "add").length,
      removed: diff.filter((line) => line.type === "remove").length,
    };
  }, [currentFile, draftContent]);

  const isPreviewingVersion = Boolean(selectedVersion);
  const editorContent = selectedVersion?.content ?? draftContent;

  const getVersionSourceLabel = (
    source: RuleVersionSnapshot["source"],
  ): string => {
    switch (source) {
      case "manual-save":
        return t("rules.versionSourceManualSave", "Saved");
      case "ai-rewrite":
        return t("rules.versionSourceAiRewrite", "AI Draft");
      case "create":
        return t("rules.versionSourceCreate", "Created");
      default:
        return source;
    }
  };

  const handleRestoreVersion = () => {
    if (!selectedVersion) {
      return;
    }

    setDraftContent(selectedVersion.content);
    setSelectedVersionId(null);
    showToast(t("rules.versionRestoreDone", "Snapshot restored to draft"), "success");
  };

  const handleSave = async () => {
    try {
      await saveCurrentRule();
      showToast(t("toast.saved", "Saved successfully"), "success");
    } catch (saveError) {
      showToast(
        saveError instanceof Error
          ? saveError.message
          : t("common.saveFailed", "Save failed"),
        "error",
      );
    }
  };

  const handleAiRewrite = async () => {
    try {
      await rewriteCurrentRule();
      showToast(t("rules.aiRewriteDone", "AI draft ready"), "success");
    } catch (rewriteError) {
      showToast(
        rewriteError instanceof Error
          ? rewriteError.message
          : t("rules.aiRewriteFailed", "AI rewrite failed"),
        "error",
      );
    }
  };

  return (
    <div className="flex h-full min-h-0 bg-background">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
          {/* Middle Settings Column */}
          <div className="flex flex-col border-r border-border bg-muted/20">
            {/* Header info */}
            <div className="min-h-[168px] border-b border-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {currentFile?.platformId === "workspace" ? (
                      <FolderIcon className="h-4 w-4 text-primary" />
                    ) : currentFile ? (
                      <PlatformIcon platformId={currentFile.platformId} size={16} className="h-4 w-4" />
                    ) : (
                      <BookOpenIcon className="h-4 w-4 text-primary" />
                    )}
                    <span className="truncate">
                      {currentFile?.platformName || t("rules.title", "Rules")}
                    </span>
                  </div>
                  <h3 className="mt-2 truncate text-xl font-semibold text-foreground">
                    {currentFile?.name || t("rules.pathUnknown", "No file selected")}
                  </h3>
                </div>
                {currentFile?.path ? (
                  <button
                    type="button"
                    onClick={() => void window.electron?.openPath?.(currentFile.path)}
                    className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title={t("rules.openLocation", "Open Location")}
                  >
                    <FolderOpenIcon className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              {currentFile?.path ? (
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="truncate text-muted-foreground" title={currentFile.path}>
                    {currentFile.path}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex flex-col gap-6">
                {/* AI Rewrite */}
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <SparklesIcon className="h-4 w-4 text-primary" />
                    {t("rules.aiRewriteTitle", "Ask AI to rewrite")}
                  </div>
                  <textarea
                    value={aiInstruction}
                    onChange={(event) => setAiInstruction(event.target.value)}
                    className="mt-3 h-24 w-full resize-none rounded-xl border border-border bg-card/60 p-3 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-1 focus:ring-primary/40"
                    placeholder={t(
                      "rules.aiRewritePlaceholder",
                      "Example: tighten coding standards, add testing requirements...",
                    )}
                  />
                  {aiSummary ? (
                    <div className="mt-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
                      {aiSummary}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void handleAiRewrite()}
                    disabled={
                      !currentFile ||
                      isRewriting ||
                      !aiInstruction.trim() ||
                      isPreviewingVersion
                    }
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    {isRewriting
                      ? t("rules.aiRewriteWorking", "Generating draft...")
                      : t("rules.aiRewriteAction", "Rewrite with AI")}
                  </button>
                </div>

                {/* Diff Stats (Only show when there are changes) */}
                {hasChanges && (
                  <div>
                    <div className="text-sm font-semibold text-foreground mb-3">
                      {t("rules.changesTitle", "Unsaved Changes")}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border bg-card/60 px-4 py-3">
                        <div className="text-xs text-muted-foreground">{t("rules.diffAdded", "Added")}</div>
                        <div className="mt-1 text-lg font-medium text-emerald-500">+{diffStats.added}</div>
                      </div>
                      <div className="rounded-xl border border-border bg-card/60 px-4 py-3">
                        <div className="text-xs text-muted-foreground">{t("rules.diffRemoved", "Removed")}</div>
                        <div className="mt-1 text-lg font-medium text-destructive">-{diffStats.removed}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Versions */}
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <HistoryIcon className="h-4 w-4 text-primary" />
                    {t("rules.versionTitle", "History")}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {t(
                      "rules.versionHint",
                      "Select a snapshot to preview it or restore it to the draft.",
                    )}
                  </p>
                  <div className="mt-3 space-y-2">
                    {currentFile?.versions?.length ? (
                      currentFile.versions.map((version) => (
                        <button
                          key={version.id}
                          type="button"
                          onClick={() =>
                            setSelectedVersionId((currentId) =>
                              currentId === version.id ? null : version.id,
                            )
                          }
                          aria-pressed={selectedVersionId === version.id}
                          className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                            selectedVersionId === version.id
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-card/60 hover:bg-muted/60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium text-foreground">
                                {new Date(version.savedAt).toLocaleString()}
                              </div>
                              <div className="mt-1 truncate text-[11px] text-muted-foreground">
                                {version.content
                                  .split("\n")
                                  .map((line) => line.trim())
                                  .find(Boolean) ||
                                  t("rules.emptyHint", "Rule content will appear here.")}
                              </div>
                            </div>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                              {getVersionSourceLabel(version.source)}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-border px-3 py-5 text-center text-xs text-muted-foreground">
                        {t("rules.versionEmpty", "No snapshots yet.")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Editor Column */}
          <div className="flex min-w-0 flex-1 flex-col bg-background">
            <div className="flex min-h-[168px] items-start justify-between border-b border-border p-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {currentFile?.platformId === "workspace" ? (
                    <FolderIcon className="h-4 w-4 text-primary" />
                  ) : currentFile ? (
                    <PlatformIcon platformId={currentFile.platformId} size={16} className="h-4 w-4" />
                  ) : (
                    <BookOpenIcon className="h-4 w-4 text-primary" />
                  )}
                  {selectedVersion
                    ? t("rules.versionPreviewTitle", "Snapshot Preview")
                    : t("rules.editorCanvas", "Rule Content")}
                </div>
                <h3 className="mt-1 truncate text-lg font-semibold text-foreground">
                  {currentFile?.name || t("rules.title", "Rules")}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {selectedVersion ? (
                    <>
                      <span>{t("rules.versionPreviewReadonly", "Preview mode is read-only.")}</span>
                      <span>{new Date(selectedVersion.savedAt).toLocaleString()}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">
                        {getVersionSourceLabel(selectedVersion.source)}
                      </span>
                    </>
                  ) : (
                    <span>
                      {hasChanges
                        ? t("rules.changesTitle", "Unsaved Changes")
                        : t("rules.versionEditingDraft", "Editing current draft")}
                    </span>
                  )}
                </div>
              </div>

              {selectedVersion ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedVersionId(null)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    {t("rules.versionBackToDraft", "Back to Draft")}
                  </button>
                  <button
                    type="button"
                    onClick={handleRestoreVersion}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                  >
                    <RotateCcwIcon className="h-4 w-4" />
                    {t("rules.versionRestoreToDraft", "Restore to Draft")}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={!currentFile || isSaving || !hasChanges}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SaveIcon className="h-4 w-4" />
                  {isSaving ? t("common.saving", "Saving...") : t("common.save", "Save")}
                </button>
              )}
            </div>

            {error ? (
              <div className="mx-6 mt-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircleIcon className="mt-0.5 h-4 w-4" />
                <div>{error}</div>
              </div>
            ) : null}

            <div className="flex-1 p-6 min-h-0">
              {isLoading && !currentFile ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {t("common.loading", "Loading...")}
                </div>
              ) : (
                <textarea
                  value={editorContent}
                  onChange={
                    isPreviewingVersion
                      ? undefined
                      : (event) => setDraftContent(event.target.value)
                  }
                  readOnly={isPreviewingVersion}
                  className={`h-full w-full resize-none rounded-xl border p-5 font-mono text-sm leading-relaxed text-foreground shadow-sm outline-none transition-colors ${
                    isPreviewingVersion
                      ? "border-border bg-muted/30"
                      : "border-border bg-card/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/40"
                  }`}
                  placeholder={t("rules.emptyHint", "Rule content will appear here.")}
                  spellCheck={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
