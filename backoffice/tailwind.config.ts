import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "var(--bg)",
        panel: "var(--panel)",
        ink: "var(--text)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        accentStrong: "var(--accent-strong)",
        border: "var(--border)",
        amber: "#ef7f1a",
        ai: "var(--ai)"
      },
      fontFamily: {
        display: ["var(--font-inter)", "sans-serif"]
      },
      boxShadow: {
        panel: "0 18px 60px rgba(30, 46, 77, 0.08)"
      }
    }
  },
  plugins: [],
};

export default config;
