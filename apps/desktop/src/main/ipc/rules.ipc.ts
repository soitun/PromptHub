import { chatCompletion } from "../services/ai-client";
import fs from "fs/promises";
import path from "path";
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "@prompthub/shared/constants/ipc-channels";
import { KNOWN_RULE_FILE_TEMPLATES } from "@prompthub/shared/constants/rules";
import { getPlatformById } from "@prompthub/shared/constants/platforms";
import type {
  CreateRuleProjectInput,
  RuleBackupRecord,
  RuleFileContent,
  RuleFileDescriptor,
  RuleFileId,
  RuleRewriteRequest,
  RuleRewriteResult,
} from "@prompthub/shared/types";
import {
  createProjectRule,
  exportRuleBackupRecords,
  importRuleBackupRecords,
  listCachedRuleDescriptors,
  listRuleDescriptors,
  readRuleContent,
  removeProjectRule,
  scanRuleDescriptors,
  saveRuleContent,
} from "../services/rules-workspace";

function buildRuleRewritePrompt(payload: RuleRewriteRequest): string {
  return [
    `You are editing a rules file for ${payload.platformName}.`,
    `Target file: ${payload.fileName}`,
    "Rewrite the rules file based on the user's instruction.",
    "IMPORTANT: Only return the final file content. Do not include introductory or concluding conversational text.",
    "Preserve useful existing structure when possible.",
    "Return valid markdown only.",
    "User instruction:",
    payload.instruction.trim(),
    "Current content:",
    payload.currentContent.trim() || "(empty)",
  ].join("\n\n");
}

async function rewriteRuleWithAi(payload: RuleRewriteRequest): Promise<RuleRewriteResult> {
  if (!payload.aiConfig || !payload.aiConfig.apiKey) {
    throw new Error("AI API Key is not configured. Please set it in Settings.");
  }

  const messages = [
    {
      role: "system" as const,
      content:
        "You are an expert AI Rules engineer. Rewrite local AI rules files (e.g., .cursorrules, AGENTS.md, etc.) according to the user instructions. Maintain high quality, concise, and professional tone. Return ONLY the final production-ready markdown content. DO NOT wrap the output in markdown formatting blocks like ```markdown.",
    },
    {
      role: "user" as const,
      content: buildRuleRewritePrompt(payload),
    },
  ];

  const result = await chatCompletion(payload.aiConfig, messages, {
    temperature: 0.3,
    maxTokens: 4096,
  });

  const content = result.content?.trim();
  if (!content) {
    throw new Error("Rules AI rewrite returned empty content");
  }

  return {
    content,
    summary: "AI rewrite generated a new draft.",
  };
}

export function registerRulesIPC(): void {
  ipcMain.handle(IPC_CHANNELS.RULES_LIST, async (): Promise<RuleFileDescriptor[]> => {
    return listCachedRuleDescriptors();
  });

  ipcMain.handle(IPC_CHANNELS.RULES_SCAN, async (): Promise<RuleFileDescriptor[]> => {
    return scanRuleDescriptors();
  });

  ipcMain.handle(
    IPC_CHANNELS.RULES_READ,
    async (_event, ruleId: RuleFileId): Promise<RuleFileContent> => {
      return readRuleContent(ruleId);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.RULES_SAVE,
    async (_event, ruleId: RuleFileId, content: string): Promise<RuleFileContent> => {
      if (typeof content !== "string") {
        throw new Error("rules:save requires a string content");
      }

      return saveRuleContent(ruleId, content);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.RULES_REWRITE,
    async (_event, payload: RuleRewriteRequest): Promise<RuleRewriteResult> => {
      if (!payload || typeof payload.instruction !== "string") {
        throw new Error("rules:rewrite requires an instruction payload");
      }

      return rewriteRuleWithAi(payload);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.RULES_ADD_PROJECT,
    async (_event, input: CreateRuleProjectInput): Promise<RuleFileDescriptor> => {
      if (!input || typeof input.name !== "string" || typeof input.rootPath !== "string") {
        throw new Error("rules:addProject requires name and rootPath");
      }

      return createProjectRule(input);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.RULES_REMOVE_PROJECT,
    async (_event, projectId: string): Promise<{ success: boolean }> => {
      if (!projectId || typeof projectId !== "string") {
        throw new Error("rules:removeProject requires a project id");
      }
      await removeProjectRule(projectId);
      return { success: true };
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.RULES_IMPORT_RECORDS,
    async (
      _event,
      records: RuleBackupRecord[],
      options?: { replace?: boolean },
    ): Promise<{ success: boolean }> => {
      if (!Array.isArray(records)) {
        throw new Error("rules:importRecords requires an array payload");
      }
      await importRuleBackupRecords(records, {
        replace: options?.replace === true,
      });
      return { success: true };
    },
  );
}
