/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          primary: '#2DFF9A',
          dark: '#0B1F18',
          gold: '#FEBF3C',
          hulk: '#0CBE69',
          black: '#000000',
        },
        dark: {
          50: '#1A2236',
          100: '#201916',
          200: '#0B1F18',
          300: '#000000',
        }
      },
      boxShadow: {
        'btn-red': '40px 41px 57px rgba(255, 0, 0, 0.44)',
        'glow-green': '0px 4px 20px rgba(45, 255, 154, 0.8), 0px 0px 40px rgba(45, 255, 154, 0.4)',
        'logo-white': '0px 4px 82px rgba(255, 255, 255, 0.25), 31px 53px 80px rgba(178, 133, 133, 0.25)',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
