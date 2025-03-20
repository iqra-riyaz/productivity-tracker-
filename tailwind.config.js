/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        darkbg: '#1a1a1a',
        'darkbg-light': '#2d2d2d',
        lavender: '#9370DB',
        'lavender-light': '#E6E6FA',
        'lavender-dark': '#7B68EE',
        skyblue: '#87CEEB',
        'skyblue-light': '#F0F8FF',
        'skyblue-dark': '#00BFFF',
        mint: '#98D8C8',
        'mint-light': '#F0FFF0',
        'mint-dark': '#3CB371',
        softpink: {
          light: '#FFDDF4',
          DEFAULT: '#FFBBDD',
          dark: '#FFC0CB',
        },
        lightbg: '#F8FAFC',
        softblue: '#87CEEB',
        'softblue-light': '#B0E0E6',
        "sky-blue": "#87CEEB",
        "light-pink": "#FFDDF4",
        "dark-purple": "#4B0082",
        "dark-blue": "#191970",
        "dark-pink": "#C71585",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'dots-pattern': 'url("/patterns/dots.svg")',
        'waves-pattern': 'url("/patterns/waves.svg")',
        'abstract-pattern': 'url("/patterns/abstract.svg")',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
} 