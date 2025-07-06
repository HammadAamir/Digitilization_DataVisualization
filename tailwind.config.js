/** @type {import('tailwindcss').Config} */
module.exports = {
  // Configure files to scan for Tailwind classes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Look for .js, .ts, .jsx, .tsx files in the src directory
  ],
  theme: {
    extend: {
      // Extend Tailwind's default color palette with your custom colors
      colors: {
        // Backgrounds and text
        'dark-bg': '#121212',
        'light-text': '#f0f0f0',
        'medium-text': '#b0b0b0',
        'darker-bg-light': '#1a1a1a', // For sections like categories
        'dark-card': '#2a2a2a', // For cards/components like category items
        'dark-border': '#555', // For borders, e.g., secondary button
        'dark-hover-border': '#777', // For hover borders
        'dark-hover-card': '#3a3a3a', // For hover state of cards

        // Primary/Accent colors
        'blue-primary': '#007bff',
        'blue-hover': '#0069d9',

        // Other specific colors from your design
        'gray-light': '#ccc', // For no-data fill on map
        'gray-dark': '#888', // For category labels and pie chart segment
        'gray-medium': '#555', // For pie chart segment
      },
      // Extend font families
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      // Extend spacing, if needed (e.g., for w-15, h-15)
      spacing: {
        '15': '3.75rem', // 60px if 1 unit = 4px
      }
    },
  },
  plugins: [],
}
