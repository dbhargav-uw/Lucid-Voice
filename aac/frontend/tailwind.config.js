/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Lucid Voice "ink" console palette (DESIGN.md) ─────────────────
        // Deep, warm indigo-black canvas — premium, calm, never clinical.
        ink: "#14121C",
        "ink-raised": "#1E1B29", // cards, strip, rail surfaces
        "ink-sunken": "#100E16", // wells (vocab board, transcript)
        "ink-line": "#2C2838", // hairline borders / dividers

        text: "#F4EFE9", // primary text (warm "paper")
        "text-muted": "#A39DB0", // secondary text / labels
        "text-faint": "#6E6880", // placeholders, disabled

        // THE HUMAN — warm amber (their words, their voice, primary actions).
        voice: "#F6A063",
        "voice-deep": "#E07a40",
        "voice-soft": "#2E2620", // warm tint on dark (selected utterance bg)

        // THE MACHINE — cool aqua (reasoning, confidence, machine state).
        mind: "#63DCC9",
        "mind-soft": "#18292B",

        // Register triad — tone tags, ALWAYS paired with a text label.
        // Violet desaturated away from the "AI purple" tell.
        register: {
          warm: "#F6B27E",
          neutral: "#AEA6CF",
          direct: "#79DDCC",
        },

        // Legacy calm palette retained for non-focus views (Conversation/Graph).
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
      fontFamily: {
        // One sans/mono superfamily (Geist) for the interface + the machine's
        // data; one reading serif (Newsreader) reserved for the human utterance.
        ui: ['"Geist"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
        utter: ['"Newsreader"', "ui-serif", "Georgia", "serif"],
      },
      spacing: {
        // Large touch-friendly defaults (preserve AAC ergonomics).
        touch: "3.5rem",
        "touch-lg": "5rem",
        tile: "6rem", // tiles ≥ 96px tall
        cta: "4rem", // CTAs ≥ 64px
      },
      minHeight: {
        touch: "3.5rem",
        tile: "6rem",
        cta: "4rem",
      },
      minWidth: {
        touch: "3.5rem",
      },
      borderRadius: {
        // Locked radius scale (one system, applied consistently).
        xl: "20px", // cards, stage, rail
        lg: "14px", // tiles, strip, inputs
        md: "10px", // small buttons / chips
        calm: "1.25rem", // legacy (Conversation/Graph)
      },
      transitionTimingFunction: {
        // Exponential ease-out — confident, no bounce. (impeccable motion rule)
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
      },
      fontSize: {
        // AAC-readable base sizes (retained).
        "aac-base": ["1.0625rem", { lineHeight: "1.6" }],
        "aac-lg": ["1.5rem", { lineHeight: "1.5" }],
        "aac-xl": ["2.5rem", { lineHeight: "1.3" }],
        // New scale roles (DESIGN.md type scale).
        stage: ["clamp(2rem, 4.5vw, 3.25rem)", { lineHeight: "1.15" }],
        candidate: ["clamp(1.5rem, 2.4vw, 2rem)", { lineHeight: "1.25" }],
        tile: ["1.5rem", { lineHeight: "1.2" }],
        eyebrow: ["0.8125rem", { lineHeight: "1.4", letterSpacing: "0.12em" }],
        reason: ["0.95rem", { lineHeight: "1.5" }],
      },
      boxShadow: {
        // Tinted depth, not pure-black drop shadows; subtle top-edge highlight.
        card: "inset 0 1px 0 0 rgba(255,255,255,0.04), 0 22px 46px -30px rgba(8,6,14,0.9)",
        lift: "inset 0 1px 0 0 rgba(255,255,255,0.06), 0 18px 40px -24px rgba(8,6,14,0.85)",
        // The speak moment's warmth comes from a tinted shadow, not a neon glow.
        utter: "inset 0 1px 0 0 rgba(246,160,99,0.14), 0 26px 60px -30px rgba(224,122,64,0.4)",
      },
    },
  },
  plugins: [],
};
