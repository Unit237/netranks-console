/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "selector",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#EA580C",
        "primary-hover": "#cc460a",
        greyColor: "#F8F8F8EE",
        greenColor: "#16A34A",
      },
    },
  },
  plugins: [],
};
