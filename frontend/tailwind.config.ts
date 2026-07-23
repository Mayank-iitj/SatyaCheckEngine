/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Beanro-inspired Premium Academic Palette
        parchment: {
          50: "#FFFFFF",
          100: "#FDFBF7", // Main background (Beanro cream)
          200: "#F5F1E9",
          300: "#EAE4D9", // Grid lines
          400: "#D3C8B3",
          500: "#B8AA91",
        },
        ink: {
          900: "#1C1613", // Main text (Beanro espresso/black)
          800: "#2A221E",
          700: "#3D322C",
          600: "#574A42",
          500: "#75655B",
        },
        bronze: {
          DEFAULT: "#DE6B35", // Beanro orange button color
          hover: "#C95A26",
          light: "#F49467",
        },
        brand: {
          valid: "#166534", // Emerald 800 for academic valid
          revoked: "#991B1B", // Red 800 for revoked
          pending: "#92400E", // Amber 800 for pending
        }
      },
      fontFamily: {
        display: ["var(--font-serif)", "serif"], // Heavy, high-contrast serif
        body: ["var(--font-sans)", "sans-serif"], // Clean sans-serif
      },
      animation: {
        "marquee": "marquee 25s linear infinite",
        "fade-in-up": "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-up": "scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" }, // -50% because we duplicate content
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleUp: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #EAE4D9 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
