/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx" // this will include all folders and files in src recursively 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

