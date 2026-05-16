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

- 状态：已完成（2026-05-16）
- 做了什么：
  - 新增 `apps/desktop` devDependency `rollup-plugin-visualizer`。
  - `apps/desktop/vite.config.ts`：把 config 改为 async factory，按 `BUILD_ANALYZE=1` 懒加载 visualizer（避免 ESM-only 包污染 vite-plugin-electron 的 CJS 配置加载）。
  - 新增 `apps/desktop/package.json` 脚本：`build:analyze`、`bundle:budget`。
  - 新增 `apps/desktop/scripts/check-bundle-budget.mts`：零外部依赖，按 glob 比对 gzipped 大小，超阈值非 0 退出。
  - 新增 `apps/desktop/bundle-budget.json`：8 项基线（主入口、markdown vendor、SettingsPage、ui vendor、react vendor、icons、i18n vendor、css 总量）；阈值给到当前实测 + 5–10% 缓冲。
  - 根 `.gitignore` 新增 `apps/desktop/dist-stats/`。
- 与计划偏差：
  - 计划写"按 `gzipSize`"，实际通过本地 `gzipSync` 直接计算，避免依赖 rollup metadata；优点是脚本不依赖任何构建器内部数据。
  - `bundle-budget.json` 中给 `markdown vendor` 标了 `required: false`，因为 P6 之后该 vendor 会被消解，这样未来 P6 不会因找不到该 chunk 而失败。
- 实测数字（baseline + budget）：

| chunk | actual gzip | budget |
| --- | --- | --- |
| `index-*.js` | 359.31 KB | 384 KB |
| `markdown-vendor` | 98.21 KB | 120 KB |
| `SettingsPage` | 49.07 KB | 60 KB |
| `ui-vendor` | 54.04 KB | 70 KB |
| `react-vendor` | 44.38 KB | 50 KB |
| `icons` | 13.51 KB | 18 KB |
| `i18n-vendor` | 14.96 KB | 20 KB |
| renderer css total | 19.48 KB | 30 KB |

- 验证：
  - `pnpm --filter @prompthub/desktop build` ✅
  - `pnpm --filter @prompthub/desktop build:analyze` ✅（`apps/desktop/dist-stats/renderer.html` 1.5 MB treemap）
  - `pnpm --filter @prompthub/desktop bundle:budget` ✅（8/8 通过）
  - `pnpm --filter @prompthub/desktop typecheck` ✅
  - `pnpm --filter @prompthub/desktop lint` ✅

### P2 — 设置页拆分

- 状态：**降级为 follow-up（2026-05-16）**
- 决策依据：在 P1 拿到精确数据 + 详细阅读 `DataSettings.tsx` (2774 行) 与 `AISettings.tsx` (2717 行) 结构后，重新评估 ROI：
  - `SettingsPage` chunk 已经只有 49 KB gzip，且本身已经从 `App.tsx` 通过 `lazy()` 在打开设置页时按需加载。它**不在首屏关键路径**上。
  - `DataSettings` 已按 `activeSubsection` 路由，只渲染当前激活面板，子面板的运行时 render cost 已经被裁剪。
  - 把它做成"每个 panel 一个文件 + panel 级 lazy"需要把 30+ 个 useState、若干 useEffect、几十个 handler 跨文件拆并通过 props 注入；diff 巨大、回归风险高、代码 review 困难。
  - 投入产出比远低于 P3（列表虚拟化，直接消除滚动卡顿）、P5（`skill.store` 拆分，直接砍主入口体积）、P6（移除 markdown-vendor 首屏强加载）。
- 调整方案：
  - 本次变更范围内**不做**完整物理拆分。
  - 设置页相关的可维护性清理作为后续独立 change 单独提案（`spec/changes/active/desktop-settings-modularization` 或类似 key），避免把它和性能调优混在一起。
  - 体积预算（P1 写入的 `bundle-budget.json`）保留对 `SettingsPage` 的阈值监控，确保不退化。
- 与计划偏差：`design.md` / `tasks.md` 中描述的 P2 物理拆分被推迟到独立 change。
- 实测数字：n/a（未执行物理拆分）

### P3 — 长列表虚拟化

