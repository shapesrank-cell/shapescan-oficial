/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        colibri: {
          bg: '#0f172a',
          surface: '#1e293b',
          'surface-hover': '#334155',
          border: '#334155',
          primary: '#38bdf8',
          'primary-hover': '#7dd3fc',
          secondary: '#a78bfa',
          accent: '#34d399',
          warning: '#fbbf24',
          danger: '#f87171',
          text: '#f1f5f9',
          'text-muted': '#94a3b8',
          'text-dim': '#64748b',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
