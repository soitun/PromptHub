const fs = require('fs');
const path = require('path');

const files = [
  'apps/desktop/src/renderer/components/layout/MainContent.tsx',
  'apps/desktop/src/renderer/components/layout/Sidebar.tsx',
  'apps/desktop/src/renderer/components/layout/TopBar.tsx',
  'apps/desktop/src/renderer/components/prompt/PromptListHeader.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // First, revert the wrong sed replacements:
  // "border border-transparent" was created by my sed command replacing "border border-border".
  content = content.replace(/border border-transparent/g, "border border-border");
  
  fs.writeFileSync(filePath, content);
});
