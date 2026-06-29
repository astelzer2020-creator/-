/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#080c14',
          800: '#0d1526',
          700: '#111d35',
          600: '#1a2744',
          500: '#243358',
        },
        brand: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        muted: '#64748b',
        text: {
          primary: '#f1f5f9',
          muted: '#64748b',
        },
        primary: { 50: '#eef2ff', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 900: '#312e81' },
        accent: { 500: '#06b6d4', 600: '#0891b2' }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      boxShadow: {
        glow: '0 0 24px rgba(99,102,241,0.35)',
        card: '0 4px 24px rgba(0,0,0,0.35)',
      },
      backdropBlur: { xs: '2px' },
    }
  },
  plugins: []
}
