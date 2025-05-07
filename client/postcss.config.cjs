// client/postcss.config.cjs
const tailwind = require('@tailwindcss/postcss');
const autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [
    tailwind(),      // ← invoke the Tailwind v4 PostCSS plugin
    autoprefixer(),  // ← vendor prefixes
  ],
};
