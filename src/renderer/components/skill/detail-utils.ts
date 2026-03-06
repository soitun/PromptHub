import type { SkillVersion } from "../../../shared/types";

export interface SkillPlatform {
  id: string;
  name: string;
  icon: string;
  skillsDir: { darwin: string; win32: string; linux: string };
}

/**
 * Strip YAML frontmatter from SKILL.md content.
 * 从 SKILL.md 内容中剥离 YAML frontmatter。
 */
export function stripFrontmatter(content: string): string {
  const trimmed = content.trim();
  if (!trimmed.startsWith("---")) return trimmed;

  const endIdx = trimmed.indexOf("---", 3);
  if (endIdx === -1) return trimmed;
  return trimmed.slice(endIdx + 3).trim();
}

/**
 * Restore a specific skill version and refresh list state afterwards.
 * 恢复指定 skill 版本，并在完成后刷新列表状态。
 */
export async function restoreSkillVersion(
  skillId: string,
  version: SkillVersion,
  loadSkills: () => Promise<void>,
): Promise<void> {
  await window.api.skill.versionRollback(skillId, version.version);
  await loadSkills();
}
