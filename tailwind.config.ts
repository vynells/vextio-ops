import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0B0D",
        surface: "#141417",
        surface2: "#1C1C21",
        border: "#26262C",
        text: "#EDEDEF",
        muted: "#8B8B93",
        accent: "#E8593A",
        accentHover: "#FF6B47",
        success: "#3DBE7A",
        warn: "#E0A93D",
        danger: "#E0483D",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.96)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.35s ease-out both",
        pop: "pop 0.15s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
