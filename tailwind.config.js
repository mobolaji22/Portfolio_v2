const tokens = require("./design/tokens.json");

// Everything here comes from design/tokens.json (copied from Design's tokens.json) or the
// CSS variables generated from it into app/tokens.css. Do not add a second palette.
const px = (n) => `${n}px`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    screens: {
      ...Object.fromEntries(
        Object.entries(tokens.breakpoints)
          .filter(([k]) => k !== "testWidths")
          .map(([k, v]) => [k, px(v)])
      ),
      // two-column hero (headline left, whole demo right): an Engineering decision, see 03 round 4
      hero: "1240px",
    },
    spacing: {
      px: "1px",
      ...Object.fromEntries(Object.entries(tokens.spacing.px).map(([k, v]) => [`s${k}`, px(v)])),
      // the default numeric scale is kept (4 px steps) for component-internal sizes
      0: "0px", 0.5: "2px", 1: "4px", 1.5: "6px", 2: "8px", 2.5: "10px", 3: "12px", 3.5: "14px",
      4: "16px", 5: "20px", 6: "24px", 7: "28px", 8: "32px", 9: "36px", 10: "40px", 11: "44px",
      12: "48px", 14: "56px", 16: "64px", 20: "80px", 24: "96px", 28: "112px", 32: "128px",
    },
    extend: {
      colors: {
        page: "var(--c-surface-page)",
        sunken: "var(--c-surface-sunken)",
        hover: "var(--c-surface-hover)",
        ink: {
          DEFAULT: "var(--c-text-primary)",
          2: "var(--c-text-secondary)",
          3: "var(--c-text-muted)",
          inverse: "var(--c-text-inverse)",
        },
        rule: { DEFAULT: "var(--c-border-subtle)", strong: "var(--c-border-strong)" },
        mark: { DEFAULT: "var(--c-mark-fill)", ink: "var(--c-mark-ink)" },
        g: {
          page: "var(--c-g-page)",
          card: "var(--c-g-card)",
          text: "var(--c-g-text)",
          muted: "var(--c-g-muted)",
          border: "var(--c-g-border)",
          accent1: "var(--c-g-accent1)",
          accent2: "var(--c-g-accent2)",
          "pill-bg": "var(--c-g-pill-bg)",
          "pill-fg": "var(--c-g-pill-fg)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Times New Roman", "serif"],
        ui: ["var(--font-ui)", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "Courier New", "monospace"],
        gen: ["var(--font-gen)", "Arial", "sans-serif"],
      },
      fontSize: Object.fromEntries(
        Object.entries(tokens.type.styles).map(([k, s]) => [
          `t-${k}`,
          [s.fluid, { lineHeight: String(s.lineHeight), letterSpacing: s.letterSpacing, fontWeight: String(s.weight) }],
        ])
      ),
      borderRadius: {
        r1: "2px",
        r2: "4px",
        pill: "9999px",
      },
      maxWidth: { page: "1280px", content: "1200px", prose: "62ch", lead: "52ch" },
      transitionTimingFunction: {
        out: tokens.motion.easing.out,
        "in-out": tokens.motion.easing.inOut,
      },
    },
  },
  plugins: [],
};
