const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'apps/desktop/src/renderer/styles/globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

// For each .app-wallpaper-* rule, add !important to background, border-color, box-shadow, and backdrop-filter
// But we only need it for border-color actually, because border-border overrides border-color. 
// Tailwind's bg-card might override background. So let's just make all of them !important inside these classes.

const classesToPatch = [
  'app-wallpaper-shell',
  'app-wallpaper-panel',
  'app-wallpaper-panel-strong',
  'app-wallpaper-section',
  'app-wallpaper-toolbar',
  'app-wallpaper-search',
  'app-wallpaper-chip',
  'app-wallpaper-surface',
  'app-wallpaper-surface-strong'
];

classesToPatch.forEach(cls => {
  const regex = new RegExp(`(\\.${cls}(?:::before|::after)?\\s*\\{[^}]*?\\})`, 'g');
  css = css.replace(regex, (match) => {
    // exclude .app-background-mode-image .app-wallpaper-chip 
    return match
      .replace(/background:\s*([^;!]+);/g, 'background: $1 !important;')
      .replace(/border-color:\s*([^;!]+);/g, 'border-color: $1 !important;')
      .replace(/box-shadow:\s*([^;!]+);/g, 'box-shadow: $1 !important;')
      .replace(/backdrop-filter:\s*([^;!]+);/g, 'backdrop-filter: $1 !important;');
  });
});

// Also patch the .app-background-mode-image .app-wallpaper-chip rule explicitly
css = css.replace(/\.app-background-mode-image \.app-wallpaper-chip\s*\{[^}]*?\}/, (match) => {
  return match
    .replace(/background:\s*([^;!]+);/g, 'background: $1 !important;')
    .replace(/border-color:\s*([^;!]+);/g, 'border-color: $1 !important;')
    .replace(/box-shadow:\s*([^;!]+);/g, 'box-shadow: $1 !important;')
    .replace(/backdrop-filter:\s*([^;!]+);/g, 'backdrop-filter: $1 !important;');
});

fs.writeFileSync(cssPath, css);
