/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],

  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#7fb714',
          neutral: '#1a1a1a',
          'base-100': '#fefefe',
        },
      },
    ],
  },
};
