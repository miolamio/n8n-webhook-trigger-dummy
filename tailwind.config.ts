import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // n8n brand colors
        'n8n-pink': '#ff6d5a',
        'n8n-dark': '#1a1a2e',
      },
    },
  },
  plugins: [],
}

export default config
