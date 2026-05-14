# Proposal

## Why

PromptHub 仓库当前已经存在一个挂在 `apps/desktop` 包内的 CLI，但它仍直接依赖 desktop main 代码与打包链路，不是独立产品。目标是将 CLI 升级为 `apps/cli` 下的独立产品，允许用户单独安装，同时与桌面版共享同一套工作区目录结构与业务核心，而不影响桌面版现有行为。

## Scope

- In scope:
- 新增 `apps/cli` 独立产品骨架。
- 新增共享核心包，先抽离运行时路径协议与数据库 bootstrap。
- 迁移现有 desktop CLI 能力到共享实现，并让 `apps/cli` 成为唯一 CLI 产品入口。
- 删除 desktop 内嵌 CLI 入口与打包物，仅在设置页保留安装说明。

- Out of scope:
- 一次性抽离所有 desktop main 服务。
- 完成 CLI 对全部 GUI 功能的等价覆盖。

## Risks

- 运行时路径与数据库初始化是 desktop / web / cli 的交汇点，若抽离不当会影响现有桌面数据目录与启动逻辑。
- CLI 现有测试直接依赖 desktop 路径，需要在迁移时保持兼容。

## Rollback Thinking

- 如果共享核心抽离影响 desktop 启动，优先回退 shared helper 的接入点，但不恢复 desktop 内嵌 CLI 产品形态。
