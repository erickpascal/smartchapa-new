import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1A6B3C",
          dark: "#0D4A2B",
          light: "#E8F4ED",
        },
        accent: {
          DEFAULT: "#F5A623",
          light: "#FFF8E7",
        },
        danger: "#D32F2F",
        neutral: "#F4F4F2",
      },
      borderRadius: {
        xl: "0.75rem",
        lg: "0.5rem",
      },
    },
  },
  plugins: [],
};

export default config;

