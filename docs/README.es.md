<div align="center">
  <img src="./imgs/icon.png" alt="PromptHub Logo" width="120" height="120" />
  <h1>PromptHub</h1>
  <p><strong>🚀 Una caja de herramientas de IA todo en uno para prompts, skills y activos de agentes</strong></p>
  <p>Reutiliza prompts · Distribuye skills con un clic · Gestiona activos de agentes · Sincronización en la nube · Copias de seguridad · Control de versiones</p>

  <p>
    <a href="https://github.com/legeling/PromptHub/stargazers"><img src="https://img.shields.io/github/stars/legeling/PromptHub?style=flat-square&color=yellow" alt="GitHub Stars"/></a>
    <a href="https://github.com/legeling/PromptHub/network/members"><img src="https://img.shields.io/github/forks/legeling/PromptHub?style=flat-square" alt="GitHub Forks"/></a>
    <a href="https://github.com/legeling/PromptHub/releases"><img src="https://img.shields.io/badge/stable-v0.5.5-green?style=flat-square" alt="Versión"/></a>
    <a href="https://github.com/legeling/PromptHub/releases"><img src="https://img.shields.io/github/downloads/legeling/PromptHub/total?style=flat-square&color=blue" alt="Descargas"/></a>
    <img src="https://img.shields.io/badge/license-AGPL--3.0-blue?style=flat-square" alt="Licencia: AGPL-3.0"/>
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
    <img src="https://img.shields.io/badge/📥_Descargar_ahora-Releases-blue?style=for-the-badge&logo=github" alt="Descarga"/>
  </a>
</div>

<br/>

> 💡 **¿Por qué PromptHub?**
>
> PromptHub es más que un gestor de prompts. Es un espacio de trabajo local-first para prompts, skills SKILL.md y activos de agentes. Organiza prompts, escanea y distribuye skills a Claude Code, Cursor, Windsurf, Codex y más de 15 herramientas de IA, y mantén los activos de IA personales o de proyecto con sincronización en la nube, copias de seguridad, control de versiones y almacenamiento local con foco en la privacidad.

---

## Cómo usar PromptHub

| Formato | Ideal para | Valor principal |
| ------- | ---------- | --------------- |
| App de escritorio | Usuarios individuales, uso intensivo de prompts, flujos de trabajo de programación con IA | Espacio principal local-first para prompts, skills y activos de IA a nivel de proyecto |
| Web autoalojada | Acceso desde navegador, self-hosting personal, usar la Web como destino de copia/restauración | Espacio ligero en navegador que también puede servir como destino de sincronización del escritorio |
| CLI | Procesos por lotes, scripts, automatización, pipelines | Acceso directo a los datos locales de PromptHub y a los repositorios de skills gestionados |

Si es tu primera vez con PromptHub, este es el camino recomendado:

1. Empieza con la app de escritorio para organizar prompts y skills.
2. Añade WebDAV o PromptHub Web autoalojado cuando necesites acceso desde navegador o copia entre dispositivos.
3. Añade la CLI cuando necesites automatización.

## 📸 Capturas de pantalla

<div align="center">
  <p><strong>Interfaz principal</strong></p>
  <img src="./imgs/1-index.png" width="80%" alt="Interfaz principal"/>
  <br/><br/>
  <p><strong>Tienda de Skills</strong></p>
  <img src="./imgs/10-skill-store.png" width="80%" alt="Tienda de Skills"/>
  <br/><br/>
  <p><strong>Detalle del Skill e instalación en plataformas</strong></p>
  <img src="./imgs/11-skill-platform-install.png" width="80%" alt="Detalle del Skill e instalación en plataformas"/>
  <br/><br/>
  <p><strong>Edición de archivos Skill y diff de versiones</strong></p>
  <img src="./imgs/12-skill-files-version-diff.png" width="80%" alt="Edición de archivos Skill y diff de versiones"/>
  <br/><br/>
  <p><strong>Copia de seguridad</strong></p>
  <img src="./imgs/4-backup.png" width="80%" alt="Copia de seguridad"/>
  <br/><br/>
  <p><strong>Ajustes de tema y fondo</strong></p>
  <img src="./imgs/5-theme.png" width="80%" alt="Ajustes de tema y fondo"/>
  <br/><br/>
  <p><strong>Comparación de versiones</strong></p>
  <img src="./imgs/8-version-compare.png" width="80%" alt="Comparación de versiones"/>
