import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light Brutalist Palette
        'brutalist': {
          'bg': '#F5F5F0',
          'bg-dark': '#E8E8E0',
          'surface': '#FFFFFF',
          'text': '#000000',
          'text-secondary': '#6B7280',
          'border': '#000000',
        },
        // Accents
        'coral': {
          DEFAULT: '#FF2E63',
          50: '#FFE5EC',
          100: '#FFB8D0',
          200: '#FF8BB4',
          300: '#FF5E98',
          400: '#FF2E63',
          500: '#FF0047',
          600: '#CC0039',
          700: '#99002B',
          800: '#66001D',
          900: '#33000E',
        },
        'cyan': {
          DEFAULT: '#08D9D6',
          50: '#E5FDFC',
          100: '#B3F8F7',
          200: '#81F4F2',
          300: '#4FEEEC',
          400: '#08D9D6',
          500: '#06B0AD',
          600: '#058784',
          700: '#035E5C',
          800: '#023533',
          900: '#010C0C',
        },
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
        body: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        // Brutalist shadows
        'brutalist': '8px 8px 0px 0px rgba(0, 0, 0, 1)',
        'brutalist-sm': '2px 2px 0px 0px rgba(0, 0, 0, 1)',
        'brutalist-md': '4px 4px 0px 0px rgba(0, 0, 0, 1)',
        'brutalist-lg': '8px 8px 0px 0px rgba(0, 0, 0, 1)',
        'brutalist-xl': '12px 12px 0px 0px rgba(0, 0, 0, 1)',
        'brutalist-hover': '12px 12px 0px 0px rgba(0, 0, 0, 1)',
        'accent': '4px 4px 0px 0px #FF2E63',
        'accent-lg': '8px 8px 0px 0px #FF2E63',
      },
      borderWidth: {
        'brutalist': '2px',
        '3': '3px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'brutalist': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      animation: {
        // Base animations
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        // Loading
        'shimmer': 'shimmer 1.5s infinite',
        'spin': 'spin 1s linear infinite',
        // Existing
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glow: {
          '0%': { opacity: '0.2', transform: 'scale(1)' },
          '100%': { opacity: '0.4', transform: 'scale(1.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backgroundImage: {
        'skeleton': 'linear-gradient(90deg, #E8E8E0 25%, #FFFFFF 50%, #E8E8E0 75%)',
      },
      backgroundSize: {
        'skeleton': '200% 100%',
      },
    },
  },
  plugins: [
    // Custom plugin for brutalist utilities
    function({ addUtilities }: { addUtilities: Function }) {
      addUtilities({
        '.transition-brutalist': {
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.hover-lift': {
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translate(-2px, -2px)',
            boxShadow: '12px 12px 0px 0px rgba(0, 0, 0, 1)',
          },
        },
        '.hover-shadow': {
          transition: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '8px 8px 0px 0px rgba(0, 0, 0, 1)',
          },
        },
      });
    },
  ],
};

export default config;
