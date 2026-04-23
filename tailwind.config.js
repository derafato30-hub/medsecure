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
          DEFAULT: '#2563eb',
          hover: '#1d4ed8'
        },
        danger: {
          DEFAULT: '#ef4444',
          hover: '#dc2626'
        },
        surface: '#ffffff',
        background: '#f8fafc',
      }
    },
  },
  plugins: [],
}
