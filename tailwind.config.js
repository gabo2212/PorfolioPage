module.exports = {
  content: ["./index.html"],
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        sans: ['SF Pro Text', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        night: '#05070b',
        dusk: '#0f172a',
        dawn: '#f8fafc',
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      boxShadow: {
        glow: '0 25px 65px -35px rgba(59, 130, 246, 0.85)',
        card: '0 45px 80px -40px rgba(15, 23, 42, 0.9)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(28px) scale(.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s ease-out forwards',
        shimmer: 'shimmer 3.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
