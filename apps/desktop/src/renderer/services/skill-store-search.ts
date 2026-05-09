/**
 * Skill store search utilities (issue #88).
 *
 * Users reported that skills they could find yesterday were sometimes
 * "gone" today. Two classes of problems were behind this:
 *
 *   1. The original filter only considered `name`, `description`, and
 *      `tags`, and did so with a naive `includes` on the lowercase text.
 *      That meant a query like "hello world" would not find a skill
 *      called "hello-world" or "hello_world", even though those are the
 *      conventional store naming conventions.
 *
 *   2. Some skills surface their distinguishing identifier in other
 *      fields such as `install_name`, `slug`, or `author`. If the user
 *      remembered the author / slug, the old search would miss the
 *      skill completely.
 *
 * This module exposes a pure helper so the UI and tests can share the
 * same algorithm, and so future adjustments (e.g. fuzzy matching) can
 * be made in a single place.
 *
 * 技能商店搜索工具 (#88)。用户反馈有时"昨天能找到的技能今天就找不到了"。
 * 原因之一是老实现只 includes 匹配 name/description/tags，且没有把
 * 连字符/下划线归一化，像 "hello world" 这种查询就匹配不到 "hello-world"；
 * 另外 slug / install_name / author 字段也没纳入搜索。本文件把过滤逻辑抽离
 * 成纯函数，便于测试与未来迭代（如模糊匹配）。
 */

import type { RegistrySkill, SkillCategory } from "@prompthub/shared/types";

/**
 * Normalize a free-form search term so that users typing natural
 * language ("Hello World") still find slug-style names ("hello-world"
 * or "hello_world"). We collapse anything that is not a Unicode letter
 * or digit into a single space, lowercase, and collapse repeated
 * whitespace.
 *
 * The normalized form is intentionally not returned to the user — it
 * is purely an internal matching key.
 *
 * 把自由输入归一化为仅包含 Unicode 字母/数字的小写文本，保留单空格分词。
 * 归一化后的结果仅用于匹配，不展示给用户。
 */
export function normalizeSearchTerm(term: string): string {
  if (!term) return "";
  return term
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Return all searchable fields of a registry skill as a single
 * pre-normalized haystack. This also protects against fields that may
 * be `undefined` in ill-formed remote entries (the old implementation
 * called `.toLowerCase()` directly and crashed).
 *
 * 汇总所有可搜索字段并做归一化，同时容忍字段 undefined（旧实现在遇到
 * undefined description 时直接 throw）。
 */
function buildSkillHaystack(skill: RegistrySkill): string {
  const parts: string[] = [];
  const pushIfString = (value: unknown) => {
    if (typeof value === "string" && value.length > 0) {
      parts.push(value);
    }
  };

  pushIfString(skill.name);
  pushIfString(skill.install_name);
  pushIfString(skill.slug);
  pushIfString(skill.description);
  pushIfString(skill.author);
  if (Array.isArray(skill.tags)) {
    for (const tag of skill.tags) {
      pushIfString(tag);
    }
  }

  return normalizeSearchTerm(parts.join(" "));
}

export interface FilterRegistrySkillsOptions {
  /** Optional category filter. `"all"` is treated as "no filter". */
  category?: SkillCategory | "all";
  /**
   * Free-form search query. Empty / whitespace-only queries are treated
   * as "no search" so the full list is returned.
   */
  searchQuery?: string;
}

/**
 * Filter a list of registry skills by category and search query.
 *
 * Behavior:
 *   - Category `"all"` or absent → no category filter.
 *   - Empty / whitespace-only query → no search filter.
 *   - Non-empty query → all whitespace-separated tokens of the
 *     normalized query must appear as substrings in the normalized
 *     skill haystack (AND semantics). This lets a user type three
 *     distinct tokens in any order and still find the skill.
 *
 * 根据分类与搜索词过滤技能列表：空分类/空查询不过滤；非空查询按归一化后
 * 的空格切分，AND 匹配所有 token（子串）。这样即便输入顺序与 slug 不同
 * 也能命中。
 */
export function filterRegistrySkills(
  skills: readonly RegistrySkill[],
  options: FilterRegistrySkillsOptions = {},
): RegistrySkill[] {
  const { category, searchQuery } = options;

  let result: RegistrySkill[] = [...skills];

  if (category && category !== "all") {
    result = result.filter((skill) => skill.category === category);
  }

  const normalizedQuery = normalizeSearchTerm(searchQuery ?? "");
  if (normalizedQuery.length === 0) {
    return result;
  }

  const tokens = normalizedQuery.split(" ").filter(Boolean);
  if (tokens.length === 0) {
    return result;
  }

  return result.filter((skill) => {
    const haystack = buildSkillHaystack(skill);
    return tokens.every((token) => haystack.includes(token));
  });
}
