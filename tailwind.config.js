module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: false,
  theme: {
    extend: {
            colors: {
                /* Telegram dark-theme tokens */
                tg: {
                  bgIn : "#24272e",          /* incoming bubble  */
                  bgOutFrom : "#ff9742",     /* outgoing start   */
                  bgOutTo   : "#ff4c7f",     /* outgoing end     */
                  chip : "#2f3239",          /* quick-reply chip */
                },
              },
              borderRadius: {
                bubble : "1.25rem",          /* consistent on every bubble */
              },
      backgroundImage: {
        'telegram-tile': "url('/bg/telegram-pattern.svg')",
      },
    },
  },
  plugins: [],
};