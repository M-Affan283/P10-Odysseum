/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}" // this will include all folders and files in src recursively 
  ],
  theme: {
    extend: {
      colors: {
        primary: "#161622",
        secondary: {
          DEFAULT: "#FF9C01",
          100: "#FF9001",
          200: "#FF8E01",
        },
        black: {
          DEFAULT: "#000",
          100: "#1E1E2D",
          200: "#232533",
        },
        gray: {
          100: "#CDCDE0",
        },
      },
      fontFamily: {
        dsregular: ["DancingScript_400Regular", "serif"],
        dsmedium: ["DancingScript_500Medium", "serif"],
        dssemibold: ["DancingScript_600SemiBold", "serif"],
        dsbold: ["DancingScript_700Bold", "serif"],
      },
    },
  },
  plugins: [],
}

