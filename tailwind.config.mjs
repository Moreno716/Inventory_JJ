export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,astro}", "./src/styles/**/*.css"],
  theme: {
    extend: {
      colors: {
        primary: "hsl(210, 40%, 55%)",
        accent: "hsl(165, 50%, 45%)",
        glass: "rgba(255,255,255,0.12)"
      },
      backdropBlur: { xs: "2px" }
    }
  },
  plugins: []
};
