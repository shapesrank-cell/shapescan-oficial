/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        colibri: {
          bg: '#121214',
          surface: '#1A1A1E',
          subtle: '#232328',
          primary: '#7C3AED',
          'primary-light': '#A78BFA',
          success: '#34D399',
          warn: '#FBBF24',
          text: '#F4F4F5',
          'text-secondary': '#A1A1AA',
          'text-muted': '#52525B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      minHeight: {
        'touch': '48px',
      },
      minWidth: {
        'touch': '48px',
      },
    },
  },
  plugins: [],
}
