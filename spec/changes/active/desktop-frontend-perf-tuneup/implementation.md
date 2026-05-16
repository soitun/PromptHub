# Implementation

> 本文件随阶段推进**实时**更新。当前状态：**计划已落档，尚未开始实施。**

## Baseline (2026-05-16)

`pnpm --filter @prompthub/desktop build` 在 main `01f6874` (toolchain Node 24 升级后) 实测：

| chunk | size | gzip |
| --- | --- | --- |
| `index-*.js`（主入口） | 1.20 MB | 368 KB |
| `markdown-vendor` | 322 KB | 100 KB |
| `SettingsPage` | 194 KB | 50 KB |
| `ui-vendor`（framer-motion + dnd-kit） | 165 KB | 55 KB |
| `react-vendor` | 138 KB | 45 KB |
| `icons`（lucide-react） | 70 KB | 14 KB |
| `i18n-vendor` | 49 KB | 15 KB |
| 其它（按需） | n/a | n/a |
| `out/renderer/assets/*.css` | 99 KB | n/a |

vite 构建告警：`Some chunks are larger than 500 kB after minification`。

源码侧巨型文件（行数）：

| 文件 | 行数 |
| --- | --- |
| `apps/desktop/src/renderer/components/settings/DataSettings.tsx` | 2774 |
| `apps/desktop/src/renderer/components/settings/AISettings.tsx` | 2717 |
| `apps/desktop/src/renderer/components/layout/MainContent.tsx` | 2490 |
| `apps/desktop/src/renderer/services/ai.ts` | 2458 |
| `apps/desktop/src/renderer/components/skill/CreateSkillModal.tsx` | 2144 |
| `apps/desktop/src/renderer/stores/settings.store.ts` | 1776 |
| `apps/desktop/src/renderer/stores/skill.store.ts` | 1695 |
| `apps/desktop/src/renderer/components/layout/Sidebar.tsx` | 1603 |

虚拟化情况：`@tanstack/react-virtual` 与 `react-window` 均未引入；`MainContent.tsx` 内已存在手写分批渲染补丁（`INITIAL_PROMPT_RENDER_COUNT = 160`、`PROMPT_RENDER_CHUNK_SIZE = 160`、`PROMPT_RENDER_CHUNK_DELAY_MS = 24`）。

## Shipped

> 留空。每完成一个阶段填写"做了什么 + 与计划的偏差"。

### P1 — Bundle 可观测性

- 状态：未开始
- 做了什么：—
- 与计划偏差：—
- 实测数字：—

### P2 — 设置页拆分

- 状态：未开始
- 做了什么：—
- 与计划偏差：—
- 实测数字：—

### P3 — 长列表虚拟化

- 状态：未开始
- 做了什么：—
- 与计划偏差：—
- 实测数字：—

### P4 — Modal 状态解耦

- 状态：未开始
- 做了什么：—
- 与计划偏差：—
- 实测数字：—

### P5 — `skill.store` 拆分

- 状态：未开始
- 做了什么：—
- 与计划偏差：—
- 实测数字：—

### P6 — manualChunks 复核 + 体积预算收紧

- 状态：未开始
- 做了什么：—
- 与计划偏差：—
- 实测数字：—

## Verification

- 每阶段完成时记录：lint / typecheck / unit / integration / e2e:smoke / perf 的实际结果。
- 每阶段对应 PR 中附 `build:analyze` 前后对比截图或数字。

## Synced Docs

- 全部完成后同步：
  - `spec/domains/desktop/spec.md`：把虚拟化、设置页二级懒加载、bundle 预算作为稳定行为写入。
  - `spec/architecture/`：新增或更新桌面端 renderer 性能策略文档（如 `desktop-frontend-performance.md`）。
  - `docs/contributing.md`：补充"如何运行 build:analyze 与 budget 检查"。
- 完成后再把本变更从 `spec/changes/active/` 归档到 `spec/changes/archive/`。

## Follow-ups

- 评估 `framer-motion` 替换或精简（独立变更，单独 proposal）。
- 评估 `react-i18next` 按 namespace lazy load（独立变更）。
- 评估 `services/ai.ts` (2458 行)、`CreateSkillModal.tsx` (2144 行) 是否需要后续拆分（单独 proposal）。
- 评估 `settings.store.ts` (1776 行) 拆分（单独 proposal，本变更只动 `skill.store`）。
