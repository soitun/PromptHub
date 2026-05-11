# Implementation

## Implemented

- 更新 `apps/desktop/src/renderer/components/skill/SkillProjectsView.tsx`，统一左侧项目栏与右侧项目头部的最小高度，让三栏切换时头部线条保持对齐。
- 调整项目创建弹窗：优先选择项目根目录，根目录变化时自动推导项目名称，并把 `scanPaths` 明确为“额外扫描路径”。
- 新增项目创建后的自动选择与自动扫描流程，创建成功后立即触发 `scanProjectSkills(...)`，减少手动刷新步骤。
- 为项目列表卡片和项目详情头部增加首字母 avatar，在没有真实图标资源时仍能提供稳定识别。
- 更新 `apps/desktop/src/renderer/stores/settings.store.ts`，归一化 `skillProjects.scanPaths`，避免把 `rootPath` 重复保存到额外扫描路径中。
- 更新 `apps/desktop/tests/unit/components/skill-projects-view.test.tsx` 与 `apps/desktop/tests/unit/stores/skill.store.test.ts`，覆盖自动填名、自动扫描与 scan path 归一化行为。
- 同步补齐桌面端 7 个 locale 中与项目流程相关的新文案，避免仅 `en` / `zh` 生效。

## Verification

- `pnpm --filter @prompthub/desktop exec vitest run tests/unit/components/skill-projects-view.test.tsx tests/unit/stores/skill.store.test.ts`
  - 结果：通过（32/32）
- `pnpm --filter @prompthub/desktop exec vitest run tests/unit/services/skill-locale-regression.test.ts tests/unit/components/skill-detail-utils.test.ts tests/unit/components/skill-i18n-smoke.test.tsx tests/unit/services/i18n-init.test.ts tests/unit/stores/settings-language.test.ts`
  - 结果：通过（34/34）
- `pnpm --filter @prompthub/desktop lint`
  - 结果：通过
- `pnpm --filter @prompthub/desktop typecheck`
  - 结果：失败（受现有 `src/renderer/components/settings/AISettings.tsx` 与 `src/renderer/services/database-backup.ts` 的类型错误阻塞，非本次改动引入）
- `pnpm --filter @prompthub/desktop build`
  - 结果：通过

## Notes

- 聚焦测试中的既有 store 用例会输出两条预期 stderr：一个是 registry 拉取失败时回退缓存，另一个是 `loadSkills` mock 未返回数组时的已知日志。这两条日志未导致测试失败，也不是本次项目流程改动引入的回归。
