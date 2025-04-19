/** @type {import('tailwindcss').Config} */
module.exports = {
   content: [
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
   ],
   safelist: [
      'max-h-48',
      'w-[150px]',
      'w-[240px]',
      'min-w-[270px]',
      'min-w-[180px]',
      'max-w-[180px]',
    ],
   theme: {
     extend: {},
   },
   plugins: [],
 };
