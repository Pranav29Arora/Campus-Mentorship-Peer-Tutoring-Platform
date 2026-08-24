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
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        light: {
          bg: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
          subtle: '#f1f5f9',
        },
        dark: {
          bg: '#0b0f19',
          card: '#161d30',
          border: '#242f4c'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
        'mesh-light': 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.08) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.08) 0, transparent 50%), radial-gradient(at 50% 100%, rgba(59, 130, 246, 0.05) 0, transparent 50%)',
      },
      boxShadow: {
        'glass': '0 8px 30px rgba(0, 0, 0, 0.04)',
        'glass-hover': '0 20px 35px -10px rgba(99, 102, 241, 0.15)',
        'card-soft': '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-delayed': 'float 5s ease-in-out 1.5s infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'blob': 'blob 8s infinite',
        'shimmer': 'shimmer 2.5s infinite'
      }
    },
  },
  plugins: [],
}
