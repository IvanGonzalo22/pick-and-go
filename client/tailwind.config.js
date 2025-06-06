/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tuffy', 'sans-serif'],
      },
      colors: {
        'fondo-principal': '#F8CBAD',
      }
    }
  },
  plugins: []
};
