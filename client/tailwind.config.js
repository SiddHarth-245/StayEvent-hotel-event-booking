/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'] },
      colors: {
        brand: { DEFAULT: '#0b3a8c', dark: '#072a66', light: '#e8f0fc' },
        sun: { DEFAULT: '#ffb700', dark: '#e6a400' },
        link: '#0071c2',
        good: '#008234',
        mist: '#f3f6fb',
      },
    },
  },
  plugins: [],
};
