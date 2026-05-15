import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 24px 80px rgba(14, 165, 233, 0.18)",
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.24), transparent 30%), radial-gradient(circle at 80% 0%, rgba(129, 140, 248, 0.2), transparent 28%), linear-gradient(135deg, rgba(15, 23, 42, 0.04), rgba(15, 23, 42, 0))",
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
};

export default config;
