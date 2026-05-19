import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        legacy: {
          start: '#667eea',
          end: '#764ba2',
        },
      },
      fontFamily: {
        zhengHei: ['"Microsoft JhengHei"', '"微軟正黑體"', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
