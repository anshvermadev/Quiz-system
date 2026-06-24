import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#98D8C8", // Mint Green
        accent: "#E6B8A2", // Rose Gold/Dusty Pink
        background: "#FFFFFF", // Pure White
        foreground: "#3D5A5B", // Teal Gray
        highlight: "#D4F1F4", // Ice Mint
        muted: "#E2E8F0", // Slate 200 - keeping a neutral gray for muted elements if needed, or we could use a lighter teal. Let's start with a standard neutral or maybe deriving from teal? Let's stick to the requested 5 first, but I'll add a 'muted-foreground' maybe?
        // Actually, let's just stick to the 5 requested ones for now + standard tailwind colors.
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-garamond)", "serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
