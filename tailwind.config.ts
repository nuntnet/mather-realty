import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-ibm-plex-thai)", "var(--font-inter)", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        brand: {
          grass: {
            1: '#fbfefb', 2: '#f3fcf3', 3: '#ebf9eb', 4: '#daf6da',
            5: '#c9f0ca', 6: '#b2e5b4', 7: '#94d69a', 8: '#65c170',
            9: '#46a758', 10: '#3d9a4f', 11: '#297c3b', 12: '#1b512a',
            DEFAULT: '#46a758',
          },
          olive: {
            1: '#fcfdfc', 2: '#f8faf8', 3: '#f1f4f0', 4: '#e9ece8',
            5: '#e2e5e0', 6: '#d9ddd8', 7: '#cdd1cb', 8: '#b9bdb7',
            9: '#898e87', 10: '#7e837c', 11: '#5e6360', 12: '#1d211c',
            DEFAULT: '#898e87',
          },
        },
      },
      borderRadius: {
        lg: 'var(--radius)',                      // 0.75rem = 12px
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',          // 16px
        '2xl': 'calc(var(--radius) + 8px)',       // 20px
        '3xl': 'calc(var(--radius) + 16px)',      // 28px
      },
    },
  },
  plugins: [typography],
};

export default config;
