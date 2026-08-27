import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
        },
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        text: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
        },
        border: "var(--color-border)",
        success: "var(--color-success)",
        danger: "var(--color-danger)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        // added for Stitch dashboard markup — all point at your existing Geist var,
        // no new font is being loaded
        "body-lg": ["var(--font-geist-sans)"],
        "headline-lg": ["var(--font-geist-sans)"],
        "label-md": ["var(--font-geist-sans)"],
        "label-sm": ["var(--font-geist-sans)"],
        "body-md": ["var(--font-geist-sans)"],
        "display-lg": ["var(--font-geist-sans)"],
        "headline-md": ["var(--font-geist-sans)"],
      },
      fontSize: {
        // added for Stitch dashboard markup
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "headline-lg": [
          "32px",
          { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        "label-md": [
          "14px",
          { lineHeight: "1.4", letterSpacing: "0.01em", fontWeight: "500" },
        ],
        "label-sm": [
          "12px",
          { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "600" },
        ],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "display-lg": [
          "48px",
          { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        "headline-md": [
          "24px",
          { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "500" },
        ],
      },
      spacing: {
        // added for Stitch dashboard markup
        margin: "32px",
        lg: "24px",
        md: "16px",
        gutter: "24px",
        unit: "4px",
        xxl: "64px",
        xs: "4px",
        xl: "40px",
        sm: "8px",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
