<div align="center">
  <img src="./imgs/icon.png" alt="PromptHub Logo" width="120" height="120" />
  <h1>PromptHub</h1>
  <p><strong>🚀 An all-in-one AI toolbox for prompts, skills, and agent assets</strong></p>
  <p>Reuse prompts · Distribute skills in one click · Manage agent assets · Cloud sync · Backup · Version control</p>
  
  <p>
    <a href="https://github.com/legeling/PromptHub/stargazers"><img src="https://img.shields.io/github/stars/legeling/PromptHub?style=flat-square&color=yellow" alt="GitHub Stars"/></a>
    <a href="https://github.com/legeling/PromptHub/network/members"><img src="https://img.shields.io/github/forks/legeling/PromptHub?style=flat-square" alt="GitHub Forks"/></a>
    <a href="https://github.com/legeling/PromptHub/releases"><img src="https://img.shields.io/badge/preview-v0.5.6--beta.1-8B5CF6?style=flat-square" alt="Version"/></a>
    <a href="https://github.com/legeling/PromptHub/releases"><img src="https://img.shields.io/github/downloads/legeling/PromptHub/total?style=flat-square&color=blue" alt="Downloads"/></a>
    <img src="https://img.shields.io/badge/license-AGPL--3.0-blue?style=flat-square" alt="License: AGPL-3.0"/>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/Electron-33-47848F?style=flat-square&logo=electron&logoColor=white" alt="Electron"/>
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="TailwindCSS"/>
  </p>
  
  <p>
    <a href="../README.md">简体中文</a> ·
    <a href="./README.zh-TW.md">繁體中文</a> ·
    <a href="./README.en.md">English</a> ·
    <a href="./README.ja.md">日本語</a> ·
    <a href="./README.de.md">Deutsch</a> ·
    <a href="./README.es.md">Español</a> ·
    <a href="./README.fr.md">Français</a>
  </p>
</div>

<br/>

<div align="center">
  <a href="https://github.com/legeling/PromptHub/releases">
    <img src="https://img.shields.io/badge/📥_Download_now-Releases-blue?style=for-the-badge&logo=github" alt="Download"/>
  </a>
</div>

<br/>

> 💡 **Why PromptHub?**
>
> PromptHub is more than a prompt manager. It is a local-first workspace for prompts, SKILL.md skills, and agent assets. Organize prompts, scan and distribute skills to Claude Code, Cursor, Windsurf, Codex, and 15+ AI tools, then keep personal and project AI assets portable with cloud sync, backup, version control, and privacy-first local storage.

---

## How to Use PromptHub

| Format | Best for | Core value |
| ------ | -------- | ---------- |
| Desktop App | Most individual users, heavy prompt users, AI coding workflows | A local-first primary workspace for prompts, skills, and project-level AI assets |
| Self-Hosted Web | Browser access, personal self-hosting, using Web as a backup/restore target | A lightweight browser workspace that can act as a desktop sync target |
| CLI | Batch workflows, scripts, automation, pipelines | Direct access to local PromptHub data and managed skill repositories |

If you are new to PromptHub, the recommended path is:

1. Start with the desktop app to organize prompts and skills.
2. Add WebDAV or self-hosted PromptHub Web when you need browser access or cross-device backup.
3. Add the CLI when you need automation.

## 📸 Screenshots

<div align="center">
  <p><strong>Main Interface</strong></p>
  <img src="./imgs/1-index.png" width="80%" alt="Main Interface"/>
  <br/><br/>
  <p><strong>Skill Store</strong></p>
  <img src="./imgs/10-skill-store.png" width="80%" alt="Skill Store"/>
  <br/><br/>
  <p><strong>Skill Detail and Platform Install</strong></p>
  <img src="./imgs/11-skill-platform-install.png" width="80%" alt="Skill Detail and Platform Install"/>
  <br/><br/>
  <p><strong>Skill File Editing and Version Diff</strong></p>
  <img src="./imgs/12-skill-files-version-diff.png" width="80%" alt="Skill File Editing and Version Diff"/>
  <br/><br/>
  <p><strong>Data Backup</strong></p>
  <img src="./imgs/4-backup.png" width="80%" alt="Data Backup"/>
  <br/><br/>
  <p><strong>Theme & Background Settings</strong></p>
  <img src="./imgs/5-theme.png" width="80%" alt="Theme & Background Settings"/>
  <br/><br/>
  <p><strong>Version Compare</strong></p>
  <img src="./imgs/8-version-compare.png" width="80%" alt="Version Compare"/>
</div>

## ✨ Features

### 📝 Prompt Management

