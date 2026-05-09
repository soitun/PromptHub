import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "@prompthub/shared/constants/ipc-channels";
import type {
  CreateRuleProjectInput,
  RuleBackupRecord,
  RuleFileContent,
  RuleFileDescriptor,
  RuleFileId,
  RuleRewriteRequest,
  RuleRewriteResult,
} from "@prompthub/shared/types";

export const rulesApi = {
  list: (): Promise<RuleFileDescriptor[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.RULES_LIST),
  read: (ruleId: RuleFileId): Promise<RuleFileContent> =>
    ipcRenderer.invoke(IPC_CHANNELS.RULES_READ, ruleId),
  save: (ruleId: RuleFileId, content: string): Promise<RuleFileContent> =>
    ipcRenderer.invoke(IPC_CHANNELS.RULES_SAVE, ruleId, content),
  rewrite: (payload: RuleRewriteRequest): Promise<RuleRewriteResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.RULES_REWRITE, payload),
  addProject: (input: CreateRuleProjectInput): Promise<RuleFileDescriptor> =>
    ipcRenderer.invoke(IPC_CHANNELS.RULES_ADD_PROJECT, input),
  removeProject: (projectId: string): Promise<{ success: boolean }> =>
    ipcRenderer.invoke(IPC_CHANNELS.RULES_REMOVE_PROJECT, projectId),
  importRecords: (records: RuleBackupRecord[]): Promise<{ success: boolean }> =>
    ipcRenderer.invoke(IPC_CHANNELS.RULES_IMPORT_RECORDS, records),
};
