import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./context/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: {
      paper: "#090D16",
      ink: "#F8FAFC",
      surface: {
        DEFAULT: "#0F172A",
        subtle: "#1E293B",
        card: "rgba(15, 23, 42, 0.72)",
        border: "rgba(255, 255, 255, 0.09)"
      },
      emerald: {
        DEFAULT: "#10B981",
        300: "#6EE7B7",
        400: "#34D399",
        500: "#10B981",
        600: "#059669",
        700: "#047857",
        800: "#065F46",
        900: "#064E3B",
        tint: "rgba(16, 185, 129, 0.12)",
        glow: "rgba(16, 185, 129, 0.25)"
      }
    },
    fontFamily: { sans: ["var(--font-inter)", "sans-serif"], heading: ["var(--font-jakarta)", "sans-serif"] },
    boxShadow: {
      soft: "0 12px 40px -20px rgba(0,0,0,0.6)",
      glow: "0 0 35px -5px rgba(16, 185, 129, 0.2)"
    },
  } },
  plugins: [],
};
export default config;
