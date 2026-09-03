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
  sans: ['Inter', 'system-ui', 'sans-serif'],
},
      colors: {
        brand: {
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        teal: {
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(99, 102, 241, 0.15)',
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
          "primary": "#6366f1",        // Indigo
          "secondary": "#3b82f6",      // Blue
          "accent": "#14b8a6",         // Teal
          "neutral": "#151b2e",        // Deep Slate Navy
          "base-100": "#0a0e1a",       // Deep Navy Black
          "info": "#3b82f6",           // Blue
          "success": "#10b981",        // Emerald
          "warning": "#f59e0b",        // Amber (used sparingly)
          "error": "#ef4444",          // Red
        },
      },
    ],
  },
}