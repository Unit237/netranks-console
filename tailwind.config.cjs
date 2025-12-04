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
        // Members page specific colors from screenshot
        "page-bg": "#F7F8FA",
        "card-bg": "#FFFFFF",
        "card-border": "#EEF0F2",
        "muted-text": "#97A0A9",
        "owner-blue": "#2F80ED",
        "editor-orange": "#F2994A",
        "trash-red": "#E63838",
        "hover-bg": "#FCFCFD",
      },
      borderRadius: {
        "card-lg": "12px",
        "card-xl": "16px",
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        "subtle": "0 1px 4px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
