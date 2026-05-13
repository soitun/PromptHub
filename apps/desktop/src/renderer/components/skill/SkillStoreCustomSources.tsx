import { CheckIcon, EditIcon, LinkIcon, Loader2Icon, PowerIcon, TrashIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { TFunction } from "i18next";
import type { SkillStoreSource } from "@prompthub/shared/types";

interface SkillStoreCustomSourcesProps {
  customStoreSources: SkillStoreSource[];
  loadStoreSource: (sourceId: string, forceRefresh?: boolean) => Promise<void>;
  loadingSourceId: string | null;
  renameCustomStoreSource: (id: string, name: string) => void;
  remoteStoreEntries: Record<
    string,
    { loadedAt: number; error?: string | null; skills: { slug: string }[] }
  >;
  removeCustomStoreSource: (id: string) => void;
  selectStoreSource: (id: string) => void;
  selectedCustomSource: SkillStoreSource | null;
  selectedStoreSourceId: string;
  t: TFunction;
  toggleCustomStoreSource: (id: string) => void;
}

export function SkillStoreCustomSources({
  customStoreSources,
  loadStoreSource,
  loadingSourceId,
  renameCustomStoreSource,
  remoteStoreEntries,
  removeCustomStoreSource,
  selectStoreSource,
  selectedCustomSource,
  selectedStoreSourceId,
  t,
  toggleCustomStoreSource,
}: SkillStoreCustomSourcesProps) {
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  useEffect(() => {
    if (!editingSourceId) {
      setDraftName("");
      return;
    }

    const source = customStoreSources.find((item) => item.id === editingSourceId);
    setDraftName(source?.name ?? "");
  }, [customStoreSources, editingSourceId]);

  const submitRename = (id: string) => {
    const trimmed = draftName.trim();
    if (!trimmed) return;
    renameCustomStoreSource(id, trimmed);
    setEditingSourceId(null);
    setDraftName("");
  };

  const cancelRename = () => {
    setEditingSourceId(null);
    setDraftName("");
  };

  if (!selectedCustomSource && customStoreSources.length === 0) {
    return (
      <div className="app-wallpaper-panel border border-dashed border-border rounded-2xl p-8 text-center text-muted-foreground">
        <LinkIcon className="w-10 h-10 mx-auto opacity-30 mb-3" />
        <h4 className="text-base font-semibold text-foreground mb-1">
          {t("skill.noCustomStores", "No custom stores yet")}
        </h4>
        <p className="text-sm">
          {t(
            "skill.noCustomStoresHint",
            "Click the dashed box on the left to add a store and connect your own skill sources.",
          )}
        </p>
      </div>
    );
  }

  if (selectedCustomSource) {
    return (
      <div className="app-wallpaper-panel border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <LinkIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {editingSourceId === selectedCustomSource.id ? (
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        submitRename(selectedCustomSource.id);
                      }
                      if (event.key === "Escape") {
                        cancelRename();
                      }
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-border bg-accent/50 px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    type="button"
                    onClick={() => submitRename(selectedCustomSource.id)}
                    className="rounded-lg p-2 text-primary hover:bg-primary/10 transition-colors"
                    title={t("common.save", "Save")}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelRename}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-accent transition-colors"
                    title={t("common.cancel", "Cancel")}
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h4 className="font-semibold text-foreground truncate">
                    {selectedCustomSource.name}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingSourceId(selectedCustomSource.id)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    title={t("common.edit", "Edit")}
                  >
                    <EditIcon className="h-4 w-4" />
                  </button>
                </>
              )}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  selectedCustomSource.enabled
                    ? "bg-green-500/10 text-green-500"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {selectedCustomSource.enabled
                  ? t("common.enabled", "Enabled")
                  : t("common.disabled", "Disabled")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {selectedCustomSource.url}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleCustomStoreSource(selectedCustomSource.id)}
            className="px-3 py-2 text-sm rounded-lg bg-accent text-foreground hover:bg-accent/80 transition-colors"
          >
            {selectedCustomSource.enabled
              ? t("common.disable", "Disable")
              : t("common.enable", "Enable")}
          </button>
          <button
            onClick={() => void loadStoreSource(selectedCustomSource.id, true)}
            className="px-3 py-2 text-sm rounded-lg bg-accent text-foreground hover:bg-accent/80 transition-colors inline-flex items-center gap-2"
          >
            <Loader2Icon
              className={`w-4 h-4 ${
                loadingSourceId === selectedCustomSource.id
                  ? "animate-spin"
                  : ""
              }`}
            />
            {t("common.refresh", "Refresh")}
          </button>
          <button
            onClick={() => {
              removeCustomStoreSource(selectedCustomSource.id);
              selectStoreSource("official");
            }}
            className="px-3 py-2 text-sm rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
          >
            {t("common.delete", "Delete")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {customStoreSources.map((source) => {
        const count = remoteStoreEntries[source.id]?.skills.length || 0;
        const isSelected = selectedStoreSourceId === source.id;
        return (
          <div
            key={source.id}
            onClick={() => selectStoreSource(source.id)}
            className={`app-wallpaper-panel border rounded-2xl p-4 flex items-center gap-4 text-left ${
              isSelected ? "border-primary shadow-sm" : "border-border"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {editingSourceId === source.id ? (
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          submitRename(source.id);
                        }
                        if (event.key === "Escape") {
                          cancelRename();
                        }
                      }}
                      className="min-w-0 flex-1 rounded-lg border border-border bg-accent/50 px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        submitRename(source.id);
                      }}
                      className="rounded-lg p-2 text-primary hover:bg-primary/10 transition-colors"
                      title={t("common.save", "Save")}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        cancelRename();
                      }}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-accent transition-colors"
                      title={t("common.cancel", "Cancel")}
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h4 className="font-semibold text-foreground truncate">
                      {source.name}
                    </h4>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditingSourceId(source.id);
                      }}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      title={t("common.edit", "Edit")}
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </>
                )}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    source.enabled
                      ? "bg-green-500/10 text-green-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {source.enabled
                    ? t("common.enabled", "Enabled")
                    : t("common.disabled", "Disabled")}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground">
                  {count} {t("skill.skillsCount", "skills")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-1">
                {source.url}
              </p>
            </div>
            <button
              onClick={(event) => {
                event.stopPropagation();
                setEditingSourceId(source.id);
              }}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              title={t("common.edit", "Edit")}
            >
              <EditIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                toggleCustomStoreSource(source.id);
              }}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              title={
                source.enabled
                  ? t("common.disable", "Disable")
                  : t("common.enable", "Enable")
              }
            >
              <PowerIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                void loadStoreSource(source.id, true);
              }}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              title={t("common.refresh", "Refresh")}
            >
              <Loader2Icon
                className={`w-4 h-4 ${loadingSourceId === source.id ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                removeCustomStoreSource(source.id);
                if (editingSourceId === source.id) {
                  cancelRename();
                }
              }}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title={t("common.delete", "Delete")}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
