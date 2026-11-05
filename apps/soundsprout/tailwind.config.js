/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        read: ['var(--read-font)'],
        ui: ['ui-rounded', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
