# Implementation

## Shipped

- 新增 `packages/core/src/cli/skill-cli-service.ts`，提供 standalone CLI 当前所需的最小 skill 能力：
  - 本地 `SKILL.md` / 目录安装
  - 托管 repo 判定与删除
  - 本地扫描预览
  - 平台卸载
- 在上述基础上继续补齐 standalone Phase 1 的安装入口：
  - 本地 `.json` skill 导入
  - 远程 `https://` SKILL.md 安装
  - GitHub repo 安装
- `packages/core/src/cli/skill-cli-service.ts` 现在支持通过依赖注入替换 `fetch` / `gitClone`，便于 standalone CLI 对远程安装链路做稳定测试。
- `packages/core/src/cli/run.ts` 改为可注入三类依赖：
  - runtime hooks
  - database hooks
  - skill service
- 新增 `packages/core/src/skills/install-flow.ts`，把 `source -> github / https / local dir / local file / json` 的安装分流逻辑抽成 shared orchestration helper。
- desktop `SkillInstaller.installFromSource()` 与 standalone `createCliSkillService().installFromSource()` 现在都复用同一个 shared install flow，减少行为漂移风险。
- desktop 内嵌 CLI 已整体移除：
  - 删除 `apps/desktop/src/cli/*`
  - 删除 `apps/desktop/src/main/desktop-cli.ts`
  - 删除 desktop 的 CLI bin、vite config 与相关单测
  - 删除 desktop package 中的 CLI `bin` / `exports` / `out/cli` / `cli:*` 脚本
- desktop 现在只在设置页 `About` 分组展示 standalone CLI 安装说明，不再承载任何 CLI 入口或打包职责。
- `packages/core/src/cli/run.ts` 不再直接依赖 desktop `SkillInstaller`，从而解除 `apps/cli` 对 `apps/desktop/src/main/services/*` 的编译和打包耦合。
- `apps/cli/src/index.ts` 与 `apps/cli/tests/run.test.ts` 改为通过 `@prompthub/core` 消费共享 CLI 入口。
- `apps/cli/tsconfig.json` 已收窄 `include` 与 alias 作用域，不再把 `apps/desktop/src/renderer/**/*.tsx` 卷入 standalone CLI typecheck。
- `apps/cli/vite.config.ts` 已去掉 desktop renderer 相关 alias，保证 standalone CLI bundle 只依赖 core/db/shared。
- 补充清理文档与 active spec 残留：修正多语言 README 命令表中的旧 desktop CLI 启动命令，并把设计文档中的迁移计划改写为当前已落地的迁移结果。
- 继续把原 desktop CLI 测试中仍然适用于 standalone 产品的高价值场景迁移到 `apps/cli/tests/run.test.ts`，补齐以下回归覆盖：
  - 全局参数缺值报错（`--data-dir`）
  - prompt `--tags` CSV 归一化
  - `--system-prompt` 与 `--system-prompt-file` 互斥校验
  - prompt 全生命周期（create -> update -> search -> delete -> get missing）
  - custom path `skill scan`
  - `skill delete --keep-platform-installs`
  - 平台卸载失败时的 `uninstallResults` rejected 原因回传

## Verification

- `pnpm --filter @prompthub/cli typecheck`
- `pnpm --filter @prompthub/cli test`
- `pnpm --filter @prompthub/cli test -- run.test.ts --run`
- `pnpm --filter @prompthub/cli build`
- `pnpm --filter @prompthub/cli lint`
- `pnpm --filter @prompthub/desktop typecheck`
- `pnpm --filter @prompthub/desktop lint`
- `pnpm --filter @prompthub/desktop test -- tests/unit/components/about-settings.test.tsx tests/unit/components/settings-page.test.tsx --run`
- `pnpm --filter @prompthub/desktop build`
- 仓库级搜索：确认 `pnpm --filter @prompthub/desktop cli:dev` 已无匹配，剩余 `desktop-cli` / `--cli` 命中仅存在于 active change 的历史记录文本中

说明：`pnpm --filter @prompthub/desktop test -- --run` 当前仍有与本次 CLI 拆分无关的历史失败项，本次改动已对 desktop 受影响范围做 lint/typecheck/定点 UI 测试与 build 验证。

## Synced Docs

- 本次仅更新 active change 执行记录，稳定域文档待 CLI Phase 1 收尾后一并同步。

## Follow-ups

- 后续继续评估是否把更多与 skills 相关的远程校验、认证 token、SSRF 防护和 richer export/import 能力从 desktop service 渐进抽到 `packages/core`。
- 评估是否把 CLI 相关 desktop 全量回归拆分成更细粒度测试文件，避免单文件执行在工具超时限制内被中断。
