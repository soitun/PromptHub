/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/renderer/**/*.{ts,tsx}', './src/renderer/index.html'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          border: 'hsl(var(--sidebar-border))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // Motion tokens — see src/renderer/styles/motion-tokens.ts for the
      // single source of truth. Keep these in sync with that file.
      // 动画 token：source of truth 是 src/renderer/styles/motion-tokens.ts，
      // 修改时两边一起改。
      transitionDuration: {
        instant: '80ms',
        quick: '120ms',
        base: '180ms',
        smooth: '280ms',
        slow: '420ms',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        enter: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        exit: 'cubic-bezier(0.4, 0.0, 1, 1)',
        emphasized: 'cubic-bezier(0.2, 0.0, 0, 1)',
      },
      scale: {
        'press-in': '0.95',
        'enter-from': '0.96',
        'hover-lift': '1.02',
        'media-zoom': '1.08',
      },
      animationDuration: {
        instant: '80ms',
        quick: '120ms',
        base: '180ms',
        smooth: '280ms',
        slow: '420ms',
      },
      animationTimingFunction: {
        standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        enter: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        exit: 'cubic-bezier(0.4, 0.0, 1, 1)',
        emphasized: 'cubic-bezier(0.2, 0.0, 0, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
