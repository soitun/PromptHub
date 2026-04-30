const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'apps/desktop/src/renderer/styles/globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

const replacementLight = `.app-background-mode-image {
  --background: 212 30% 96%;
  --foreground: 220 26% 10%;
  --card: 0 0% 100%;
  --card-foreground: 220 26% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 220 26% 10%;
  --secondary: 210 26% 94%;
  --secondary-foreground: 220 24% 14%;
  --muted: 210 24% 92%;
  --muted-foreground: 220 18% 24%;
  --accent: 210 32% 90%;
  --accent-foreground: 220 26% 10%;
  --border: 214 22% 72%;
  --input: 214 22% 80%;
  --sidebar: 210 30% 96%;
  --sidebar-foreground: 220 22% 14%;
  --sidebar-accent: 210 24% 91%;
  --sidebar-border: 214 22% 74%;

  --app-ui-shell-bg: transparent;
  
  /* Apple-like Glass Materials */
  --app-glass-blur-soft: blur(12px) saturate(140%);
  --app-glass-blur-medium: blur(24px) saturate(160%);
  --app-glass-blur-strong: blur(40px) saturate(180%);
  
  --app-glass-stroke-soft: hsl(0 0% 100% / 0.4);
  --app-glass-stroke-medium: hsl(0 0% 100% / 0.5);
  --app-glass-stroke-strong: hsl(0 0% 100% / 0.6);
  
  /* Crisp inner top highlight + soft drop shadow */
  --app-glass-shadow-soft: 
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 0 0 1px rgba(255, 255, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  --app-glass-shadow-medium: 
    0 8px 24px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  --app-glass-shadow-strong: 
    0 16px 40px rgba(0, 0, 0, 0.12),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);

  /* Component Mappings */
  --app-ui-panel-bg: hsl(0 0% 100% / 0.65);
  --app-ui-panel-border: transparent; /* Use shadow for border to avoid sizing issues */
  --app-ui-panel-shadow: var(--app-glass-shadow-medium);
  --app-ui-panel-backdrop: var(--app-glass-blur-medium);
  
  --app-ui-panel-strong-bg: hsl(0 0% 100% / 0.75);
  --app-ui-panel-strong-border: transparent;
  --app-ui-panel-strong-shadow: var(--app-glass-shadow-strong);
  --app-ui-panel-strong-backdrop: var(--app-glass-blur-strong);
  
  --app-ui-section-bg: hsl(0 0% 100% / 0.4);
  --app-ui-section-border: transparent;
  --app-ui-section-backdrop: var(--app-glass-blur-soft);
  
  --app-ui-toolbar-bg: hsl(0 0% 100% / 0.6);
  --app-ui-toolbar-border: transparent;
  --app-ui-toolbar-shadow: var(--app-glass-shadow-medium);
  --app-ui-toolbar-backdrop: var(--app-glass-blur-medium);
  --app-ui-toolbar-highlight: transparent;
  
  --app-ui-search-bg: hsl(0 0% 100% / 0.5);
  --app-ui-search-border: transparent;
  --app-ui-search-shadow: 
    inset 0 2px 4px rgba(0,0,0,0.04),
    inset 0 0 0 1px rgba(255,255,255,0.4);
  --app-ui-search-backdrop: var(--app-glass-blur-medium);
  --app-ui-search-highlight: transparent;
  --app-ui-search-ornament: transparent;
  
  --app-ui-chip-bg: hsl(0 0% 100% / 0.4);
  --app-ui-chip-border: transparent;
  --app-ui-chip-shadow: 
    0 2px 6px rgba(0,0,0,0.03),
    inset 0 0 0 1px rgba(255,255,255,0.3),
    inset 0 1px 0 rgba(255,255,255,0.6);
  --app-ui-chip-backdrop: var(--app-glass-blur-soft);
  --app-ui-chip-highlight: transparent;
  
  --app-ui-surface-bg: hsl(0 0% 100% / 0.55);
  --app-ui-surface-border: transparent;
  --app-ui-surface-shadow: var(--app-glass-shadow-soft);
  --app-ui-surface-backdrop: var(--app-glass-blur-soft);
  
  --app-ui-surface-strong-bg: hsl(0 0% 100% / 0.7);
  --app-ui-surface-strong-border: transparent;
  --app-ui-surface-strong-shadow: var(--app-glass-shadow-medium);
  --app-ui-surface-strong-backdrop: var(--app-glass-blur-medium);
  
  --app-ui-blanket-bg: hsl(210 40% 98% / 0.3);

  --app-settings-card-bg: hsl(0 0% 100% / 0.6);
  --app-settings-card-border: transparent;
  --app-settings-card-shadow: var(--app-glass-shadow-strong);
  
  --app-settings-subtle-bg: hsl(0 0% 100% / 0.4);
  --app-settings-subtle-border: transparent;
  
  --app-settings-input-bg: hsl(0 0% 100% / 0.5);
  --app-settings-input-border: transparent;
  
  --app-settings-segment-color: hsl(220 22% 18%);
  --app-settings-segment-hover-bg: hsl(0 0% 100% / 0.4);
  --app-settings-segment-hover-color: hsl(220 26% 10%);
  --app-settings-segment-active-bg: hsl(0 0% 100% / 0.75);
  --app-settings-segment-active-color: hsl(220 26% 10%);
  --app-settings-segment-active-border: transparent;
  --app-settings-segment-active-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px rgba(255,255,255,0.4),
    inset 0 1px 0 rgba(255,255,255,0.7);

  --app-prompt-list-pane-bg: hsl(0 0% 100% / 0.5);
  --app-prompt-list-pane-border: transparent;
  --app-prompt-list-card-bg: hsl(0 0% 100% / 0.3);
  --app-prompt-list-card-shadow: var(--app-glass-shadow-soft);
  --app-prompt-list-card-hover-bg: hsl(0 0% 100% / 0.45);
  --app-prompt-list-card-hover-shadow: var(--app-glass-shadow-medium);
}`;

