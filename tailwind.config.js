/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
      },
      animation: {
        slideInLeft: 'slideInLeft 0.5s ease-out forwards',
        slideInRight: 'slideInRight 0.5s ease-out forwards',
        slideInLeftdelay750: 'slideInLeft 0.75s ease-out forwards',
        slideInRightdelay1000: 'slideInRight 1s ease-out forwards',
        slideInLeftdelay1250: 'slideInLeft 1.25s ease-out forwards',
      },
    },
  },
  plugins: [],
}

