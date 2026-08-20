/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        supabase: {
          brand: "#3FCF8E",
          brandDark: "#097C4F",
          brandMedium: "#16B674",
          brandDeep: "#0A844E",
          brandLight: "#72E3AD",
          brandPale: "#A9F1CA",
          orange: "#DC7B18",
          orangeLight: "#F3BA63",
          bgDark: "#121212",
          surfaceDark: "#1C1C1C",
          surfaceElevated: "#242424",
          borderDark: "#2E2E2E",
          borderLight: "rgba(0, 0, 0, 0.12)",
          textDark: "#EDEDED",
          textMuted: "#808080",
          textLight: "#121212",
        },
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'Source Code Pro'", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        supabase: "0 1px 2px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)",
        glow: "0 0 20px rgba(63, 207, 142, 0.25)",
      },
    },
  },
  plugins: [],
};
