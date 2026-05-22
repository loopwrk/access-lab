export default defineAppConfig({
  ui: {
    colors: {
      primary: "accesslab",
      neutral: "accesslab-neutral",
      error: "error",
      warning: "warning",
      success: "success",
      info: "info",
    },
    fieldGroup: {
      base: "border border-[var(--border-strong)] rounded-none overflow-hidden p-1",
    },

    button: {
      base: "rounded-none",

      defaultVariants: {
        size: "lg",
      },
      compoundVariants: [
        {
          fieldGroup: "horizontal",
          class: "transition-none",
        },
        {
          color: "neutral",
          variant: "ghost",
          fieldGroup: "horizontal",
          class:
            "bg-[var(--surface)] text-[var(--text-primary)] " +
            "hover:bg-[var(--brand-soft)] " +
            "active:bg-[var(--brand-soft)] " +
            "focus-visible:bg-[var(--brand-soft)]",
        },
      ],
    },
  },
});
