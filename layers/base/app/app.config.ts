export default defineAppConfig({
  ui: {
    colors: {
      secondary: "pink",
      neutral: "zinc"
    },
    table: {
      slots: {
        base: "border-separate border-spacing-0",
        thead: "[&>tr]:bg-elevated/50 [&>tr]:after:content-none",
        tbody: "[&>tr]:last:[&>td]:border-b-0",
        th: "border-y border-default",
        td: "border-b border-default",
        separator: "h-0"
      }
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
    inputNumber: {
      defaultVariants: {
        size: "xl"
      }
    },
    textarea: {
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
