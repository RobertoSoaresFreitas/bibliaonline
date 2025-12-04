/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // garante que o tailwind processe arquivos dentro de src
    "./app/**/*.{js,jsx,ts,tsx}"  // caso use app router
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
