/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        gold: {
          300: '#fde047',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(245, 158, 11, 0.15)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    darkTheme: "dark",
    themes: [
      {
        dark: {
          "primary": "#f59e0b",        // Warm Amber / Gold
          "secondary": "#d97706",      // Deep Gold / Bronze
          "accent": "#f97316",         // Warm Orange
          "neutral": "#182030",        // Deep Charcoal
          "base-100": "#090d16",       // Obsidian Black/Slate
          "info": "#f59e0b",           // Amber
          "success": "#d97706",        // Gold
          "warning": "#f97316",        // Warm Orange
          "error": "#dc2626",          // Crimson
        },
      },
    ],
  },
}
