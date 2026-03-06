import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../../shared/constants";
import { SkillInstaller } from "../../services/skill-installer";
import type { SkillIPCContext } from "./shared";
import { resolveRepoPath } from "./shared";

export function registerSkillLocalRepoHandlers({ db }: SkillIPCContext): void {
  ipcMain.handle(
    IPC_CHANNELS.SKILL_SAVE_TO_REPO,
    async (_, skillName: string, sourceDir: string) => {
      if (typeof skillName !== "string" || skillName.trim().length === 0) {
        throw new Error("skill:saveToRepo requires a non-empty skillName");
      }
      if (typeof sourceDir !== "string" || sourceDir.trim().length === 0) {
        throw new Error("skill:saveToRepo requires a non-empty sourceDir");
      }
      return SkillInstaller.saveToLocalRepo(skillName, sourceDir);
    },
  );

  ipcMain.handle(IPC_CHANNELS.SKILL_READ_LOCAL_FILES, async (_, skillId: string) => {
    if (typeof skillId !== "string" || skillId.trim() === "") {
      return [];
    }
    const skill = db.getById(skillId);
    if (!skill) return [];
    if (skill.local_repo_path) {
      return SkillInstaller.readLocalRepoFilesByPath(skill.local_repo_path);
    }
    return SkillInstaller.readLocalRepoFiles(skill.name);
  });

  ipcMain.handle(
    IPC_CHANNELS.SKILL_WRITE_LOCAL_FILE,
    async (_, skillId: string, relativePath: string, content: string) => {
      if (typeof skillId !== "string" || skillId.trim() === "") {
        throw new Error("skill:writeLocalFile requires a non-empty skillId");
      }
      const skill = db.getById(skillId);
      if (!skill) throw new Error(`Skill not found: ${skillId}`);
      if (skill.local_repo_path) {
        return SkillInstaller.writeLocalRepoFileByPath(
          skill.local_repo_path,
          relativePath,
          content,
        );
      }
      return SkillInstaller.writeLocalRepoFile(skill.name, relativePath, content);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_DELETE_LOCAL_FILE,
    async (_, skillId: string, relativePath: string) => {
      if (typeof skillId !== "string" || skillId.trim() === "") {
        throw new Error("skill:deleteLocalFile requires a non-empty skillId");
      }
      const skill = db.getById(skillId);
      if (!skill) throw new Error(`Skill not found: ${skillId}`);
      if (skill.local_repo_path) {
        return SkillInstaller.deleteLocalRepoFileByPath(
          skill.local_repo_path,
          relativePath,
        );
      }
      return SkillInstaller.deleteLocalRepoFile(skill.name, relativePath);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATE_LOCAL_DIR,
    async (_, skillId: string, relativePath: string) => {
      if (typeof skillId !== "string" || skillId.trim() === "") {
        throw new Error("skill:createLocalDir requires a non-empty skillId");
      }
      const skill = db.getById(skillId);
      if (!skill) throw new Error(`Skill not found: ${skillId}`);
      if (skill.local_repo_path) {
        return SkillInstaller.createLocalRepoDirByPath(
          skill.local_repo_path,
          relativePath,
        );
      }
      return SkillInstaller.createLocalRepoDir(skill.name, relativePath);
    },
  );

  ipcMain.handle(IPC_CHANNELS.SKILL_GET_REPO_PATH, async (_, skillId: string) =>
    resolveRepoPath(db, skillId),
  );
}
