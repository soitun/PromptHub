import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../../shared/constants";
import { SkillInstaller } from "../../services/skill-installer";
import type {
  CreateSkillParams,
  UpdateSkillParams,
} from "../../../shared/types";
import type { SkillIPCContext } from "./shared";

export function registerSkillCrudHandlers({ db }: SkillIPCContext): void {
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATE,
    async (
      _,
      data: CreateSkillParams,
      options?: { skipInitialVersion?: boolean },
    ) => {
      if (
        !data ||
        !data.name ||
        typeof data.name !== "string" ||
        data.name.trim().length === 0
      ) {
        throw new Error("skill:create requires a non-empty name field");
      }

      if (
        data.source_url &&
        data.source_url.includes("github.com") &&
        !data.content &&
        !data.instructions
      ) {
        const id = await SkillInstaller.installFromGithub(data.source_url, db);
        return db.getById(id);
      }

      return db.create(data, options);
    },
  );

  ipcMain.handle(IPC_CHANNELS.SKILL_GET, async (_, id: string) => {
    if (typeof id !== "string" || id.trim().length === 0) {
      throw new Error("skill:get requires a non-empty id");
    }
    return db.getById(id);
  });

  ipcMain.handle(IPC_CHANNELS.SKILL_GET_ALL, async () => db.getAll());

  ipcMain.handle(
    IPC_CHANNELS.SKILL_UPDATE,
    async (_, id: string, data: UpdateSkillParams) => {
      if (typeof id !== "string" || id.trim().length === 0) {
        throw new Error("skill:update requires a non-empty id");
      }
      if (!data || typeof data !== "object") {
        throw new Error("skill:update requires a non-null data object");
      }
      return db.update(id, data);
    },
  );

  ipcMain.handle(IPC_CHANNELS.SKILL_DELETE, async (_, id: string) => {
    if (typeof id !== "string" || id.trim().length === 0) {
      throw new Error("skill:delete requires a non-empty id");
    }

    const skill = db.getById(id);
    if (skill?.name) {
      try {
        if (skill.local_repo_path) {
          await SkillInstaller.deleteRepoByPath(skill.local_repo_path);
        } else {
          await SkillInstaller.deleteLocalRepo(skill.name);
        }
      } catch (error) {
        console.warn(
          `Failed to delete local repo for skill "${skill.name}":`,
          error,
        );
      }

      try {
        const platforms = SkillInstaller.getSupportedPlatforms();
        await Promise.allSettled(
          platforms.map((platform) =>
            SkillInstaller.uninstallSkillMd(skill.name, platform.id),
          ),
        );
      } catch (error) {
        console.warn(
          `Failed to uninstall SKILL.md for skill "${skill.name}":`,
          error,
        );
      }
    }

    return db.delete(id);
  });

  ipcMain.handle(IPC_CHANNELS.SKILL_SCAN_LOCAL, async () =>
    SkillInstaller.scanLocal(db),
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_SCAN_LOCAL_PREVIEW,
    async (_, customPaths?: string[]) => {
      if (customPaths !== undefined && !Array.isArray(customPaths)) {
        throw new Error(
          "skill:scanLocalPreview expects customPaths to be an array",
        );
      }
      return SkillInstaller.scanLocalPreview(customPaths);
    },
  );

  ipcMain.handle(IPC_CHANNELS.SKILL_EXPORT, async (_, id: string, format) => {
    if (typeof id !== "string" || id.trim().length === 0) {
      throw new Error("skill:export requires a non-empty id");
    }
    if (format !== "skillmd" && format !== "json") {
      throw new Error("skill:export format must be 'skillmd' or 'json'");
    }
    const skill = db.getById(id);
    if (!skill) throw new Error("Skill not found");
    return format === "skillmd"
      ? SkillInstaller.exportAsSkillMd(skill)
      : SkillInstaller.exportAsJson(skill);
  });

  ipcMain.handle(IPC_CHANNELS.SKILL_IMPORT, async (_, jsonContent: string) => {
    if (typeof jsonContent !== "string" || jsonContent.trim().length === 0) {
      throw new Error("skill:import requires a non-empty JSON content string");
    }
    const id = await SkillInstaller.importFromJson(jsonContent, db);
    return db.getById(id);
  });
}
