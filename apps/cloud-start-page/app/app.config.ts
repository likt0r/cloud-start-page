const glassSurface = "!glass-panel";

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
