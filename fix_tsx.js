const fs = require('fs');
const path = require('path');

// 1. TopBar.tsx
let topbarPath = path.join(__dirname, 'apps/desktop/src/renderer/components/layout/TopBar.tsx');
let topbar = fs.readFileSync(topbarPath, 'utf8');

// Change topbar from panel-strong to toolbar
topbar = topbar.replace(/app-wallpaper-panel-strong border-b border-border flex items-center px-4 shrink-0/, 'app-wallpaper-toolbar border-b border-border flex items-center px-4 shrink-0');
// Add app-wallpaper-search
topbar = topbar.replace(/<div className="w-full max-w-lg relative flex items-center">/, '<div className="w-full max-w-lg relative flex items-center">\n            <div className="app-wallpaper-search absolute inset-0 rounded-lg border pointer-events-none" />');
// Search input is z-10 and bg-transparent
topbar = topbar.replace(/className="w-full h-9 pl-9 pr-32 rounded-lg app-wallpaper-surface-strong border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary\/30 transition-all"/, 'className="relative z-10 w-full h-9 pl-9 pr-32 rounded-lg border border-transparent bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"');

fs.writeFileSync(topbarPath, topbar);

// 2. PromptListHeader.tsx
let plPath = path.join(__dirname, 'apps/desktop/src/renderer/components/prompt/PromptListHeader.tsx');
let pl = fs.readFileSync(plPath, 'utf8');
pl = pl.replace(/app-wallpaper-panel-strong sticky top-0/, 'app-wallpaper-toolbar sticky top-0');
fs.writeFileSync(plPath, pl);

