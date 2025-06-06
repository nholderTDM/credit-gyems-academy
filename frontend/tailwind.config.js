/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from Credit Gyems Academy
        brand: {
          gold: '#FFD700',
          red: '#FF0000', 
          navy: '#0A2342',
          white: '#F8F8FF',
          gray: '#E8E8E8',
          teal: '#26A69A'
        },
        // Extended color palette for gradients
        primary: '#FFD700', // Gold
        secondary: '#FF0000', // Red
        accent: '#26A69A', // Teal
      },
      fontFamily: {
        'heading': ['Montserrat', 'sans-serif'],
        'body': ['Roboto', 'sans-serif'],
        'accent': ['Playfair Display', 'serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'cyber-glow': 'cyber-glow 3s ease-in-out infinite alternate',
        'progress-fill': 'progress-fill 2s ease-out',
        'team-celebration': 'team-celebration 0.6s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-gold': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'cyber-glow': {
          '0%': { opacity: '0.5', filter: 'brightness(1)' },
          '100%': { opacity: '0.8', filter: 'brightness(1.2)' },
        },
        'progress-fill': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'team-celebration': {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.05) rotate(1deg)' },
          '75%': { transform: 'scale(1.05) rotate(-1deg)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'coach': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'team': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.5)',
        'glow-red': '0 0 20px rgba(255, 0, 0, 0.5)',
        'glow-teal': '0 0 20px rgba(38, 166, 154, 0.5)',
      },
      backgroundImage: {
        'gradient-coach': 'linear-gradient(135deg, #FFD700, #FF0000, #26A69A)',
        'gradient-team': 'linear-gradient(to right, #26A69A, #20A48A)',
        'gradient-gold': 'linear-gradient(to right, #FFD700, #eab308)',
        'gradient-red': 'linear-gradient(to right, #FF0000, #dc2626)',
        'gradient-hero': 'linear-gradient(135deg, #fefce8, #ffffff, #fef2f2)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
  // Safelist important classes to ensure they're always generated
  safelist: [
    // Color variants that might be dynamically generated
    'from-yellow-400',
    'to-yellow-500', 
    'from-red-400',
    'to-red-500',
    'from-teal-400',
    'to-teal-500',
    'from-green-400',
    'to-green-500',
    'bg-yellow-50',
    'bg-red-50',
    'bg-teal-50',
    'bg-green-50',
    'text-yellow-500',
    'text-red-500',
    'text-teal-500',
    'text-green-500',
    'border-yellow-400',
    'border-red-400',
    'border-teal-400',
    'border-green-400',
    'ring-yellow-400',
    'ring-red-400',
    'ring-teal-400',
    'ring-green-400',
    // Animation classes
    'animate-pulse',
    'animate-bounce',
    'animate-spin',
    'animate-ping',
    // Transform classes
    'scale-105',
    'scale-110',
    '-translate-y-1',
    '-translate-y-2',
    'rotate-45',
    'rotate-90',
    // Opacity variants
    'opacity-0',
    'opacity-25',
    'opacity-50',
    'opacity-75',
    'opacity-100',
  ]
}