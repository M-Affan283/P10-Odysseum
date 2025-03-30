/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#070f1b",
                secondary: "#8C00E3",
                accent: "#28154e",
            },
        },
    },
    plugins: [],
}