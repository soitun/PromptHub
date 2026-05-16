# Implementation

> 本文件随 commit 推进**实时**更新。当前状态：**计划已落档，开始实施。**

## Baseline (2026-05-16)

`grep` 在 `apps/desktop/src/renderer/**/*.tsx` 的实测分布：

| 维度 | 实测 |
| --- | --- |
| `transition-colors` | 501 处 |
| `transition-all` | 118 处 |
| `transition-opacity` | 18 处 |
| `transition-transform` | 17 处 |
| `transition-shadow` | 3 处 |
| `duration-200` | 70 处 |
| `duration-300` | 17 处 |
| `duration-150` | 13 处 |
| `duration-100` | 4 处 |
| `duration-500` | 3 处 |
| `duration-0` | 1 处 |
| `ease-out` | 5 处 |
| `ease-in-out` | 3 处 |
| `active:scale-95` | 15 处 |
| `active:scale-90` | 7 处 |
| `framer-motion` import | 1 文件（`PromptKanbanView.tsx`） |
| `globals.css` 死 keyframes | 4（`fadeIn / slideUp / scaleIn / floatSoft`） |
| `prefers-reduced-motion` 处理 | 0 |
| `motionPreference` 用户偏好 | 不存在 |

bundle 体积（gzip，本变更前一次 build）：

| chunk | gzip |
| --- | --- |
| `index-*.js`（主入口） | 364.29 KB |
| `ui-vendor`（含 framer-motion + dnd-kit） | 54.04 KB |

## Shipped

> 留空。每个 commit 完成后填写"做了什么 + 偏差 + 数字"。

### C1 — Motion tokens + reduced-motion defaults

- 状态：已完成（2026-05-16）
- 做了什么：
  - 新建 `apps/desktop/src/renderer/styles/motion-tokens.ts`：5 维 token（duration / easing / scale / translate / stagger），命名常量 `MOTION_DURATION` 等，兼顾纯 JS 与组合导出 `MOTION`。
  - 同步到 `apps/desktop/tailwind.config.js`：`transitionDuration`、`transitionTimingFunction`、`scale`、`animationDuration`、`animationTimingFunction` 五处 extend，全部用语义名（`instant / quick / base / smooth / slow` × `standard / enter / exit / emphasized`）。
  - `apps/desktop/src/renderer/styles/globals.css`：在 keyframes 块原位插入 motion system 三层：CSS 变量 → `@media (prefers-reduced-motion: reduce)` 全局降级 → `html[data-motion="off|reduced|standard"]` 选择器。`standard` 显式覆盖 OS 级偏好。
  - 删除 `globals.css` 中 `@keyframes fadeIn / slideUp / scaleIn / floatSoft` 与对应 `.animate-*` 工具类（grep 确认零调用方）。
- 偏差：无。
- 实测：CSS gzip 19.59 KB（baseline 19.45 KB，+0.14 KB；CSS 变量与新增的 reduced-motion 媒体查询）；其他 chunk 全部持平。typecheck / lint / build / bundle:budget 全绿。

### C2 — Motion components + 用户偏好

- 状态：已完成（2026-05-16）
- 做了什么：
  - 4 个 motion primitive：`Pressable`（按下微反馈，统一 `active:scale-press-in`）、`Reveal`（入场/出场，意图驱动）、`Collapsible`（CSS-only `grid-rows` 折叠）、`ViewTransition`（cross-fade，基于 `key` + `tailwindcss-animate`）。
  - `apps/desktop/src/renderer/components/ui/motion/index.ts`：统一导出。
  - `settings.store.ts`：加 `motionPreference: 'off' | 'reduced' | 'standard'`（默认 `'standard'`）和 `setMotionPreference`；走现有 `prompthub-settings` localStorage 持久化。
  - `App.tsx`：新增 useEffect，把 `motionPreference` 同步到 `<html data-motion>`，初值取自 store，避免启动闪现。`useSettingsStore.subscribe` 监听变化。
  - `AppearanceSettings.tsx`：在 fontSize section 之后插入 Motion section，3 档分段控件。
  - 7 个 locale 文件加 `settings.motion.{title,desc,off,reduced,standard}` 5 个 key。
  - 单测 `tests/unit/components/motion-primitives.test.tsx`：8 个用例覆盖 4 个组件的关键行为（class 应用、状态切换、event 转发、durationToken 覆盖、`activeKey` remount）。
- 偏差：无。
- 实测：
  - 主入口 364.31 → 365.04 KB（+0.73 KB，加入 4 个组件 + motionPreference state + 同步 effect）
  - SettingsPage 49.07 → 49.26 KB（+0.19 KB，AppearanceSettings 加 Motion section）
  - CSS gzip 19.59 → 19.80 KB（+0.21 KB）
  - test:unit 1157 → 1165（+8 motion 用例）
  - 全部预算通过。typecheck / lint / build 全绿。

### C3 — 仓库迁移到 token

- 状态：已完成（2026-05-16）
- 做了什么：
  - 全仓 perl `\b`-边界替换：
    - `duration-100 → duration-instant` (4 处)
    - `duration-150 → duration-quick` (13 处)
    - `duration-200 → duration-base` (~70 处)
    - `duration-300 → duration-smooth` (17 处)
    - `duration-500 → duration-slow` (3 处)
  - 全仓 `active:scale-90 / active:scale-95 → active:scale-press-in` (24 处)，统一按下力度。
  - `PromptEditor.tsx`：手写 `<span className="border-2 border-white/30 border-t-white rounded-full animate-spin">` 改为 `<Loader2Icon className="w-3 h-3 animate-spin" />`，与仓库其它 11 处 spinner 风格一致；同步加 `Loader2Icon` 到 lucide-react 命名 import。
  - 验证 `tests/` 目录下无 duration 裸值需要迁移。
- 偏差：无。`duration-0`（1 处）保留，因为它语义上是"立即（无过渡）"，token 体系里的"instant"指 80ms 微动效，两者不等价。
- 实测：1165/1165 测试通过；主入口 365.04 → 365.07 KB（+0.03 KB，几乎无影响，class 名称变化对 gzip 不敏感）；bundle 全绿。

### C4 — 补齐缺失动画

- 状态：未开始

### C5 — 卸 framer-motion

- 状态：未开始

### C6 — 同步稳定文档

- 状态：未开始

## Verification

- 每 commit 跑：`typecheck` `lint` `test:unit` `test:integration` `build` `bundle:budget`
- C5 后期望：`ui-vendor` chunk 显著下降；主入口持平或略降；`bundle-budget.json` 中 `ui-vendor` 阈值收紧

## Synced Docs

- `spec/architecture/desktop-frontend-animation.md`（C6 完成后落地）
- `spec/domains/desktop/spec.md` 增加 Renderer Motion System 章节（C6 完成后落地）

## Follow-ups

- **expressive 档**：第 4 档动画（强调性、稍微夸张），等用户实际反馈再做（key 建议 `desktop-motion-expressive-tier`）。
- **ESLint 自定义规则禁裸 duration**：等出现回归再加（key 建议 `desktop-motion-lint-enforcement`）。
- **View Transition API 试点**：未来如果 Electron 把 Chromium 升到稳定支持，可在视图切换中考虑（key 建议 `desktop-view-transition-api`）。
- **完整动画演示页**：在设置页或开发者工具区做一个"动画实验场"，展示所有 motion 组件的视觉效果，帮助 review。
