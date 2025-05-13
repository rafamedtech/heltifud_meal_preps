export default defineAppConfig({
  ui: {
    colors: {
      neutral: 'zinc',
    },
    navigationMenu: {
      slots: {
        linkLeadingIcon: 'text-xl',
      },
    },
    button: {
      slots: {
        base: 'rounded-none',
      },
    },
    card: {
      slots: {
        root: 'rounded-none',
      },
    },
    input: {
      slots: {
        base: 'rounded-none',
      },
    },
  },
});
