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

// module.exports = {
//   content: [
//     "./app/**/*.{js,jsx,ts,tsx}",
//     "./src/**/*.{js,jsx,ts,tsx}" // this will include all folders and files in src recursively
//   ],
//   theme: {
//     extend: {
//       colors: {
//         primary: {
//           100: "#CFE3F3",
//           200: "#A3C7E8",
//           300: "#678FBA",
//           400: "#345176",
//           500: "#070F1B",
//           600: "#050B17",
//           700: "#030813",
//           800: "#02050F",
//           900: "#01040C",
//         },
//         success: {
//           100: "#D3F9CD",
//           200: "#A0F39E",
//           300: "#69DD71",
//           400: "#40BB55",
//           500: "#128E33",
//           600: "#0D7A34",
//           700: "#096633",
//           800: "#055230",
//           900: "#03442D",
//         },
//         info: {
//           100: "#C7F9F0",
//           200: "#92F3EA",
//           300: "#58DBDA",
//           400: "#2FAEB8",
//           500: "#017589",
//           600: "#005B75",
//           700: "#004462",
//           800: "#00314F",
//           900: "#002341",
//         },
//         warning: {
//           100: "#FAECCA",
//           200: "#F5D596",
//           300: "#E2B05F",
//           400: "#C58837",
//           500: "#A05606",
//           600: "#894304",
//           700: "#733203",
//           800: "#5C2301",
//           900: "#4C1901",
//         },
//         danger: {
//           100: "#FADAD1",
//           200: "#F6B0A5",
//           300: "#E47874",
//           400: "#CA4D54",
//           500: "#A81E32",
//           600: "#901533",
//           700: "#780F32",
//           800: "#61092E",
//           900: "#50052C",
//         },
//       },
//       fontFamily: {
//         dsregular: ["DancingScript_400Regular", "serif"],
//         dsmedium: ["DancingScript_500Medium", "serif"],
//         dssemibold: ["DancingScript_600SemiBold", "serif"],
//         dsbold: ["DancingScript_700Bold", "serif"],
//       },
//     },
//   },
//   plugins: [],
// }

