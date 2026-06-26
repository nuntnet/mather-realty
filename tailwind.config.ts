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
        // Body / UI — Thai falls back to IBM Plex Sans Thai, Latin to Plus Jakarta Sans
        sans: ["var(--font-ibm-plex-thai)", "var(--font-jakarta)", "var(--font-inter)", "system-ui", "sans-serif"],
        // Display / headings — editorial serif (Lora, see DESIGN.md)
        serif: ["var(--font-lora)", "Georgia", "serif"],
        // Logo wordmark only — high-contrast elegant serif
        cormorant: ["var(--font-cormorant)", "Georgia", "serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
        lexend: ["var(--font-lexend)", "system-ui", "sans-serif"],
        jakarta: ["var(--font-jakarta)", "system-ui", "sans-serif"],
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
          /* Pantone 19-4922 TCX "Teal Green" */
          teal: {
            1: '#EEF9F9', 2: '#E0F4F4', 3: '#C2E8E7', 4: '#92D4D3',
            5: '#62C0BE', 6: '#3BA9A7', 7: '#2D8E8C', 8: '#247D7B',
            9: '#1E6B69', 10: '#18605E', 11: '#124E4C', 12: '#0C3837',
            DEFAULT: '#1E6B69',
          },
          /* Pantone Orange 021 U */
          orange: {
            1: '#FEF1EC', 2: '#FDD4C2', 3: '#FAB09A', 4: '#F78D72',
            5: '#F46A4A', 6: '#F1502A', 7: '#EF3F17', 8: '#D4380F',
            9: '#F4581A', 10: '#D84C14', 11: '#B43E10', 12: '#6E2508',
            DEFAULT: '#F4581A',
          },
          olive: {
            1: '#fcfdfc', 2: '#f8faf8', 3: '#f1f4f0', 4: '#e9ece8',
            5: '#e2e5e0', 6: '#d9ddd8', 7: '#cdd1cb', 8: '#b9bdb7',
            9: '#898e87', 10: '#7e837c', 11: '#5e6360', 12: '#1d211c',
            DEFAULT: '#898e87',
          },
          // Amber — warm luxury accent (see DESIGN.md). Replaces orange as the accent.
          amber: {
            1: '#FBF6F0', 2: '#F6E8D8', 3: '#EFD4B6', 4: '#E5BC8E',
            5: '#D9A571', 6: '#C9935A', 7: '#B07840', 8: '#946232',
            9: '#C9935A', 10: '#B07840', 11: '#8A5E32', 12: '#3D2A15',
            DEFAULT: '#C9935A',
          },
        },
        // Editorial neutrals (see DESIGN.md)
        cream: '#F7F4EF',
        ink: '#1A2624',
      },
      borderRadius: {
        lg: 'var(--radius)',                      // 1rem = 16px
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',          // 20px
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem',
        'pill': '9999px',
      },
    },
  },
  plugins: [typography],
};

export default config;
