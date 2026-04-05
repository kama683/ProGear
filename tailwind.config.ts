// ─── tailwind.config.ts ───────────────────────────────────────────────────────
// Place this file at the ROOT of your Vite project (same level as package.json).
import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans:    ['DM Sans', 'sans-serif'],
        mono:    ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
      },
      colors: {
        accent:  '#00f5d4',
        'accent-bright': '#00e5ff',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' },
                   to:   { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
} satisfies Config;
