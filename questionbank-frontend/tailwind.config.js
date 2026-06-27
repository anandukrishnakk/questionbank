/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B1120',      // Deep Navy background
          navy: '#1E293B',      // Panel background
          electric: '#3B82F6',  // Bright Blue buttons/links
          accent: '#F59E0B',    // Gold/Yellow warning/star
          success: '#10B981',   // Emerald green
          danger: '#EF4444',    // Bright red
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

