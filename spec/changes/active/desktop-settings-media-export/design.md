# Design

## Overview

这次改动拆成三条独立但轻量的链路：

1. `DataSettings` 内的升级快照列表改成“摘要 + 默认前几项 + 展开后的滚动容器”。
2. `AppearanceSettings` 基于现有 `window.electron` 图片存储能力保存背景图文件名，设置里只持久化引用与展示参数。
3. Skill 导出增加 `skill:exportZip`，由主进程直接读取 Skill 本地仓库并打 zip，前端只负责下载结果。

## Affected Areas

- Data model:
- `packages/shared/types/settings.ts` 增加桌面背景图相关字段
- `apps/desktop/src/renderer/stores/settings.store.ts` 增加默认值、setter、hydrate/migrate 与主题应用逻辑

- IPC / API:
- `packages/shared/constants/ipc-channels.ts` 增加 `skill:exportZip`
- `apps/desktop/src/preload/api/skill.ts` 与 `preload/index.ts` 暴露 zip 导出
- `apps/desktop/src/main/ipc/skill/crud-handlers.ts` 增加 zip 导出 handler

- Filesystem / sync:
- 背景图复用现有 `image:save` / `local-image://` 链路，把文件保存在应用图片目录
- Skill zip 导出通过主进程读取本地 repo 目录并使用 `fflate` 打包，确保导出整个文件夹
- 设置备份仍通过 `settings-snapshot.ts` 捕获背景图配置，图像文件本身由现有图片目录备份链路覆盖

- UI / UX:
- `DataSettings` 为升级回滚列表增加计数摘要、展开控制和独立滚动区域
- `AppearanceSettings` 增加桌面背景图预览、选择、清除、透明度和虚化滑杆
- `App.tsx` 在根布局下注入背景层，不大面积修改现有布局组件
- Skill 详情导出按钮改为 `SKILL.md` + `ZIP`

## Tradeoffs

- 背景图继续放在通用图片目录，而不是单独开 `backgrounds/` 目录。优点是复用现有读写链路；代价是目录里会混合 Prompt 图片和背景图，但对当前产品成本最低。
- Skill zip 导出直接返回 base64 zip 内容给渲染层下载，而不是弹系统保存框。优点是保持现有下载交互一致；代价是大仓库会经过一次 renderer 桥接，但 Skill 仓库规模在当前场景下可接受。
- 回滚列表默认只展开前几项，牺牲了“全部立即可见”，换取设置页总体可读性和纵向稳定性。
