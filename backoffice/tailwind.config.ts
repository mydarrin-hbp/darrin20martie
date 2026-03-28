import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#f3efe7",
        panel: "#fffaf4",
        ink: "#1f2328",
        muted: "#5f6b76",
        accent: "#0f766e",
        accentStrong: "#115e59",
        border: "rgba(15, 118, 110, 0.14)",
        amber: "#b45309"
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"]
      },
      boxShadow: {
        panel: "0 18px 60px rgba(31, 35, 40, 0.08)"
      }
    }
  },
  plugins: [],
};

export default config;
