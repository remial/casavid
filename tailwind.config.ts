import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'yeseva': ['yeseva', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Define keyframes for text color animation
        "text-color-change": {
          from: { color: "#065f46" }, // Deep green
          to: { color: "#bbf7d0" }, // Light green
        },
        "bgChange": {
          '0%': { backgroundColor: '#38a169' }, // Starting with green
          '50%': { backgroundColor: '#fde047' }, // Transition to light yellow
          '100%': { backgroundColor: '#f472b6' }, // And then to pink
        },
        // Adding the colorCycle keyframes
        colorCycle: {
          '0%, 100%': { color: '#065f46' }, // dark green
          '50%': { color: '#09d69c' }       // light green
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Define the animation using the keyframes
        "text-color-change": "text-color-change 1s ease-in-out infinite alternate",
        "bgChange": "bgChange 0.5s ease-in-out infinite alternate",
        // Adding the colorCycle animation
        colorCycle: 'colorCycle 3s infinite', // 3s duration, infinite loop
      },
    },
  },
  plugins: [],
}

export default config