const replacementDark = `.dark .app-background-mode-image {
  --background: 220 24% 10%;
  --foreground: 220 18% 97%;
  --card: 220 22% 12%;
  --card-foreground: 220 18% 97%;
  --popover: 220 22% 12%;
  --popover-foreground: 220 18% 97%;
  --secondary: 220 18% 14%;
  --secondary-foreground: 220 18% 96%;
  --muted: 220 18% 16%;
  --muted-foreground: 220 14% 78%;
  --accent: 220 20% 18%;
  --accent-foreground: 220 18% 96%;
  --border: 220 18% 30%;
  --input: 220 18% 34%;
  --sidebar: 220 24% 10%;
  --sidebar-foreground: 220 18% 96%;
  --sidebar-accent: 220 18% 18%;
  --sidebar-border: 220 18% 28%;

  /* Apple-like Glass Materials - Dark */
  --app-glass-blur-soft: blur(14px) saturate(140%);
  --app-glass-blur-medium: blur(28px) saturate(160%);
  --app-glass-blur-strong: blur(48px) saturate(180%);
  
  --app-glass-stroke-soft: hsl(220 30% 96% / 0.1);
  --app-glass-stroke-medium: hsl(220 30% 96% / 0.15);
  --app-glass-stroke-strong: hsl(220 30% 96% / 0.2);
  
  /* Crisp inner top highlight + deeper drop shadow */
  --app-glass-shadow-soft: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  --app-glass-shadow-medium: 
    0 12px 32px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  --app-glass-shadow-strong: 
    0 24px 56px rgba(0, 0, 0, 0.4),
    inset 0 0 0 1px rgba(255, 255, 255, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);

  /* Component Mappings */
  --app-ui-panel-bg: hsl(220 30% 10% / 0.5);
  --app-ui-panel-border: transparent;
  --app-ui-panel-shadow: var(--app-glass-shadow-medium);
  --app-ui-panel-backdrop: var(--app-glass-blur-medium);
  
  --app-ui-panel-strong-bg: hsl(220 30% 10% / 0.65);
  --app-ui-panel-strong-border: transparent;
  --app-ui-panel-strong-shadow: var(--app-glass-shadow-strong);
  --app-ui-panel-strong-backdrop: var(--app-glass-blur-strong);
  
  --app-ui-section-bg: hsl(220 30% 10% / 0.3);
  --app-ui-section-border: transparent;
  --app-ui-section-backdrop: var(--app-glass-blur-soft);
  
  --app-ui-toolbar-bg: hsl(220 30% 10% / 0.45);
  --app-ui-toolbar-border: transparent;
  --app-ui-toolbar-shadow: var(--app-glass-shadow-medium);
  --app-ui-toolbar-backdrop: var(--app-glass-blur-medium);
  --app-ui-toolbar-highlight: transparent;
  
  --app-ui-search-bg: hsl(220 30% 15% / 0.4);
  --app-ui-search-border: transparent;
  --app-ui-search-shadow: 
    inset 0 2px 4px rgba(0,0,0,0.1),
    inset 0 0 0 1px rgba(255,255,255,0.1);
  --app-ui-search-backdrop: var(--app-glass-blur-medium);
  --app-ui-search-highlight: transparent;
  --app-ui-search-ornament: transparent;
  
  --app-ui-chip-bg: hsl(220 30% 20% / 0.3);
  --app-ui-chip-border: transparent;
  --app-ui-chip-shadow: 
    0 4px 12px rgba(0,0,0,0.15),
    inset 0 0 0 1px rgba(255,255,255,0.06),
    inset 0 1px 0 rgba(255,255,255,0.12);
  --app-ui-chip-backdrop: var(--app-glass-blur-soft);
  --app-ui-chip-highlight: transparent;
  
  --app-ui-surface-bg: hsl(220 30% 10% / 0.4);
  --app-ui-surface-border: transparent;
  --app-ui-surface-shadow: var(--app-glass-shadow-soft);
  --app-ui-surface-backdrop: var(--app-glass-blur-soft);
  
  --app-ui-surface-strong-bg: hsl(220 30% 10% / 0.55);
  --app-ui-surface-strong-border: transparent;
  --app-ui-surface-strong-shadow: var(--app-glass-shadow-medium);
  --app-ui-surface-strong-backdrop: var(--app-glass-blur-medium);
  
  --app-ui-blanket-bg: hsl(220 30% 0% / 0.4);

  --app-settings-card-bg: hsl(220 30% 12% / 0.5);
  --app-settings-card-border: transparent;
  --app-settings-card-shadow: var(--app-glass-shadow-strong);
  
  --app-settings-subtle-bg: hsl(220 30% 12% / 0.3);
  --app-settings-subtle-border: transparent;
  
  --app-settings-input-bg: hsl(220 30% 15% / 0.4);
  --app-settings-input-border: transparent;
  
  --app-settings-segment-color: hsl(220 16% 84%);
  --app-settings-segment-hover-bg: hsl(220 30% 25% / 0.3);
  --app-settings-segment-hover-color: hsl(220 18% 97%);
  --app-settings-segment-active-bg: hsl(220 30% 30% / 0.5);
  --app-settings-segment-active-color: hsl(220 18% 97%);
  --app-settings-segment-active-border: transparent;
  --app-settings-segment-active-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 0 0 1px rgba(255,255,255,0.1),
    inset 0 1px 0 rgba(255,255,255,0.18);

  --app-prompt-list-pane-bg: hsl(220 30% 10% / 0.45);
  --app-prompt-list-pane-border: transparent;
  --app-prompt-list-card-bg: hsl(220 30% 15% / 0.25);
  --app-prompt-list-card-shadow: var(--app-glass-shadow-soft);
  --app-prompt-list-card-hover-bg: hsl(220 30% 20% / 0.35);
  --app-prompt-list-card-hover-shadow: var(--app-glass-shadow-medium);
}`;

css = css.replace(/\.app-background-mode-image \{[\s\S]*?(?=\.dark \.app-background-mode-image \{)/, replacementLight + '\n\n');
css = css.replace(/\.dark \.app-background-mode-image \{[\s\S]*?(?=\/\* Markdown rendering styles \*\/)/, replacementDark + '\n\n');

// Also remove the `bg-transparent` overrides from my previous Sidebar change that was messing things up when hovered
fs.writeFileSync(cssPath, css);