- Create, edit, and delete with folders and tags
- Auto-save version history with compare and rollback
- Template variables `{{variable}}` for copy, testing, and distribution flows
- Favorites, full-text search, attachments, and media previews

### 🧩 Skill Distribution & Management

- **Skill Store**: 20+ curated skills from Anthropic, OpenAI, and more
- **Multi-Platform Install**: One-click install to Claude Code, Cursor, Windsurf, Codex, Kiro, Gemini CLI, Qoder, QoderWork, CodeBuddy, and 15+ platforms
- **Local Scan**: Discover local `SKILL.md` files, preview them, and import selectively
- **Symlink/Copy Mode**: Keep edits synced via symlink or copy independently
- **Platform Target Directories**: Override skill directories per platform while keeping scan and distribution aligned
- **AI Translation & Polishing**: Translate or refine full skill content from inside PromptHub
- **Tag Filtering**: Filter skills quickly from the sidebar

### 🤖 Project and Agent Assets

- Scan common project folders such as `.claude/skills`, `.agents/skills`, `skills`, and `.gemini`
- Manage personal libraries, local repos, and project-level AI assets from one place
- Keep prompts, skills, and project assets portable with local-first storage, sync, and backup

### 🧪 AI Testing & Generation

- Built-in AI testing for mainstream providers
- Parallel prompt comparison across multiple models
- Image generation model testing
- AI-assisted skill generation and polishing

### 💾 Data & Sync

- All data stored locally, privacy-first
- Full backup and restore with `.phub.gz`
- WebDAV sync (Nutstore, Nextcloud, and more)
- Use self-hosted PromptHub Web as a desktop backup and restore target
- Startup sync and scheduled sync

### 🎨 UI & Security

- Card, gallery, and list views
- Dark, light, and system themes with custom colors
- Custom background images
- 7 languages, markdown rendering, code highlight, and cross-platform support
- Master password protection
- Private folders (beta)

## 📥 Desktop Download & Installation

If you are getting started, begin with the desktop app.

### Download

