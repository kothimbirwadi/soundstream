/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: "#1DB954",
          "green-hover": "#1ed760",
          black: "#0a0a0a",
          dark: "#121212",
          surface: "#181818",
          card: "#1e1e1e",
          "card-hover": "#282828",
          gray: "#3e3e3e",
          subtext: "#a7a7a7",
          divider: "#2a2a2a",
        },
      },
      keyframes: {
        wave: {
          '0%, 100%': { height: '6px' },
          '50%': { height: '24px' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '0.4' },
        }
      },
      animation: {
        wave1: 'wave 1.1s ease-in-out infinite',
        wave2: 'wave 0.85s ease-in-out infinite 0.2s',
        wave3: 'wave 1.25s ease-in-out infinite 0.4s',
        wave4: 'wave 0.95s ease-in-out infinite 0.1s',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
