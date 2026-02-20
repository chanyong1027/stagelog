/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1DB954',
          dark: '#1AA34A',
          light: '#1ED760',
        },
        secondary: {
          DEFAULT: '#191414',
          light: '#282828',
        },
        accent: {
          DEFAULT: '#FF6B6B',
          light: '#FF8787',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontSize: {
        'title': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'subtitle': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
}
