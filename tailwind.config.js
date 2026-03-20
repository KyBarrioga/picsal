/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./layouts/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#050505",
        panel: "#101010",
        panelAlt: "#16120e",
        line: "rgba(255,255,255,0.08)",
        accent: "#f59e0b",
        accentSoft: "#fbbf24",
        muted: "#b6aea0",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(245, 158, 11, 0.2), 0 20px 60px rgba(0, 0, 0, 0.45)",
      },
      backgroundImage: {
        aura:
          "radial-gradient(circle at top, rgba(245, 158, 11, 0.16), transparent 36%), radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.12), transparent 28%)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
