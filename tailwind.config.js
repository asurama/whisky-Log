/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      maxWidth: {
        'none': 'none',
      },
      width: {
        'full': '100%',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        whisky: {
          "primary": "#f59e0b",
          "secondary": "#ea580c",
          "accent": "#fbbf24",
          "neutral": "#1f2937",
          "base-100": "#111827",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
    ],
  },
} 