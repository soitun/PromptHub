# Implementation

## Shipped

- 新建 active change: `unified-sync-abstraction`。
- 完成 proposal/spec/design/tasks 文档，明确统一同步抽象目标与迁移路线。
- 输出统一接口草案与四阶段迁移计划。
- 新增 Desktop renderer 编排层：`apps/desktop/src/renderer/services/backup-orchestrator.ts`。
- 将 Desktop 手动备份入口切换到编排层：
	- `apps/desktop/src/renderer/components/settings/DataSettings.tsx`
	- `apps/desktop/src/renderer/components/UpdateDialog.tsx`
- 当前行为保持不变：仍然先创建本地升级快照，再执行文件导出，并按版本记录手动备份状态。

## Verification

- 设计依据来自现有代码路径审计：
- Web 同步路由与 provider 限定：`apps/web/src/routes/sync.ts`
- Desktop 自托管同步独立流程：`apps/desktop/src/renderer/services/self-hosted-sync.ts`
- Desktop WebDAV 同步独立流程：`apps/desktop/src/renderer/services/webdav.ts`
- 共享设置 provider 枚举与现实能力不一致：`packages/shared/types/settings.ts`

- 当前环境执行 `pnpm --filter @prompthub/web test -- src/routes/sync.test.ts --run` 失败，原因为 `ipaddr.js` 依赖解析失败（测试环境问题），非本设计文档引入。
- 本次改动后执行文件级错误检查通过：
	- `apps/desktop/src/renderer/services/backup-orchestrator.ts`
	- `apps/desktop/src/renderer/components/settings/DataSettings.tsx`
	- `apps/desktop/src/renderer/components/UpdateDialog.tsx`
- 本次未新增自动化测试；后续在 orchestrator 扩展到 WebDAV / self-hosted 入口时统一补齐。

## Synced Docs

- 本次仅新增 active change 文档，尚未回写稳定域文档。

## Follow-ups

- 先完成 Phase 1（契约与 orchestrator 壳层），不改变用户可见行为。
- 在 Phase 2 引入 feature flag 后，再做路由/入口切换。
- 下一步优先：将 WebDAV / self-hosted 手动入口接入 orchestrator，并补统一结果模型（success/partial/failure + stage details）。
