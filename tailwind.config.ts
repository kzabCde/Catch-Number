import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        thai: ["'LINE Seed Sans TH'", "'Noto Sans Thai'", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 30px rgba(255,255,255,0.45)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        floaty: "floaty 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