Download the latest preview build `v0.5.6-beta.1` from [Releases](https://github.com/legeling/PromptHub/releases):

| Platform |                                                                                                                                                                                                                Download                                                                                                                                                                                                                 |
| :------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| Windows  | [![Windows x64](https://img.shields.io/badge/Windows_x64-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/legeling/PromptHub/releases/download/v0.5.6-beta.1/PromptHub-Setup-0.5.6-beta.1-x64.exe) [![Windows arm64](https://img.shields.io/badge/Windows_arm64-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/legeling/PromptHub/releases/download/v0.5.6-beta.1/PromptHub-Setup-0.5.6-beta.1-arm64.exe) |
|  macOS   |   [![macOS Apple Silicon](https://img.shields.io/badge/macOS_Apple_Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/legeling/PromptHub/releases/download/v0.5.6-beta.1/PromptHub-0.5.6-beta.1-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS_Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/legeling/PromptHub/releases/download/v0.5.6-beta.1/PromptHub-0.5.6-beta.1-x64.dmg)   |
|  Linux   |       [![Linux AppImage](https://img.shields.io/badge/Linux_AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/legeling/PromptHub/releases/download/v0.5.6-beta.1/PromptHub-0.5.6-beta.1-x64.AppImage) [![Linux deb](https://img.shields.io/badge/Linux_deb-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/legeling/PromptHub/releases/download/v0.5.6-beta.1/prompthub_0.5.6-beta.1_amd64.deb)        |
| Preview  | [![Preview Prereleases](https://img.shields.io/badge/Preview_Prereleases-8B5CF6?style=for-the-badge&logo=github&logoColor=white)](https://github.com/legeling/PromptHub/releases?q=prerelease%3Atrue) |

> 💡 **Install tips**
>
> - **macOS**: Apple Silicon (M1/M2/M3/M4) should use `arm64`; Intel Macs should use `x64`
> - **Windows**: Most devices should use `x64`; only Windows on ARM devices should use `arm64`
> - **Preview channel**: Preview builds are published as GitHub `Prereleases`; enabling the preview channel in Settings checks prerelease builds only
> - **Back to stable**: Turn the preview channel off before returning to stable checks; PromptHub never auto-downgrades from a newer preview build to an older stable release

### macOS Install via Homebrew

```bash
brew tap legeling/tap
brew install --cask prompthub
```

### Homebrew Upgrade Path

If you installed PromptHub via Homebrew, use Homebrew for future upgrades and do not mix it with the in-app DMG flow:

```bash
brew update
brew upgrade --cask prompthub
```

If the local Homebrew state looks inconsistent, reinstall the current cask:

```bash
brew reinstall --cask prompthub
```

> - Users who installed via DMG should use the in-app updater or download from GitHub Releases.
> - Users who installed via Homebrew should use `brew upgrade --cask prompthub` and should not switch to the in-app DMG install path.
> - Mixing both upgrade paths can leave Homebrew's recorded version out of sync with the actual app bundle on disk.

### macOS First Launch

Since the app is not notarized by Apple, you may see **"PromptHub is damaged and can't be opened"** or **"Cannot verify developer"** on first launch.

**Solution (Recommended)**: Open Terminal and run the following command to bypass Gatekeeper:

```bash
sudo xattr -rd com.apple.quarantine /Applications/PromptHub.app
```

> 💡 **Tip**: If the app is installed elsewhere, replace the path with the actual installation path.

**Or**: Open "System Settings" → "Privacy & Security" → scroll down to the Security section → click "Open Anyway".

<div align="center">
  <img src="./imgs/install.png" width="60%" alt="macOS Installation"/>
</div>

### Run Desktop from Source

```bash
git clone https://github.com/legeling/PromptHub.git
cd PromptHub
pnpm install

# Start desktop development
pnpm electron:dev

# Build desktop
pnpm build

# Build self-hosted web when needed
pnpm build:web
```

> `pnpm build` at the repository root only builds the desktop app. Run `pnpm build:web` explicitly when you need the web build.

## 🚀 Quick Start

### 1. Create your first Prompt

Click the "New" button and fill in the title, description, `System Prompt`, `User Prompt`, and tags.

### 2. Use template variables

Use `{{variable_name}}` syntax in your prompts:

```text
Please translate the following {{source_lang}} text to {{target_lang}}:

{{text}}
```

### 3. Bring skills into your workspace

- Add curated skills from the Skill Store
- Scan local or project `SKILL.md` files
- Continue editing, translating, diffing, and distributing them from My Skills

### 4. Distribute to AI tools

- Choose target platforms such as Claude Code, Cursor, Windsurf, Codex, or Gemini CLI
- PromptHub installs skills into each platform directory for you

> 🖥️ **Supported Platforms**: Claude Code, GitHub Copilot, Cursor, Windsurf, Kiro, Gemini CLI, Trae, OpenCode, Codex CLI, Roo Code, Amp, OpenClaw, Qoder, QoderWork, CodeBuddy

### 5. Set up sync and backup

- Configure WebDAV for multi-device sync
- Or connect PromptHub Web in `Settings -> Data` as a backup and restore target

## Command Line CLI

PromptHub includes both a GUI and a CLI. The CLI is useful for scripts, batch operations, imports, scans, and automation.

### Use it directly after installing the desktop app

> ⚠️ **Current behavior**
>
> - After installing the desktop app and launching PromptHub once, the app installs the `prompthub` shell command automatically
> - After reopening your terminal, you can run `prompthub --args` directly
> - Source runs and built CLI bundles are still available for development and debugging

```bash
prompthub --help
prompthub prompt list
prompthub skill list
prompthub skill scan
prompthub --output table prompt search SEO --favorite
```

> 💡 **Tip**
>
> - If you just installed the desktop app, launch PromptHub once first
> - If your current terminal still cannot find `prompthub`, close it and open a new one

### Run from source

```bash
pnpm --filter @prompthub/desktop cli:dev -- --help
pnpm --filter @prompthub/desktop cli:dev -- prompt list
pnpm --filter @prompthub/desktop cli:dev -- skill list
pnpm --filter @prompthub/desktop cli:dev -- skill scan
pnpm --filter @prompthub/desktop cli:dev -- skill install ~/.claude/skills/my-skill
```

### Run the built CLI bundle

```bash
pnpm build
node apps/desktop/out/cli/prompthub.cjs --help
node apps/desktop/out/cli/prompthub.cjs prompt list
node apps/desktop/out/cli/prompthub.cjs skill list
```

### Common options

- `--output json|table`
- `--data-dir /path/to/user-data`
- `--app-data-dir /path/to/app-data`

### Supported commands

- `prompt list|get|create|update|delete|search`
- `skill list|get|install|scan|delete|remove`

### Notes

- The CLI reads and writes PromptHub's local database and managed skill repository directly
- The desktop app installs the shell command wrapper on first launch
- If you move the app later, launching PromptHub again refreshes the wrapper target

## 🌐 Self-Hosted Web

PromptHub Web is a lightweight self-hosted browser workspace, not the official SaaS cloud product. It is a good fit if you want to:

- access your PromptHub data from a browser
- use PromptHub Web as a desktop backup and restore target
- avoid relying only on WebDAV and prefer a more direct self-hosted workspace

### Docker Compose Quick Start

Run this from the repository root:

```bash
cd apps/web
cp .env.example .env
docker compose up -d --build
```

Important variables:

- `JWT_SECRET`: at least 32 random characters for authentication
- `ALLOW_REGISTRATION=false`: recommended after bootstrap so public registration stays off
- `DATA_ROOT`: root directory used for `data/`, `config/`, `logs/`, and `backups/`

Default access URL: `http://localhost:3871`

### First Boot

- A fresh instance opens `/setup` instead of the login page
- The first user becomes the administrator
- Public registration stays off after the first admin account is created

### Connect Desktop to PromptHub Web

In desktop `Settings -> Data`, configure:

- self-hosted PromptHub URL
- username
- password

Then desktop can:

- test the connection
- upload its current local workspace to PromptHub Web
- download and restore from PromptHub Web
- pull once on startup
- push updates on a schedule

### Data & Backup

Back up the entire data root, not only the SQLite file. Typical persisted paths include:

```bash
apps/web/data
apps/web/config
apps/web/logs
```

These directories can contain:

- `data/prompthub.db`
- `data/prompts/...`
- `data/skills/...`
- `data/assets/...`
- `config/settings/...`
- `backups/...`
- `logs/...`

For full deployment, upgrade, backup, GHCR image, and development notes, see [`web-self-hosted.md`](./web-self-hosted.md).

## 📈 Star History

<a href="https://star-history.com/#legeling/PromptHub&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=legeling/PromptHub&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=legeling/PromptHub&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=legeling/PromptHub&type=Date" />
  </picture>
</a>

## 🗺️ Roadmap

### v0.5.5 (Current Stable) 🚀

- [x] **Store Skill update detection**: Store-installed Skills persist an install-time content hash and can safely check whether the remote `SKILL.md` changed
- [x] **Full-document Skill translation**: AI translation now works on the complete `SKILL.md`, supports both full and immersive modes, and persists sidecar translations in the local repo
- [x] **Real relaunch for data-path switching**: Data-directory changes now relaunch the desktop app so the new `userData` path actually takes effect
- [x] **Clearer AI test and translation errors**: Model tests now say “<model> test succeeded/failed”, and translation failures surface explicit missing-config / timeout / 504 guidance
- [x] **Web media and sync fixes**: Docker/Web deployments can upload media and no longer misclassify normal folders as private during sync

### v0.4.9

- [x] Security hardening, architecture refactor, skill metadata edit fix
- [x] Database migration failure handling, code quality cleanup, and 720 passing tests

### v0.4.8

- [x] AI Workbench implementation, skills.sh community store, version history deletion
- [x] Backup / WebDAV hardening, data directory migration clarity, large Skill library performance

### v0.3.x

- [x] Multi-level folders, version control, variable templates
- [x] Multi-model lab, WebDAV sync, Markdown rendering
- [x] Multiple view modes, system integration, security & privacy

### Future Plans

- [ ] **Browser Extension**: Access PromptHub from ChatGPT/Claude web
- [ ] **Mobile App**: View, search and edit on mobile
- [ ] **Plugin System**: Custom AI provider and local model integration
- [ ] **Skill Marketplace**: Upload and share community-created skills

## 📝 Changelog

See full changelog: **[CHANGELOG.md](../CHANGELOG.md)**

### Latest Version v0.5.5 (2026-05-05) 🎉

**Skill / AI**

- 🧩 **Store Skill update detection and conflict protection**: Store-installed Skills now persist install-time hashes and versions, can compare the latest remote `SKILL.md`, and require explicit confirmation when local edits and remote updates conflict
- 🌍 **Complete `SKILL.md` translation sidecars**: Skill translation now persists sidecar translations generated from the full document, supports both full and immersive bilingual modes, and keeps the summary and body derived from the same document version
- 💬 **Clear AI test and translation feedback**: Model tests now explicitly say “<model> test succeeded/failed”, while missing-model, timeout, and `504` translation failures surface clear user-facing guidance

**Desktop**

- 🗂️ **Data-path switching now relaunches for real**: Switching the data directory now goes through a dedicated desktop relaunch IPC so the new `userData` path actually takes effect, and re-selecting the active directory no longer shows a false pending restart
- 🎞️ **Video save boundary tightened**: Video saves now accept only fresh picker-returned target paths and supported video extensions, preventing arbitrary renderer-supplied paths from being written into app data
- 🔄 **Internal sidecars hidden from platform installs**: Skill platform symlink installs now link only the canonical `SKILL.md`, so `.prompthub` translation sidecars are not exposed inside external platform skill folders

**Web / Docs**

- 🌐 **Media upload and display fixed**: Web/Docker deployments can upload selected media and display desktop-synced `local-image://` / `local-video://` URLs
- 🔐 **Sync privacy and password fixes**: Desktop folders without `visibility` are no longer imported as private on Web, and the self-hosted Web settings page now includes a password-change form
- 🌍 **Release docs resynced**: README, localized docs, the changelog, and website release metadata were resynced so the final `v0.5.5` notes match the shipped behavior

> 📋 [View full changelog](../CHANGELOG.md)

## 🤝 Contribution & Development

### Entry points

- Root `CONTRIBUTING.md`: GitHub-discoverable contribution entry
- `docs/contributing.md`: current canonical contribution guide
- `docs/README.md`: public docs index
- `spec/README.md`: internal SSD / spec index

### 🛠️ Tech Stack

| Category | Technology |
| -------- | ---------- |
| Desktop Runtime | Electron 33 |
| Desktop Frontend | React 18 + TypeScript 5 + Vite 6 |
| Self-Hosted Web | Hono + React + Vite |
| Styling | Tailwind CSS 3 |
| State Management | Zustand |
| Data Layer | SQLite, `better-sqlite3`, `node-sqlite3-wasm` |
| Monorepo Packages | `packages/shared`, `packages/db` |

### 📁 Repository Structure

```text
PromptHub/
├── apps/
│   ├── desktop/   # Electron desktop app + CLI
│   └── web/       # self-hosted web app
├── packages/
│   ├── db/        # shared data layer
│   └── shared/    # shared types, constants, contracts
├── docs/          # public-facing docs
├── spec/          # internal SSD / spec system
├── website/       # website resources
├── README.md
├── CONTRIBUTING.md
└── package.json
```

### Common Commands

| Task | Command |
| ---- | ------- |
| Desktop development | `pnpm electron:dev` |
| Web development | `pnpm dev:web` |
| Desktop build | `pnpm build` |
| Web build | `pnpm build:web` |
| Desktop lint | `pnpm lint` |
| Web lint | `pnpm lint:web` |
| Desktop full tests | `pnpm test -- --run` |
| Web full verification | `pnpm verify:web` |
| CLI from source | `pnpm --filter @prompthub/desktop cli:dev -- --help` |
| E2E | `pnpm test:e2e` |
| Desktop release gate | `pnpm test:release` |

### Docs and SSD Workflow

- `docs/` is for users, deployers, and contributors
- `spec/` is for internal SSD, stable domain docs, logic, assets, architecture, and active changes
- Non-trivial work should start with `spec/changes/active/<change-key>/`
- Each important change should include `proposal.md`, `specs/<domain>/spec.md`, `design.md`, `tasks.md`, and `implementation.md`
- Sync durable internal truth back into `spec/` and public-facing contract changes back into `docs/` or `README.md`

Full contribution rules, testing gates, and submission expectations live in [`contributing.md`](./contributing.md).

## 📄 License

This project is licensed under the [AGPL-3.0 License](../LICENSE).

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/legeling/PromptHub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/legeling/PromptHub/discussions)

## 🙏 Acknowledgements

- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Lucide](https://lucide.dev/)
- All the amazing [contributors](https://github.com/legeling/PromptHub/graphs/contributors) who helped improve PromptHub!

---

<div align="center">
  <p><strong>If this project helps you, please give it a ⭐!</strong></p>
  
  <a href="https://www.buymeacoffee.com/legeling" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="50" />
  </a>
</div>

---

## 💖 Special Thanks / Backers

Thank you to the following friends for their donation support to PromptHub:

| Date       | Backer | Amount   | Message                                                    |
| :--------- | :----- | :------- | :--------------------------------------------------------- |
| 2026-01-08 | \*🌊   | ￥100.00 | Support excellent software!                                |
| 2025-12-29 | \*昊   | ￥20.00  | Thanks for your software! Limited capacity, small support. |

---

## ☕ Sponsor

If PromptHub is helpful to your work, feel free to buy the author a coffee ☕

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="./imgs/donate/wechat.png" width="200" alt="WeChat Pay"/>
        <br/>
        <b>WeChat Pay</b>
      </td>
      <td align="center">
        <img src="./imgs/donate/alipay.jpg" width="200" alt="Alipay"/>
        <br/>
        <b>Alipay</b>
      </td>
    </tr>
  </table>
</div>

📧 **Contact**: legeling567@gmail.com

Thank you to every supporter! Your support keeps me motivated to continue development!

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/legeling">legeling</a></p>
</div>
