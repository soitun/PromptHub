# Design

## Target Shape

```text
apps/
  desktop/
  web/
  cli/

packages/
  shared/
  db/
  core/
```

## Phase 1 Architecture

### `packages/core`

先承载最小共享核心：

- `runtime-paths.ts`
- `database.ts`
- `cli/run.ts`

其中：

- `runtime-paths.ts` 负责 PromptHub 工作区目录协议。
- `database.ts` 负责基于 runtime paths 初始化 `@prompthub/db`。
- `cli/run.ts` 承载当前 CLI 命令实现。

### `apps/cli`

只负责产品包装：

- `src/index.ts` 启动 CLI
- `bin/prompthub.cjs` npm bin 入口
- `vite.config.ts` 构建 CLI bundle
- `package.json` 脚本与发布元数据

### `apps/desktop`

不再承载 CLI 入口或打包物：

- desktop 主进程不再响应 `--cli`
- desktop 包不再导出 `bin/prompthub.cjs` 或 `out/cli`
- desktop 设置页只保留 standalone CLI 安装说明

## Shared Runtime Contract

抽离后 `packages/core/runtime-paths.ts` 需要成为工作区协议的单一来源，定义：

- appData
- userData
- data dir
- skills dir
- rules dir
- prompts dir
- assets dir

desktop 与 cli 必须调用同一实现。

## Migration Outcome

1. CLI 共享入口与安装编排已沉淀到 `packages/core`。
2. `apps/cli` 现在直接依赖 `packages/core`，作为唯一 CLI 产品入口。
3. `apps/desktop/src/cli/*` 与 `apps/desktop/src/main/desktop-cli.ts` 已删除，desktop main 不再承载 `--cli` 模式。
4. desktop 仍保留自己的恢复/升级逻辑，但不再承担 CLI 启动、打包或分发职责。
