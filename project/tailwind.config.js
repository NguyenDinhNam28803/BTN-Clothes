/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '2.5rem',
          sm: '2.5rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
        screens: {
          sm: '100%',
          md: '100%',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1440px',
        },
      },
      colors: {
        'olive-gold': '#C9B27C',
        'deep-navy': '#1F2937',
        'off-white': '#FAF9F6',
        'soft-beige': '#F5F2EB',
        'muted-rust': '#A85144',
        'sage-green': '#8A9A5B',
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'sans': ['Montserrat', 'sans-serif'],
        'serif': ['Cormorant Garamond', 'serif'],
      },
    },
  },
  plugins: [],
};
