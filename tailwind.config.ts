import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          bg: '#0b1020',
          card: '#111935',
          glow: '#86f9ff',
          pink: '#ff7edb',
          mint: '#98ffca'
        }
      },
      boxShadow: {
        neon: '0 0 18px rgba(134, 249, 255, 0.45)',
        pink: '0 0 20px rgba(255, 126, 219, 0.45)'
      }
    }
  },
  darkMode: 'class',
  plugins: []
};

export default config;
