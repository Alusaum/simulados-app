/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold:  { DEFAULT: '#c8922a', light: '#e8b84b', glow: 'rgba(200,146,42,0.18)' },
        ink:   '#0a0a0a',
        paper: '#f5f0e8',
        cream: '#ede8da',
        sage:  '#3d5a47',
      },
      fontFamily: {
        sans:  ['DM Sans', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
        mono:  ['DM Mono', 'monospace'],
      },
      animation: {
        'fade-up':    'fadeUp .35s ease both',
        'spin-slow':  'spin 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
