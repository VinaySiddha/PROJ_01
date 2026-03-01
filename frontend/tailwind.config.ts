/**
 * tailwind.config.ts
 *
 * Tailwind CSS configuration for The Magic Screen.
 * Dark cinema theme — deep blacks, gold accents, warm whites.
 * Extends the default theme with custom colors, fonts, and animations.
 */
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Cinema dark theme palette
        background: {
          DEFAULT: '#0D0D0D',   // Main app background — near black
          surface: '#1A1A1A',   // Cards, panels, modals
          elevated: '#242424',  // Hover states, elevated surfaces
        },
        foreground: {
          DEFAULT: '#F5F5F5',   // Primary text on dark background
          muted: '#9CA3AF',     // Secondary/placeholder text
          subtle: '#6B7280',    // Disabled text, hints
        },
        accent: {
          DEFAULT: '#D4A017',   // Gold — primary accent color
          hover: '#E6B020',     // Gold hover state
          foreground: '#0D0D0D', // Text on gold background
        },
        border: {
          DEFAULT: '#2D2D2D',   // Default border color
          muted: '#1F1F1F',     // Subtle border
        },
        // Semantic colors
        success: '#22C55E',
        warning: '#F59E0B',
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        // shadcn/ui compatibility
        primary: {
          DEFAULT: '#D4A017',
          foreground: '#0D0D0D',
        },
        secondary: {
          DEFAULT: '#1A1A1A',
          foreground: '#F5F5F5',
        },
        muted: {
          DEFAULT: '#1A1A1A',
          foreground: '#9CA3AF',
        },
        card: {
          DEFAULT: '#1A1A1A',
          foreground: '#F5F5F5',
        },
        popover: {
          DEFAULT: '#1A1A1A',
          foreground: '#F5F5F5',
        },
        input: '#2D2D2D',
        ring: '#D4A017',
      },
      fontFamily: {
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        script:  ['var(--font-script)', 'cursive'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
