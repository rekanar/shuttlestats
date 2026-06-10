/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        teamA: '#3B82F6',
        teamB: '#F97316',
      },
    },
  },
  plugins: [],
}
