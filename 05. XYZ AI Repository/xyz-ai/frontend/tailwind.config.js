/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        body: "#f7f7f5",
        card: "#ffffff",
        sidebar: "#ffffff",
        border: "#e8e8e6",
        "border-hover": "#d0d0ce",
        "text-primary": "#1a1a2e",
        "text-secondary": "#6b7280",
        "text-tertiary": "#9ca3af",
        accent: "#10b981",
        "accent-light": "#d1fae5",
        "accent-dark": "#059669",
        danger: "#ef4444",
        "danger-light": "#fee2e2",
        warning: "#f59e0b",
        "warning-light": "#fef3c7",
        info: "#3b82f6",
        "info-light": "#dbeafe",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        sidebar: "1px 0 0 #e8e8e6",
        modal: "0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",
        input: "0 1px 2px rgba(0,0,0,0.04)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-right": {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "dot-pulse": {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out forwards",
        "slide-up": "slide-up 0.3s ease-out forwards",
        "slide-right": "slide-right 0.2s ease-out forwards",
        "scale-in": "scale-in 0.2s ease-out forwards",
        "dot-pulse": "dot-pulse 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
