# Tasks

按 commit 边界组织。每 commit 都应能独立通过 typecheck / lint / test / build / bundle:budget。

## C1 — Motion tokens + reduced-motion defaults

- [ ] 新建 `apps/desktop/src/renderer/styles/motion-tokens.ts`（duration / easing / scale / translate / stagger）
- [ ] 同步 `apps/desktop/tailwind.config.js`（`transitionDuration`、`transitionTimingFunction`、`scale` 命名扩展）
- [ ] `apps/desktop/src/renderer/styles/globals.css`：加 CSS 变量；加 `@media (prefers-reduced-motion: reduce)` 全局降级；加 `html[data-motion="off|reduced|standard"]` 选择器
- [ ] 删除 `globals.css` 中未使用的 `@keyframes fadeIn / slideUp / scaleIn / floatSoft` 与对应的 `.animate-fadeIn / .animate-slideUp / .animate-scaleIn / .animate-floatSoft`
- [ ] 跑 `pnpm lint` `pnpm typecheck` `pnpm build` `pnpm bundle:budget` 全绿

## C2 — Motion components + 用户偏好

- [ ] 新建 `apps/desktop/src/renderer/components/ui/motion/Reveal.tsx`
- [ ] 新建 `apps/desktop/src/renderer/components/ui/motion/Collapsible.tsx`
- [ ] 新建 `apps/desktop/src/renderer/components/ui/motion/ViewTransition.tsx`
- [ ] 新建 `apps/desktop/src/renderer/components/ui/motion/Pressable.tsx`
- [ ] 新建 `apps/desktop/src/renderer/components/ui/motion/index.ts`（统一导出）
- [ ] `apps/desktop/src/renderer/stores/settings.store.ts`：加 `motionPreference: 'off' | 'reduced' | 'standard'`、`setMotionPreference(value)` action（默认 `'standard'`，加 persist 字段）
- [ ] `apps/desktop/src/renderer/components/settings/AppearanceSettings.tsx`：暴露 3 档选择器
- [ ] 在顶层组件（`App.tsx` 或 `main.tsx`）写 effect：把 `motionPreference` 同步到 `document.documentElement.dataset.motion`
- [ ] 7 个 locale 文件（en / zh / zh-TW / ja / fr / de / es）添加 5 个 i18n key：`settings.motion.title / off / reduced / standard / desc`
- [ ] 给 4 个 motion 组件写最小单测（mount + prop 切换 + 断言 className）
- [ ] 跑全套绿

## C3 — 仓库迁移到 token

- [ ] 替换裸 duration（用 grep + sed 或编辑器全局替换）：
  - [ ] `duration-100` → `duration-instant`（4 处）
  - [ ] `duration-150` → `duration-quick`（13 处）
  - [ ] `duration-200` → `duration-base`（70 处）
  - [ ] `duration-300` → `duration-smooth`（17 处）
  - [ ] `duration-500` → `duration-slow`（3 处）
- [ ] 替换 scale：`active:scale-90` 与 `active:scale-95` 统一为 `active:scale-press-in`
- [ ] 替换手写 spinner：`apps/desktop/src/renderer/components/prompt/PromptEditor.tsx` 把 `<span className="border-2 ... animate-spin">` 改为 `<Loader2Icon className="animate-spin">`
- [ ] 跑全套绿；视觉 diff 抽检

## C4 — 补齐缺失动画

- [ ] `MainContent.tsx` 中 `<PromptCard>`：`bg-primary` 切换加 `transition-colors duration-quick`
- [ ] `MainContent.tsx` 中 `selectedPrompt` 详情区：把 `animate-in fade-in slide-in-from-right-3 duration-200` 移到 `<div key={selectedPrompt.id}>` 的内层，让重选不重播
- [ ] `MainContent.tsx` 中 view mode 切换（list / gallery / kanban）：用 `<ViewTransition activeKey={viewMode}>` 包裹
- [ ] `Sidebar.tsx` 中 `showAllTags` 与 `showAllSkillTags` 折叠区：用 `<Collapsible>` 替代直接 toggle
- [ ] `Toast.tsx` 删除 toast 时：加 `animate-out fade-out duration-quick`
- [ ] `Modal.tsx` 入场 / 出场曲线统一到 `ease-enter` / `ease-exit`，时长统一到 `duration-base` / `duration-quick`
- [ ] `ContextMenu.tsx` 与 `Select.tsx` 的下拉入场曲线统一
- [ ] 跑全套绿；手动验收

## C5 — 卸 framer-motion

- [ ] `PromptKanbanView.tsx` 中 pinned section 的 `LayoutGroup` + `motion.div` 改为 `<Reveal intent="enter">` + Tailwind transition
- [ ] 卸 `framer-motion` 依赖：`pnpm --filter @prompthub/desktop remove framer-motion`
- [ ] `apps/desktop/vite.config.ts`：从 `ui-vendor` manualChunk 中移除 `framer-motion`
- [ ] `apps/desktop/bundle-budget.json`：把 `ui-vendor` 阈值从 70 KB 收紧到能 lock 住新基线（预计 ~40 KB）
- [ ] 跑全套绿；`bundle:budget` 显示 `ui-vendor` 收缩

## C6 — 同步稳定文档

- [ ] 新建 `spec/architecture/desktop-frontend-animation.md`（token 取值、意图分类表、禁用清单、缺失补齐清单、reduced-motion 策略）
- [ ] `spec/domains/desktop/spec.md`：加章节"Renderer Motion System"，固化 token 必须存在、必须支持 `motionPreference`、必须尊重 `prefers-reduced-motion`
- [ ] 更新 `implementation.md`，记录每个 commit 的实测数据与偏差
- [ ] 在 follow-ups 中记录"未做的 expressive 档"等延后项

## Cross-cutting

- [ ] 所有 commit 跑过 `pnpm --filter @prompthub/desktop typecheck && lint && test:unit && test:integration && build && bundle:budget`
- [ ] PR 描述附 motionPreference 3 档体感对比（GIF / 视频）
