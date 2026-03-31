const glassSurface = "backdrop-blur-md !bg-black/5 ring-white/5";

export default defineAppConfig({
  ui: {
    colors: {
      primary: "brand",
      secondary: "accent",
      neutral: "zinc"
    },
    card: {
      slots: {
        root: glassSurface
      }
    },
    modal: {
      slots: {
        content: glassSurface
      }
    },
    toast: {
      slots: {
        root: glassSurface
      }
    },
    selectMenu: {
      slots: {
        content: glassSurface
      }
    },
    header: {
      slots: {
        root: "border-b border-white/5"
      }
    }
  }
});
