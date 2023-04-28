import { type Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      gridTemplateColumns: {
        "fill-xs": "repeat(auto-fill, minmax(20rem, 1fr))",
        "fill-sm": "repeat(auto-fill, minmax(24rem, 1fr))",
        "fill-md": "repeat(auto-fill, minmax(28rem, 1fr))",
        "fill-lg": "repeat(auto-fill, minmax(32rem, 1fr))",
        "fill-xl": "repeat(auto-fill, minmax(36rem, 1fr))",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@headlessui/tailwindcss")],
} satisfies Config;
