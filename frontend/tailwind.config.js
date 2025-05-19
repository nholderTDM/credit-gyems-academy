export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFD700', // Gold from logo
          light: '#FFECAA',
          dark: '#CCAC00',
        },
        secondary: {
          DEFAULT: '#FF0000', // Red from logo
          light: '#FF6666',
          dark: '#CC0000',
        },
        navy: '#0A2342',
        teal: '#26A69A',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}