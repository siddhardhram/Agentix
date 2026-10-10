/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border, 240 3.7% 15.9%))',
        input: 'hsl(var(--input, 240 3.7% 15.9%))',
        ring: 'hsl(var(--ring, 240 4.9% 83.9%))',
        background: 'hsl(var(--background, 240 10% 3.9%))',
        foreground: 'hsl(var(--foreground, 0 0% 98%))',
        primary: {
          DEFAULT: 'hsl(var(--primary, 240 5.9% 10%))',
          foreground: 'hsl(var(--primary-foreground, 0 0% 98%))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary, 240 3.7% 15.9%))',
          foreground: 'hsl(var(--secondary-foreground, 0 0% 98%))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive, 0 62.8% 30.6%))',
          foreground: 'hsl(var(--destructive-foreground, 0 0% 98%))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted, 240 3.7% 15.9%))',
          foreground: 'hsl(var(--muted-foreground, 240 5% 64.9%))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent, 240 3.7% 15.9%))',
          foreground: 'hsl(var(--accent-foreground, 0 0% 98%))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover, 240 10% 3.9%))',
          foreground: 'hsl(var(--popover-foreground, 0 0% 98%))',
        },
        card: {
          DEFAULT: 'hsl(var(--card, 240 10% 3.9%))',
          foreground: 'hsl(var(--card-foreground, 0 0% 98%))',
        },
      },
      borderRadius: {
        lg: 'var(--radius, 0.75rem)',
        md: 'calc(var(--radius, 0.75rem) - 2px)',
        sm: 'calc(var(--radius, 0.75rem) - 4px)',
      },
      animation: {
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
        'orbit': 'orbit calc(var(--duration)*1s) linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'border-beam': {
          '100%': {
            'offset-distance': '100%',
          },
        },
        'orbit': {
          '0%': {
            transform: 'rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)',
          },
        },
        'shimmer': {
          'from': {
            backgroundPosition: '0 0',
          },
          'to': {
            backgroundPosition: '-200% 0',
          },
        },
      },
    },
  },
  plugins: [],
}
