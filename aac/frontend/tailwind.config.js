/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Calm palette — soft, low-contrast tones easy on the eyes.
        calm: {
          bg: "#f4f6f8",
          surface: "#ffffff",
          border: "#e2e8ec",
          text: "#2b3440",
          muted: "#6b7785",
          primary: "#5b8a9b",
          "primary-soft": "#cfe2e8",
          accent: "#8aa6b0",
          warm: "#d9b48f",
          neutral: "#9fb3bd",
          direct: "#7e9aa6",
        },
      },
      spacing: {
        // Large touch-friendly defaults.
        touch: "3.5rem",
        "touch-lg": "5rem",
      },
      minHeight: {
        touch: "3.5rem",
      },
      minWidth: {
        touch: "3.5rem",
      },
      borderRadius: {
        calm: "1.25rem",
      },
      fontSize: {
        // Larger readable base sizes for accessibility.
        "aac-base": ["1.25rem", { lineHeight: "1.6" }],
        "aac-lg": ["1.75rem", { lineHeight: "1.5" }],
        "aac-xl": ["2.5rem", { lineHeight: "1.3" }],
      },
    },
  },
  plugins: [],
};
