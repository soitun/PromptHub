# Desktop Spec

## Purpose

本规范定义 PromptHub 桌面端的稳定产品与工程边界。

## Stable Requirements

### 1. Product Role

- `apps/desktop` 是 PromptHub 的本地优先桌面应用主入口。
- 桌面端负责本地数据管理、原生 OS 集成、加密/主密码能力、数据库索引、文件系统工作区与 IPC 能力。

### 2. Process Boundary

- 原生文件系统、数据库、加密、备份恢复、平台集成等能力必须位于主进程。
- 渲染进程通过 preload 暴露的 API 与主进程通信，不直接跨边界访问主进程能力。

### 3. Stable Internal Sources

- 长期工程边界和代码结构治理见 `spec/architecture/code-structure-guidelines.md`。
- 数据布局与迁移事实见 `spec/architecture/data-layout-v0.5.5-zh.md`。
- Rules 工作台稳定逻辑见 `spec/logic/rules-workspace.md`。
- 历史 desktop 相关演进记录保存在 `spec/changes/legacy/docs-08-todo/`。

### 4. Card Detail Editing

- 桌面端 card view 的右侧 Prompt 详情区应支持不离开当前上下文的轻量快速编辑，用于修改选中 Prompt 的标题和当前可见的用户提示词；标题展示态应支持双击直接进入该快速编辑。
- 完整字段编辑仍由专门的 Prompt 编辑弹窗承担；轻量快速编辑不应替代完整编辑流程。

### 5. AI Workbench Protocol Routing

- 桌面端 AI workbench 必须为每个聊天模型持久化显式 `apiProtocol`，当前稳定支持 `openai`、`gemini`、`anthropic` 三种协议。
- 预制 provider 仅用于默认 base URL、推荐协议和展示文案，不是最终请求协议的唯一来源；自定义 provider 也可以显式选择 `Gemini` 或 `Anthropic` 协议。
- renderer 与 main process 的聊天请求和模型发现请求必须按 `apiProtocol` 分支构造 endpoint 与鉴权头，避免继续只按 provider 或 host 猜测协议。
- `Anthropic` 当前稳定行为为原生 `POST /v1/messages` 非流式聊天与 `GET /v1/models` 模型发现；在补齐原生 SSE 解析前，桌面端不应把 Claude 原生协议暴露为可流式聊天能力。

## Stable Scenarios

### Scenario: Contributor changes desktop runtime behavior

When a contributor changes desktop runtime behavior materially:

- they create a delta spec under `spec/changes/active/<change-key>/specs/desktop/spec.md`
- they sync durable behavior back into `spec/domains/desktop/spec.md` after implementation

### Scenario: User needs public desktop usage information

When a user needs installation or usage help:

- the public entry remains `README.md` and localized docs under `docs/`
- internal architecture and implementation history remain in `spec/`
