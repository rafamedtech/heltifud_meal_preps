export default defineAppConfig({
  ui: {
    colors: {
      secondary: "pink",
      neutral: "zinc"
    },
    button: {
      defaultVariants: {
        size: "xl"
      }
    },
    input: {
      defaultVariants: {
        size: "xl"
      }
    },
    select: {
      defaultVariants: {
        size: "xl"
      }
    },
    selectMenu: {
      defaultVariants: {
        size: "xl"
      }
    },
    navigationMenu: {
      slots: {
        linkLeadingIcon: "text-xl"
      }
    }
  }
})
