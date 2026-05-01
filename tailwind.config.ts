import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        thai: ['"LINE Seed Sans TH"', 'Itim', 'Mali', 'Kodchasan', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 24px rgba(255,255,255,0.45), 0 0 48px rgba(196,181,253,0.3)'
      }
    }
  },
  plugins: []
} satisfies Config;
