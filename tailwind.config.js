/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a4b8fd',
          400: '#7b91f9',
          500: '#5a6af4',
          600: '#4348e8',
          700: '#3836ce',
          800: '#302fa6',
          900: '#2d2d83',
          950: '#1c1b50',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6a0a',
        },
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        display: ['"Clash Display"', '"Space Grotesk"', 'sans-serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      boxShadow: {
        'card':  '0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,.12), 0 12px 32px rgba(0,0,0,.10)',
        'glow':  '0 0 24px rgba(90,106,244,.35)',
      },
    },
  },
  plugins: [],
};
