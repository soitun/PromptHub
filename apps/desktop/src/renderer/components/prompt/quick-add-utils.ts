import type { AIConfig } from "../../services/ai";
import {
  resolveScenarioAIConfig,
} from "../../services/ai-defaults";
import type {
  AIModelConfig,
  ScenarioModelDefaults,
} from "../../stores/settings.store";

interface ResolveQuickAddAnalysisConfigOptions {
  aiModels: AIModelConfig[];
  scenarioModelDefaults: ScenarioModelDefaults;
  aiProvider: string;
  aiApiKey: string;
  aiApiUrl: string;
  aiModel: string;
}

export function resolveQuickAddAnalysisConfig({
  aiModels,
  scenarioModelDefaults,
  aiProvider,
  aiApiKey,
  aiApiUrl,
  aiModel,
}: ResolveQuickAddAnalysisConfigOptions): AIConfig | null {
  return resolveScenarioAIConfig({
    aiModels,
    scenarioModelDefaults,
    scenario: "quickAdd",
    type: "chat",
    aiProvider,
    aiApiKey,
    aiApiUrl,
    aiModel,
  });
}

export function getQuickAddFallbackTitle(
  promptText: string,
  emptyFallback = "New Prompt",
): string {
  const firstLine = promptText
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine?.slice(0, 30) || emptyFallback;
}
