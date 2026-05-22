/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        wood: '#8B6914',
        woodDark: '#5C4A1E',
        woodLight: '#A07820',
        bookSpine: {
          red: '#8B2020',
          blue: '#1E3A8A',
          green: '#1A5C2A',
          purple: '#4A1A6B',
          orange: '#8B4A1A',
          brown: '#5C3A1A',
          navy: '#0F2040',
          forest: '#1A3A1A',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        dark: {
          100: '#3d2b1a',
          200: '#2d1f12',
          300: '#1f1509',
          400: '#1a0f0a',
          500: '#120a07',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
