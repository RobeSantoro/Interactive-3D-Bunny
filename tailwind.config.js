module.exports = {
  content: ["*"],
  theme: {
    extend: {
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '128': '26rem',
        '144': '36rem',
      },
    },
    screens: {
      'sm': { 'min': '0px', 'max': '767px' },
      // => @media (min-width: 640px and max-width: 767px) { ... }

      'md': { 'min': '768px', 'max': '1023px' },
      // => @media (min-width: 768px and max-width: 1023px) { ... }

      'lg': { 'min': '1024px', 'max': '1279px' },
      // => @media (min-width: 1024px and max-width: 1279px) { ... }

      'xl': { 'min': '1280px', 'max': '9999px' },
      // => @media (min-width: 1280px and max-width: 1535px) { ... }
    },
  },
  plugins: [],
}
