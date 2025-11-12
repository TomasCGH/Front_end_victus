/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mint: {
          50:  "#F1FCF6",
          100: "#E6FAF0",
          200: "#D3F3E0", // sugerida
          300: "#BFECD1",
          400: "#A7E6C2", // sugerida
          500: "#7FD8A6",
          600: "#55C988",
          700: "#37B270",
          800: "#2A8B58",
          900: "#1E6340",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Noto Sans",
          "Ubuntu",
          "Cantarell",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
