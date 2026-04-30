const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'apps/desktop/src/renderer/components/layout/Sidebar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Sidebar Nav Item unselected
content = content.replace(
  /: 'app-wallpaper-chip border border-transparent bg-transparent text-sidebar-foreground\/60 hover:bg-sidebar-accent\/50 hover:text-sidebar-foreground'/g,
  ": 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'"
);

content = content.replace(
  /: 'app-wallpaper-chip border border-transparent bg-transparent text-sidebar-foreground\/60 hover:bg-sidebar-accent\/40 hover:text-sidebar-foreground'/g,
  ": 'text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'"
);

content = content.replace(
  /\? 'app-wallpaper-chip border border-transparent text-sidebar-foreground\/60 hover:bg-sidebar-accent\/50 hover:text-sidebar-foreground' : 'app-wallpaper-chip border border-transparent text-sidebar-foreground\/60 hover:bg-sidebar-accent\/50 hover:text-sidebar-foreground'/g,
  "? 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground' : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'"
);

// 2. Count chips
content = content.replace(
  /className="app-wallpaper-chip text-\[10px\] px-1\.5 py-0\.5 rounded-full border border-border text-sidebar-foreground\/60"/g,
  'className="app-wallpaper-chip border border-border/50 text-[10px] px-1.5 py-0.5 rounded-full text-sidebar-foreground/60"'
);

// 3. View Mode toggles
content = content.replace(
  /: `flex-1 py-1\.5 gap-2 text-xs font-semibold rounded-lg \$\{viewMode === 'prompt' \? 'app-wallpaper-surface text-foreground shadow-sm' : 'app-wallpaper-chip border border-transparent bg-transparent text-sidebar-foreground\/50 hover:text-sidebar-foreground hover:bg-white\/5'}`/g,
  ": `flex-1 py-1.5 gap-2 text-xs font-semibold rounded-lg ${viewMode === 'prompt' ? 'app-wallpaper-surface text-foreground shadow-sm' : 'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-black/5 dark:hover:bg-white/5'}`"
);

content = content.replace(
  /: `flex-1 py-1\.5 gap-2 text-xs font-semibold rounded-lg \$\{viewMode === 'skill' \? 'app-wallpaper-surface text-foreground shadow-sm' : 'app-wallpaper-chip border border-transparent bg-transparent text-sidebar-foreground\/50 hover:text-sidebar-foreground hover:bg-white\/5'}`/g,
  ": `flex-1 py-1.5 gap-2 text-xs font-semibold rounded-lg ${viewMode === 'skill' ? 'app-wallpaper-surface text-foreground shadow-sm' : 'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-black/5 dark:hover:bg-white/5'}`"
);

// 4. Filter chips (All/Text/Image)
content = content.replace(
  /: 'app-wallpaper-chip border border-transparent bg-transparent text-muted-foreground hover:bg-sidebar-accent app-background-mode-image:hover:bg-foreground\/10 hover:text-foreground'/g,
  ": 'text-muted-foreground hover:bg-sidebar-accent app-background-mode-image:hover:bg-foreground/10 hover:text-foreground'"
);

// 5. Tags and buttons
content = content.replace(
  /: 'app-wallpaper-chip border border-border bg-sidebar-accent text-sidebar-foreground\/70 hover:bg-primary hover:text-white'/g,
  ": 'app-wallpaper-chip border border-border/50 text-sidebar-foreground/70 hover:bg-primary hover:text-white hover:border-primary'"
);

content = content.replace(
  /: 'app-wallpaper-chip border border-border bg-transparent text-foreground\/80 hover:bg-primary hover:text-white'/g,
  ": 'app-wallpaper-chip border border-border/50 text-foreground/80 hover:bg-primary hover:text-white hover:border-primary'"
);


fs.writeFileSync(filePath, content);
