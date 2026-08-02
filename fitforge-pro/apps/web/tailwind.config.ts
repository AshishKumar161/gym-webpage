import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import animatePlugin from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
    },
    extend: {
      colors: {
        // FitForge Pro Brand Colors
        brand: {
          gold: "#F5A623",
          "gold-light": "#FFD166",
          "gold-dark": "#D4881A",
          fire: "#FF6B35",
          ember: "#FF4500",
        },
        // Background system
        dark: {
          DEFAULT: "#0A0A0F",
          50: "#12121A",
          100: "#1A1A24",
          200: "#22222F",
          300: "#2A2A3A",
          400: "#323245",
          500: "#3A3A50",
          600: "#4A4A65",
          700: "#5A5A78",
          800: "#6E6E90",
          900: "#8A8AA8",
        },
        // Glass effect colors
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.05)",
          hover: "rgba(255, 255, 255, 0.08)",
          border: "rgba(255, 255, 255, 0.1)",
          "border-hover": "rgba(245, 166, 35, 0.4)",
        },
        // Semantic colors
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
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        heading: ["var(--font-outfit)", ...fontFamily.sans],
        mono: ["var(--font-jetbrains)", ...fontFamily.mono],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        "10xl": ["10rem", { lineHeight: "1" }],
        "11xl": ["12rem", { lineHeight: "1" }],
        "12xl": ["14rem", { lineHeight: "1" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
        "144": "36rem",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gold-gradient": "linear-gradient(135deg, #F5A623 0%, #FFD166 100%)",
        "dark-gradient": "linear-gradient(180deg, #0A0A0F 0%, #12121A 100%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        "hero-gradient":
          "radial-gradient(ellipse at 50% 50%, rgba(245, 166, 35, 0.15) 0%, transparent 60%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(26,26,36,0.9) 0%, rgba(10,10,15,0.9) 100%)",
        "spotlight-gradient":
          "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(245, 166, 35, 0.1) 0%, transparent 80%)",
      },
      boxShadow: {
        gold: "0 0 30px rgba(245, 166, 35, 0.3)",
        "gold-lg": "0 0 60px rgba(245, 166, 35, 0.4)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        "glass-lg": "0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        neon: "0 0 20px rgba(245, 166, 35, 0.5), 0 0 40px rgba(245, 166, 35, 0.3), 0 0 80px rgba(245, 166, 35, 0.1)",
        "card-hover": "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(245, 166, 35, 0.1)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out",
        "fade-down": "fadeDown 0.5s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-in": "slideIn 0.5s ease-out",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "shimmer": "shimmer 2s linear infinite",
        "gradient-shift": "gradientShift 4s ease infinite",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
        "scale-in": "scaleIn 0.3s ease-out",
        "rotate-slow": "rotate-slow 20s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(245, 166, 35, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(245, 166, 35, 0.6)" },
        },
        glow: {
          "0%": { textShadow: "0 0 10px rgba(245, 166, 35, 0.5)" },
          "100%": { textShadow: "0 0 30px rgba(245, 166, 35, 0.9), 0 0 60px rgba(245, 166, 35, 0.5)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "rotate-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [animatePlugin],
};

export default config;
