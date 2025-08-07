const colors = require('tailwindcss/colors')

module.exports = {
  darkMode: 'class',
  // variants: {
  //   extend: {
  //     borderColor: ['focus-visible'],
  //     opacity: ['disabled'],
  //   }
  // },
  content: [
  "./index.html",
  "./src/**/*.{ts,tsx}",
  "./node_modules/@shadcn/ui/**/*.{ts,tsx}", // ← include this if using shadcn
],
}