- 状态：已完成（2026-05-16）
- 做了什么：
  - 新增 `apps/desktop` 依赖 `@tanstack/react-virtual ^3.13.x`。
  - 在 `apps/desktop/tests/setup.ts` 中注入全局 `vi.mock('@tanstack/react-virtual', ...)`，把 `useVirtualizer` 替换为"全量渲染"直通版，避免 jsdom 无真实布局导致测试找不到行节点；生产代码仍跑真正的虚拟化。
  - **`SkillListView`**：内部接管滚动容器（父级 `SkillManager` 在 list 模式下用 `overflow-hidden`），用 `useVirtualizer` 按行虚拟化；行高通过 `measureElement` 动态测量，初值 84 px；`getItemKey` 绑定 `skill.id` 让测得高度跨 reorder 不丢失。
  - **`PromptGalleryView`**：grid 模式按"行虚拟化"。新增 `getColumnsForSize(size, width)` 把 Tailwind 响应式断点显式翻译为列数，配合 `ResizeObserver` 跟踪可用宽度，应对 `prompt-list-pane` 的 `ColumnResizer` 实时拖拽。`estimateRowHeight` 由 `aspect-[4/3]` 加 ~120 px 的卡片底部估算。
  - **`PromptKanbanView`**：抽出 `<UnpinnedKanbanGrid>` 子组件做行虚拟化；保留 pinned section 的 `LayoutGroup` + `motion.div`（≤4 个、动画有意义），但 unpinned 卡片改用普通 `<div>`，避免虚拟化挂卸载与 framer-motion layout 动画产生帧抖。
  - **`MainContent.tsx`**：移除常量 `LARGE_PROMPT_LIST_THRESHOLD`、`INITIAL_PROMPT_RENDER_COUNT`、`PROMPT_RENDER_CHUNK_SIZE`、`PROMPT_RENDER_CHUNK_DELAY_MS`、`PROMPT_CARD_INTRINSIC_SIZE` 与对应的 `setTimeout` 分批渲染 `useEffect`；`renderedPromptCount` state 一并删除；新增 `<VirtualizedPromptList>` 子组件承接 list 视图，整页自此交给 virtualizer 控制渲染数量。
  - **`tests/integration/components/main-content-large-dataset.integration.test.tsx`**：原断言强依赖旧的 160-cap 分批渲染；改为断言"first + last + 完整数量"，与新的虚拟化契约对齐。
- 与计划偏差：
  - **Sidebar 文件夹树未虚拟化**：folder tree 通过 `dnd-kit` 的 `SortableTree` 渲染，dnd-kit 需要所有可拖动项处于同一 DnD context 才能正确感知坐标；强行嵌入虚拟化容器会引入拖拽回归。绝大多数用户的文件夹数量远低于 200，性价比低，**改为后续 follow-up**（`spec/changes/active/desktop-frontend-perf-tuneup` 的 follow-ups 段已记录）。
  - **未新增 `prompt-large-list.spec.ts` e2e**：现有 `tests/integration/components/main-content-large-dataset.integration.test.tsx` 覆盖了 1000 条数据集场景；继续追加 e2e 是 marginal value。也归入 follow-up。
- 实测数字（`pnpm build` + `pnpm bundle:budget`，相对 P1 baseline）：

| chunk | P1 baseline gzip | P3 实测 gzip | Δ |
| --- | --- | --- | --- |
| `index-*.js`（主入口） | 359.31 KB | 364.30 KB | +4.99 KB（virtualizer 入口） |
| `SkillListView-*.js` | 7.7 KB（raw） | 7.9 KB（raw） | 基本持平 |
| `PromptGalleryView-*.js` | 6.0 KB（raw） | 6.0 KB（raw） | 持平 |
| `PromptKanbanView-*.js` | 10.5 KB（raw） | 11 KB（raw） | +0.5 KB |

主入口体积小幅上涨是 `@tanstack/react-virtual` 进入首屏关键路径的代价；整体预算仍在 384 KB 阈值内。运行时收益：

- Skill 列表：从全量 `.map()` 改为只渲染可视 + overscan 6 行的 DOM，1000+ 条 skill 时 DOM 节点数从 O(n) 降到 O(visible)。
- Prompt 画廊：grid 行级虚拟化，1000 条 prompts 不再一次性挂载 2000+ DOM 节点。
- Prompt 看板：unpinned 区域同样行级虚拟化；pinned 仍保留 framer-motion 动画。
- MainContent：去除手写 `setTimeout` 分批渲染，避免分批延迟可见 + 滚动到底突然卡顿的体验缺陷。

- 验证：
  - `pnpm --filter @prompthub/desktop typecheck` ✅
  - `pnpm --filter @prompthub/desktop lint` ✅
  - `pnpm --filter @prompthub/desktop test:unit` ✅（132 test files / 1157 tests）
  - `pnpm --filter @prompthub/desktop test -- tests/integration --run` ✅（10/10 通过）
  - `pnpm --filter @prompthub/desktop build` ✅
  - `pnpm --filter @prompthub/desktop bundle:budget` ✅（8/8 阈值满足）

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

- **设置页物理拆分**：拆 `DataSettings.tsx` 与 `AISettings.tsx` 为子目录 + 二级 lazy，独立 change 推进（key 建议 `desktop-settings-modularization`）。
- **Sidebar 文件夹树虚拟化**：与 dnd-kit `SortableTree` 协作复杂，等出现 200+ 文件夹的实际投诉再单独评估（key 建议 `desktop-sidebar-tree-virtualization`）。
- **大列表 e2e**：把 `tests/e2e/prompt-large-list.spec.ts` 作为后续 e2e 加固的一部分（与 P3 跨工作流，单独提）。
- 评估 `framer-motion` 替换或精简（独立变更，单独 proposal）。
- 评估 `react-i18next` 按 namespace lazy load（独立变更）。
- 评估 `services/ai.ts` (2458 行)、`CreateSkillModal.tsx` (2144 行) 是否需要后续拆分（单独 proposal）。
- 评估 `settings.store.ts` (1776 行) 拆分（单独 proposal，本变更只动 `skill.store`）。
