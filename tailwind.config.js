/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
            'wa-dark': '#111b21',
              'wa-sidebar': '#202c33',
              'wa-panel': '#2a3942',
              'wa-darker': '#0b141a',
              'wa-green': '#00a884',
              'wa-green-dark': '#008069',
              'wa-text-primary': '#e9edef',
              'wa-text-secondary': '#8696a0',
              'wa-color-icones': '#aebac1',
              'wa-message-in': '#202c33',
              'wa-message-out': '#005c4b'
        }
    },
  },
  plugins: [],
}



