import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          950: "#07080F",
          900: "#0D0F1C",
          850: "#0F1220",
          800: "#111425",
        },
        pulsar: {
          DEFAULT: "#6366F1",
          50:  "rgba(99,102,241,0.05)",
          100: "rgba(99,102,241,0.10)",
          200: "rgba(99,102,241,0.20)",
          300: "rgba(99,102,241,0.30)",
        },
        aurora: {
          DEFAULT: "#22D3EE",
          50:  "rgba(34,211,238,0.05)",
          100: "rgba(34,211,238,0.10)",
          200: "rgba(34,211,238,0.20)",
        },
        glass: {
          border: "rgba(99,102,241,0.15)",
          "border-light": "rgba(255,255,255,0.06)",
          bg: "rgba(255,255,255,0.03)",
        },
      },
      backgroundImage: {
        "pulsar-gradient": "linear-gradient(135deg, #6366F1, #22D3EE)",
        "pulsar-gradient-soft": "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.08))",
        "void-gradient": "linear-gradient(180deg, #07080F 0%, #0D0F1C 100%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        "pulsar":    "0 0 20px rgba(99,102,241,0.35)",
        "aurora":    "0 0 20px rgba(34,211,238,0.35)",
        "pulsar-lg": "0 8px 40px rgba(99,102,241,0.30)",
        "glass":     "0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        "card":      "0 2px 16px rgba(0,0,0,0.3)",
      },
      animation: {
        "pulse-slow":     "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow":           "glow 2s ease-in-out infinite alternate",
        "fade-in":        "fadeIn 0.3s ease-out",
        "slide-up":       "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slideInRight 0.3s ease-out",
      },
      keyframes: {
        glow:         { "0%": { boxShadow: "0 0 10px rgba(99,102,241,0.3)" }, "100%": { boxShadow: "0 0 25px rgba(99,102,241,0.6)" } },
        fadeIn:       { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp:      { "0%": { transform: "translateY(10px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        slideInRight: { "0%": { transform: "translateX(20px)", opacity: "0" }, "100%": { transform: "translateX(0)", opacity: "1" } },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
