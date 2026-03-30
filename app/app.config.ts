export default defineAppConfig({
  ui: {
    colors: {
      primary: "brand",
      secondary: "accent",
      neutral: "zinc"
    },
    card: {
      slots: {
        root: "backdrop-blur-md bg-black/70 ring-white/5"
      }
    },
    header: {
      slots: {
        root: "border-b border-white/5"
      }
    }
  }
});