</div>

## ✨ Características

### 📝 Gestión de Prompts

- Crear, editar y eliminar con carpetas y etiquetas
- Historial de versiones automático con comparación y restauración
- Variables de plantilla `{{variable}}` para copiar, probar y distribuir
- Favoritos, búsqueda de texto completo, adjuntos y vista previa multimedia

### 🧩 Distribución y gestión de Skills

- **Tienda de Skills**: más de 20 skills seleccionados de Anthropic, OpenAI y otros
- **Instalación multiplataforma**: instalación con un clic en Claude Code, Cursor, Windsurf, Codex, Kiro, Gemini CLI, Qoder, QoderWork, CodeBuddy y más de 15 plataformas
- **Escaneo local**: descubre archivos `SKILL.md`, previsualízalos e impórtalos de forma selectiva
- **Modo symlink / copia**: mantén edición sincronizada mediante symlink o copia independiente
- **Directorios de destino por plataforma**: sobrescribe el directorio de skills de cada plataforma sin romper la coherencia entre escaneo y distribución
- **Traducción y pulido con IA**: traduce o mejora el contenido completo de un Skill desde PromptHub
- **Filtro por etiquetas**: filtra skills rápidamente desde la barra lateral

### 🤖 Proyectos y activos de agentes

- Escanea carpetas comunes de proyecto como `.claude/skills`, `.agents/skills`, `skills` y `.gemini`
- Gestiona bibliotecas personales, repos locales y activos de IA por proyecto desde un solo lugar
- Mantén prompts, skills y activos de proyecto portables con almacenamiento local-first, sync y copias de seguridad

### 🧪 Pruebas y generación con IA

- Pruebas integradas con IA para proveedores principales
- Comparación paralela del mismo prompt en múltiples modelos
- Pruebas de modelos de generación de imágenes
- Generación y mejora de skills asistidas por IA

### 💾 Datos y sincronización

- Todos los datos se almacenan localmente, con prioridad en la privacidad
- Copia de seguridad y restauración completa con `.phub.gz`
- Sincronización WebDAV
- Usa PromptHub Web autoalojado como destino de copia/restauración del escritorio
- Sincronización al iniciar y programada

### 🎨 UI y seguridad

- Vistas de tarjetas, galería y lista
- Modos oscuro, claro y del sistema con varios colores de tema
- Fondos personalizados
- Soporte para 7 idiomas, renderizado Markdown, resaltado de código y compatibilidad multiplataforma
- Protección con contraseña maestra
- Carpetas privadas (beta)

## 📥 Descarga e instalación de la app de escritorio

Si vas a empezar con PromptHub, lo mejor es empezar por la app de escritorio.

### Descarga

