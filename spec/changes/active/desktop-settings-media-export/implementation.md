# Implementation

## Shipped

- `DataSettings` 的升级快照区域改成“摘要 + 默认展示最新 3 条 + 展开后固定高度滚动区”，避免历史快照把整个设置页无限撑高。
- `AppearanceSettings` 增加桌面背景图设置：支持选择/更换/清除本地背景图，支持透明度与虚化调节，并在 `App.tsx` 根布局渲染背景层。
- 将全局背景控制权完全交还给用户：彻底移除了 `settings.store.ts` 中的透明度下限与模糊值强制映射逻辑，并将 UI 层面的滑块上限从 60% 放开到 100%（0-100 全区间调节），解决了背景图强制发白/发灰的 washed out 现象。
- 取消强加的底色与硬编码：
  1. 此前为了保证最极端情况下的文字可读性，强制在 UI 面板上叠加了 45% ~ 60% 的白/黑底色。现已将 `.app-background-mode-image` 中的底色透明度大幅降低（如 `shell` 降至 `transparent`，`panel` 降至 `0.15` ~ `0.2`）。
  2. 修复了 `settings.store.ts` 中 `clampBackgroundImageBlur` 错误地将最大虚化值锁死在 40 的问题，现在已完全开放为 0-100。
  3. 修改了默认行为：将默认图片虚化（`DEFAULT_BACKGROUND_IMAGE_BLUR`）从 6 降至 0，并将默认背景可见度（`DEFAULT_BACKGROUND_IMAGE_OPACITY`）从 0.22 提升至 1.0。
  4. 完全移除了图片模式下的 UI 面板（如 `.app-wallpaper-panel`）自带的 `backdrop-filter: blur(...)` 毛玻璃滤镜。现在整个应用的虚化和透明度 **完全且仅由** 用户在设置界面的两个滑块中控制。把真正的显示效果和取舍权（图片清晰度 vs 文字对比度）完全交还给用户。
- 全局清理破坏沉浸感的纯色卡片：移除了所有基础 UI 组件（如 `Button`, `Modal`）及业务页面（Sidebar, MainContent, 各设置页与技能库页）中硬编码的 `bg-card`、`bg-background`，统一接入 `app-wallpaper-surface`、`app-wallpaper-panel-strong` 等语义化玻璃层类，确保各种层级均能正确透出壁纸，且在亮/暗模式下均保持文字高可读性。
- 修复了图片模式下亮色模式文字不可读的问题：修复了 `.app-background-mode-image` 中对亮色模式变量的错误反转，将亮色模式下主文本加深至 15% 亮度、次要文本加深至 35% 亮度，边框改回浅灰，大幅提升了亮色模式对比度。
- 优化了虚化设置滑块体验：将虚化的调节范围设定为 0 到 50px，并且步长 (step) 设置为 0.5，以便于进行微调。
- 修复了“无背景图时 UI 也被透明化”的回归：将 `app-wallpaper-*` 的默认样式恢复为普通实心层级，只在 `.app-background-mode-image` 作用域下才启用透明/通透覆写；同时把 `App.tsx` 中背景图启用条件收紧为“存在非空白文件名”才切换图片模式。
- 修复了 Prompt 列表卡片的默认外观回归：将 `MainContent` 中卡片列表的未选中项和左侧列表容器恢复为提交前的 `bg-card` / `bg-card/50` 默认样式，并新增 `.prompt-list-card`、`.prompt-list-pane` 仅在图片模式下启用透明覆写，确保无图时与原始 UI 一致。
- 修复了“导入 PNG 后点击没反应”的核心链路：新增 `applyBackgroundImageSelection()`，在首次进入图片模式时自动写入可见的默认档（当前为 `opacity=0.88`、`blur=16`），避免沿用历史持久化里的低可见度参数；如果用户已经在图片模式中手调过参数，再次换图时保留当前调节值。
- 将图片模式从零散覆写收束为独立的 light/dark glass token 层：`globals.css` 新增一组语义化 surface / settings / prompt-list token，默认 UI 继续走基础 token，进入 `app-background-mode-image` 后再整体切换到图片模式主题，降低与默认 UI 的耦合，便于后续主题市场扩展。
- 加深了亮色图片模式的文本、次级文本、边框与玻璃面板层级，不再依赖 `text-shadow` 一类兜底手段；暗色图片模式也同步切到了同一套 token 体系，保持风格一致。
- `settings.store` 新增背景图文件名、透明度、虚化状态，补齐 `persist` version `5` migration、rehydrate 和 CSS 变量同步。
- Skill 导出主入口从详情视图收敛为 `SKILL.md` + `ZIP`，`ZIP` 通过新的 `skill:exportZip` 主进程 handler 直接从本地仓库打包整个目录。
- Skill ZIP 导出修正为按原始字节读取本地仓库文件，避免图片或其他二进制资源在导出时被文本占位符破坏。
- 补齐背景图与升级快照摘要相关 locale 文案到 `en`、`zh`、`zh-TW`、`ja`、`de`、`es`、`fr`。
- 新增/更新回归测试，覆盖背景图 store、升级快照默认折叠、ZIP 下载工具和 Skill 导出 UI。

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test -- --run tests/unit/main/skill-installer.test.ts tests/unit/components/skill-detail-utils.test.ts tests/unit/components/skill-i18n-smoke.test.tsx tests/unit/components/data-settings.test.tsx tests/unit/stores/settings-background-image.test.ts`
- `pnpm build`
- 本轮增量验证：`pnpm lint`
- 本轮增量验证：`pnpm --filter @prompthub/desktop test -- --run tests/unit/stores/settings-background-image.test.ts`

## Synced Docs

- active change 已同步：`tasks.md`、`implementation.md`
- 稳定 specs / architecture / docs 尚未同步

## Follow-ups

- 如果这组改动准备正式交付，再决定是否把 `specs` 中的稳定文档同步到 `spec/specs/` 或 `spec/architecture/`。
- PR #110 仍不建议直接合并；`ScannedSkill` 可空字段契约与 Hermes / nested 扫描测试缺口仍需单独处理。
