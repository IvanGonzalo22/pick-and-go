import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},   // no custom theme—use default colors and spacing
  },
  plugins: [],    // no extra plugins
};

export default config;