Descarga la versión más reciente `v0.5.5` desde [Releases](https://github.com/legeling/PromptHub/releases):

| Plataforma | Descarga |
| :--------: | :------- |
| Windows | [![Windows x64](https://img.shields.io/badge/Windows_x64-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/legeling/PromptHub/releases/latest/download/PromptHub-Setup-0.5.5-x64.exe) [![Windows arm64](https://img.shields.io/badge/Windows_arm64-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/legeling/PromptHub/releases/latest/download/PromptHub-Setup-0.5.5-arm64.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS_Apple_Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/legeling/PromptHub/releases/latest/download/PromptHub-0.5.5-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS_Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/legeling/PromptHub/releases/latest/download/PromptHub-0.5.5-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux_AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/legeling/PromptHub/releases/latest/download/PromptHub-0.5.5-x64.AppImage) [![Linux deb](https://img.shields.io/badge/Linux_deb-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/legeling/PromptHub/releases/latest/download/prompthub_0.5.5_amd64.deb) |
| Vista previa | [![Preview Prereleases](https://img.shields.io/badge/Preview_Prereleases-8B5CF6?style=for-the-badge&logo=github&logoColor=white)](https://github.com/legeling/PromptHub/releases?q=prerelease%3Atrue) |

> 💡 **Consejos de instalación**
>
> - **macOS**: Apple Silicon (M1/M2/M3/M4) debe usar `arm64`; Intel, `x64`
> - **Windows**: La mayoría debe usar `x64`; solo Windows on ARM necesita `arm64`
> - **Canal preview**: las builds preview se publican como GitHub `Prereleases`; al activarlo, PromptHub solo comprueba prereleases
> - **Volver a estable**: desactiva primero el canal preview. PromptHub nunca baja automáticamente de una preview más nueva a una estable más antigua

### Instalar en macOS con Homebrew

```bash
brew tap legeling/tap
brew install --cask prompthub
```

### Ruta de actualización para usuarios de Homebrew

Si instalaste PromptHub con Homebrew, usa Homebrew también para futuras actualizaciones y no lo mezcles con el flujo DMG interno.

```bash
brew update
brew upgrade --cask prompthub
```

Si el estado local de Homebrew parece inconsistente, reinstala el cask actual:

```bash
brew reinstall --cask prompthub
```

> - Si instalaste con DMG/EXE, usa el actualizador interno o GitHub Releases
> - Si instalaste con Homebrew, usa `brew upgrade --cask prompthub` y no vuelvas a la ruta DMG interna
> - Mezclar ambos caminos puede desalinear la versión registrada por Homebrew con la app real instalada

### Primer inicio en macOS

Como la app no está notarizada por Apple, es posible que al abrirla por primera vez veas **"PromptHub está dañado y no se puede abrir"** o **"No se puede verificar el desarrollador"**.

**Solución recomendada**: abre Terminal y ejecuta este comando para omitir Gatekeeper:

```bash
sudo xattr -rd com.apple.quarantine /Applications/PromptHub.app
```

> 💡 **Consejo**: si la app está instalada en otra ubicación, sustituye la ruta por la ruta real.

**O bien**: abre "Ajustes del sistema" → "Privacidad y seguridad" → baja hasta Seguridad → haz clic en "Abrir igualmente".

<div align="center">
  <img src="./imgs/install.png" width="60%" alt="Aviso de instalación en macOS"/>
</div>

### Ejecutar el escritorio desde el código fuente

```bash
git clone https://github.com/legeling/PromptHub.git
cd PromptHub
pnpm install

# Iniciar desarrollo de escritorio
pnpm electron:dev

# Construir escritorio
pnpm build

# Construir la Web autoalojada si hace falta
pnpm build:web
```

> `pnpm build` en la raíz del repositorio solo construye la app de escritorio. Si necesitas la Web, ejecuta además `pnpm build:web`.

## 🚀 Inicio rápido

### 1. Crea tu primer Prompt

Haz clic en "Nuevo" y completa título, descripción, `System Prompt`, `User Prompt` y etiquetas.

### 2. Usa variables de plantilla

Usa la sintaxis `{{nombre_variable}}` en tus prompts:

```text
Por favor, traduce el siguiente texto de {{source_lang}} a {{target_lang}}:

{{text}}
```

### 3. Lleva los Skills a tu espacio de trabajo

- Añade skills habituales desde la tienda
- Escanea `SKILL.md` locales o dentro de proyectos
- Después sigue editando, traduciendo, comparando versiones y distribuyendo desde "My Skills"

### 4. Distribúyelos a herramientas de IA

- Elige plataformas como Claude Code, Cursor, Windsurf, Codex o Gemini CLI
- PromptHub instala los skills en el directorio de cada plataforma por ti

> 🖥️ **Plataformas compatibles actualmente**: Claude Code, GitHub Copilot, Cursor, Windsurf, Kiro, Gemini CLI, Trae, OpenCode, Codex CLI, Roo Code, Amp, OpenClaw, Qoder, QoderWork, CodeBuddy

### 5. Configura sincronización y copias

- Configura WebDAV para sincronizar entre varios dispositivos
- O conecta PromptHub Web autoalojado en `Ajustes -> Datos` como origen de copia/restauración

## CLI de línea de comandos

PromptHub incluye GUI y CLI. La CLI es útil para scripts, operaciones por lotes, importaciones, escaneos y automatización.

### Usarla directamente después de instalar la app de escritorio

> ⚠️ **Comportamiento actual**
>
> - Tras instalar la app de escritorio y abrir PromptHub una vez, la aplicación instala automáticamente el comando `prompthub`
> - Después de volver a abrir la terminal, ya puedes usar `prompthub --args` directamente
> - La ejecución desde código fuente y el bundle CLI compilado siguen disponibles para desarrollo y depuración

```bash
prompthub --help
prompthub prompt list
prompthub skill list
prompthub skill scan
prompthub --output table prompt search SEO --favorite
```

> 💡 **Consejo**
>
> - Si acabas de instalar la app de escritorio, abre PromptHub una vez primero
> - Si tu terminal actual todavía no encuentra `prompthub`, ciérrala y ábrela de nuevo

### Ejecutar desde el código fuente

```bash
pnpm --filter @prompthub/desktop cli:dev -- --help
pnpm --filter @prompthub/desktop cli:dev -- prompt list
pnpm --filter @prompthub/desktop cli:dev -- skill list
pnpm --filter @prompthub/desktop cli:dev -- skill scan
pnpm --filter @prompthub/desktop cli:dev -- skill install ~/.claude/skills/my-skill
```

### Usar el bundle CLI compilado

```bash
pnpm build
node apps/desktop/out/cli/prompthub.cjs --help
node apps/desktop/out/cli/prompthub.cjs prompt list
node apps/desktop/out/cli/prompthub.cjs skill list
```

### Opciones comunes

- `--output json|table`
- `--data-dir /path/to/user-data`
- `--app-data-dir /path/to/app-data`

### Comandos compatibles

- `prompt list|get|create|update|delete|search`
- `skill list|get|install|scan|delete|remove`

### Notas

- La CLI lee y escribe directamente la base de datos local de PromptHub y el repositorio de skills gestionado
- La app de escritorio instala el wrapper del comando shell en el primer arranque
- Si más adelante mueves la aplicación, volver a abrir PromptHub actualizará la ruta del wrapper

## 🌐 Web autoalojada

PromptHub Web es un espacio ligero autoalojado en navegador, no el SaaS oficial. Es una buena opción si quieres:

- acceder a tus datos de PromptHub desde un navegador
- usar PromptHub Web como destino de copia/restauración del escritorio
- no depender solo de WebDAV y preferir un espacio autoalojado más directo

### Inicio rápido con Docker Compose

Ejecuta esto desde la raíz del repositorio:

```bash
cd apps/web
cp .env.example .env
docker compose up -d --build
```

Variables importantes:

- `JWT_SECRET`: al menos 32 caracteres aleatorios para autenticación
- `ALLOW_REGISTRATION=false`: recomendable tras el bootstrap para mantener desactivado el registro público
- `DATA_ROOT`: directorio raíz usado para `data/`, `config/`, `logs/` y `backups/`

URL por defecto: `http://localhost:3871`

### Primer arranque

- Una instancia nueva abre `/setup` en lugar de la pantalla de login
- El primer usuario pasa a ser administrador
- Tras crear la primera cuenta admin, el registro público permanece desactivado

### Conectar el escritorio con PromptHub Web

En el escritorio, ve a `Ajustes -> Datos` y configura:

- URL de PromptHub autoalojado
- nombre de usuario
- contraseña

Después, el escritorio puede:

- probar la conexión
- subir su espacio de trabajo local actual a PromptHub Web
- descargar y restaurar desde PromptHub Web
- hacer un pull al iniciar
- enviar actualizaciones según programación

### Datos y copia de seguridad

Haz copia de todo el directorio raíz de datos, no solo del archivo SQLite. Las rutas persistentes típicas incluyen:

```bash
apps/web/data
apps/web/config
apps/web/logs
```

Estos directorios pueden contener:

- `data/prompthub.db`
- `data/prompts/...`
- `data/skills/...`
- `data/assets/...`
- `config/settings/...`
- `backups/...`
- `logs/...`

Para despliegue completo, actualizaciones, copias, imágenes GHCR y notas de desarrollo, consulta [`web-self-hosted.md`](./web-self-hosted.md).

## 📈 Star History

<a href="https://star-history.com/#legeling/PromptHub&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=legeling/PromptHub&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=legeling/PromptHub&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=legeling/PromptHub&type=Date" />
  </picture>
</a>

## 🗺️ Hoja de ruta

### v0.5.5 (estable actual) 🚀

- [x] **Detección de actualizaciones de Skills del store**: los Skills instalados desde el store guardan un hash de instalación y pueden comprobar cambios en el `SKILL.md` remoto de forma segura
- [x] **Traducción completa de documentos Skill**: la traducción con IA ahora trabaja sobre el `SKILL.md` completo, guarda sidecars locales y admite modo completo e inmersivo
- [x] **El cambio de directorio de datos ahora sí se aplica**: PromptHub relanza la app para volver a aplicar realmente la nueva ruta `userData`
- [x] **Errores de prueba y traducción más claros**: las pruebas de modelo muestran "modelo XX prueba exitosa / fallida", y los fallos por configuración, timeout o `504` se explican con claridad
- [x] **Correcciones Web de medios y sync**: despliegues Web/Docker ya pueden subir medios y no confunden carpetas normales con privadas durante la sincronización

### v0.4.9

- [x] Refuerzo de seguridad, refactor de arquitectura, corrección de metadatos Skill
- [x] Mejor manejo de errores de migración, limpieza de calidad de código y 720 tests pasando

### v0.4.8

- [x] AI Workbench implementado, skills.sh community store, eliminación de historial de versiones
- [x] Refuerzo de backup / WebDAV, claridad en migración de directorio, rendimiento para bibliotecas grandes

### v0.3.x

- [x] Carpetas multinivel, control de versiones, plantillas variables
- [x] Laboratorio multimodelo, sincronización WebDAV, renderizado Markdown
- [x] Múltiples vistas, integración con el sistema, seguridad y privacidad

### Próximos planes

- [ ] **Extensión de navegador**: acceder a PromptHub desde ChatGPT/Claude Web
- [ ] **App móvil**: ver, buscar y editar desde móvil
- [ ] **Sistema de plugins**: integrar proveedores de IA personalizados y modelos locales
- [ ] **Marketplace de Skills**: subir y compartir Skills de la comunidad

## 📝 Registro de cambios

Consulta el changelog completo: **[CHANGELOG.md](../CHANGELOG.md)**

### Última versión v0.5.5 (2026-05-05) 🎉

**Skill / AI**

- 🧩 **Detección de actualizaciones de Skills del store y protección ante conflictos**: los Skills instalados desde el store ahora guardan hash y versión de instalación, comparan el `SKILL.md` remoto y piden confirmación cuando coinciden cambios locales y remotos
- 🌍 **Sidecars de traducción para `SKILL.md` completo**: la traducción de Skills ahora persiste sidecars generados desde el documento completo y admite modos completo e inmersivo bilingüe
- 💬 **Feedback más claro para pruebas y traducción con IA**: las pruebas de modelo dicen explícitamente "<modelo> prueba exitosa / fallida", y los errores por configuración, timeout o `504` se explican con claridad

**Desktop**

- 🗂️ **El cambio de ruta de datos ahora relanza la app de verdad**: el cambio de directorio pasa por una IPC específica de relanzamiento para que la nueva ruta `userData` se aplique realmente, y reseleccionar el directorio activo ya no muestra un falso reinicio pendiente
- 🎞️ **Límites más estrictos al guardar vídeo**: ahora solo se aceptan rutas recién devueltas por el selector nativo y extensiones de vídeo admitidas
- 🔄 **Los sidecars internos se ocultan al instalar en plataformas**: las instalaciones con symlink ahora enlazan solo el `SKILL.md` canónico, sin exponer sidecars `.prompthub` en carpetas externas

**Web / Docs**

- 🌐 **Corregidos subida y visualización de medios**: los despliegues Web/Docker pueden subir medios seleccionados y mostrar URLs `local-image://` / `local-video://` sincronizadas desde escritorio
- 🔐 **Arreglos de privacidad de sync y contraseña**: las carpetas de escritorio sin `visibility` ya no se importan como privadas en la Web, y la configuración de la Web autoalojada incluye formulario para cambiar contraseña
- 🌍 **Documentación de release resincronizada**: README, docs localizadas, changelog y metadatos de release del sitio se resincronizaron para que `v0.5.5` coincida con lo realmente entregado

> 📋 [Ver changelog completo](../CHANGELOG.md)

## 🤝 Contribuir y desarrollo

### Puntos de entrada

- `CONTRIBUTING.md` en la raíz: entrada visible desde GitHub
- `docs/contributing.md`: guía canonical de contribución vigente
- `docs/README.md`: índice público de documentación
- `spec/README.md`: índice interno de SSD / spec

### 🛠️ Stack técnico

| Categoría | Tecnología |
| --------- | ---------- |
| Runtime de escritorio | Electron 33 |
| Frontend de escritorio | React 18 + TypeScript 5 + Vite 6 |
| Web autoalojada | Hono + React + Vite |
| Estilos | Tailwind CSS 3 |
| Gestión de estado | Zustand |
| Capa de datos | SQLite, `better-sqlite3`, `node-sqlite3-wasm` |
| Paquetes del monorepo | `packages/shared`, `packages/db` |

### 📁 Estructura del repositorio

```text
PromptHub/
├── apps/
│   ├── desktop/   # Escritorio Electron + CLI
│   └── web/       # Web autoalojada
├── packages/
│   ├── db/        # capa de datos compartida
│   └── shared/    # tipos, constantes y contratos compartidos
├── docs/          # documentación pública
├── spec/          # sistema interno SSD / spec
├── website/       # recursos del sitio web
├── README.md
├── CONTRIBUTING.md
└── package.json
```

### Comandos frecuentes

| Tarea | Comando |
| ----- | ------- |
| Desarrollo escritorio | `pnpm electron:dev` |
| Desarrollo web | `pnpm dev:web` |
| Build escritorio | `pnpm build` |
| Build web | `pnpm build:web` |
| Lint escritorio | `pnpm lint` |
| Lint web | `pnpm lint:web` |
| Tests completos escritorio | `pnpm test -- --run` |
| Verificación completa web | `pnpm verify:web` |
| CLI desde código fuente | `pnpm --filter @prompthub/desktop cli:dev -- --help` |
| E2E | `pnpm test:e2e` |
| Gate de release escritorio | `pnpm test:release` |

### Flujo de docs y SSD

- `docs/` es para usuarios, responsables de despliegue y contribuidores
- `spec/` es para SSD interno, documentación estable por dominio, lógica, activos, arquitectura y cambios activos
- El trabajo no trivial debería empezar con `spec/changes/active/<change-key>/`
- Cada cambio importante debería incluir `proposal.md`, `specs/<domain>/spec.md`, `design.md`, `tasks.md` e `implementation.md`
- Sincroniza la verdad interna duradera de vuelta a `spec/` y los cambios del contrato público a `docs/` o `README.md`

Las reglas completas de contribución, puertas de prueba y expectativas de entrega están en [`contributing.md`](./contributing.md).

## 📄 Licencia

Este proyecto está licenciado bajo [AGPL-3.0 License](../LICENSE).

## 💬 Soporte

- **Issues**: [GitHub Issues](https://github.com/legeling/PromptHub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/legeling/PromptHub/discussions)

## 🙏 Agradecimientos

- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Lucide](https://lucide.dev/)
- Gracias a todos los [contribuidores](https://github.com/legeling/PromptHub/graphs/contributors) que han mejorado PromptHub

---

<div align="center">
  <p><strong>Si este proyecto te ayuda, dale una ⭐ por favor.</strong></p>

  <a href="https://www.buymeacoffee.com/legeling" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="50" />
  </a>
</div>

---

## 💖 Agradecimientos especiales / Backers

Gracias a las siguientes personas por apoyar PromptHub con sus donaciones:

| Fecha | Patrocinador | Importe | Mensaje |
| :---- | :----------- | :------ | :------ |
| 2026-01-08 | \*🌊 | ￥100.00 | ¡Apoyando un software excelente! |
| 2025-12-29 | \*昊 | ￥20.00 | ¡Gracias por tu software! Pequeño apoyo |

---

## ☕ Patrocinio

Si PromptHub te ayuda en tu trabajo, puedes invitar al autor a un café ☕

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

📧 **Contacto**: legeling567@gmail.com

Gracias a todas las personas que apoyan el proyecto. Su ayuda mantiene viva su evolución.

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/legeling">legeling</a></p>
</div>
