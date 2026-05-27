/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C96A',
          dark: '#A07830',
        },
        bg: {
          primary: '#0A0A0B',
          secondary: '#111113',
          card: '#161618',
          elevated: '#1C1C1F',
        },
        border: {
          DEFAULT: '#2A2A2D',
          light: '#3A3A3E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        float: 'float 3s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
