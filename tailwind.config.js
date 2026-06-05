/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#07070A',
        panel: '#0D0D14',
        surface: '#12121C',
        elevated: '#1A1A28',
        border: '#1E1E30',
        'purple-neon': '#7B2FF7',
        'purple-glow': '#9B4FFF',
        'purple-dim': '#4A1A99',
        'blue-neon': '#3A86FF',
        'blue-glow': '#60A5FA',
        'blue-dim': '#1E4D99',
        'cyan-neon': '#00F5FF',
        'green-neon': '#00FF88',
        'red-neon': '#FF3366',
        'gold-neon': '#FFD700',
        'text-primary': '#F5F5F5',
        'text-secondary': '#A0A0B8',
        'text-dim': '#606078',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'particle': 'particle 8s linear infinite',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.4s ease-out',
        'spin-slow': 'spin 8s linear infinite',
        'typing': 'typing 0.05s steps(1) infinite',
        'border-glow': 'borderGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.7', filter: 'brightness(1.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        particle: {
          '0%': { transform: 'translateY(100vh) translateX(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100px) translateX(100px)', opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        borderGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(123, 47, 247, 0.3), inset 0 0 10px rgba(123, 47, 247, 0.1)' },
          '50%': { boxShadow: '0 0 25px rgba(123, 47, 247, 0.7), inset 0 0 20px rgba(123, 47, 247, 0.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(123,47,247,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(123,47,247,0.05) 1px, transparent 1px)',
        'radial-glow': 'radial-gradient(ellipse at center, rgba(123,47,247,0.15) 0%, transparent 70%)',
        'hero-gradient': 'radial-gradient(ellipse at 60% 50%, rgba(123,47,247,0.2) 0%, rgba(58,134,255,0.1) 40%, transparent 70%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.05) 50%, transparent 75%)',
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(123, 47, 247, 0.5), 0 0 40px rgba(123, 47, 247, 0.3)',
        'neon-blue': '0 0 20px rgba(58, 134, 255, 0.5), 0 0 40px rgba(58, 134, 255, 0.3)',
        'neon-cyan': '0 0 20px rgba(0, 245, 255, 0.5)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.5)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.05)',
        'card-hover': '0 16px 48px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(123,47,247,0.3)',
      },
    },
  },
  plugins: [],
};
