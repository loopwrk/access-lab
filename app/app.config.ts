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
    alert: {
      slots: {
        title: "!text-(length:--al-font-size-alert)",
        description: "!text-(length:--al-font-size-alert)",
      },
    },
    toast: {
      slots: {
        // Action links (e.g. the "Why…" learn link) should read at the body
        // text size and sit flush-left under the title/description, not at the
        // smaller, indented default button size. Targets the action buttons
        // inside the actions slot via a child selector; the icon-only close
        // button is unaffected (it is already p-0 and has no text).
        //
        // The label span is left-aligned and allowed to wrap onto multiple
        // lines. Nuxt UI's button label is a `truncate` (white-space: nowrap)
        // span by default, so a long question like "Why is the button
        // attempting to submit coordinates?" otherwise runs to the toast's
        // right edge on a single line; whitespace-normal lets it break to two.
        actions:
          "[&_button]:pl-0 [&_button]:text-sm [&_button]:text-left [&_span]:whitespace-normal",
      },
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
    switch: {
      slots: {
        base: "data-[state=unchecked]:bg-[var(--text-secondary)]/30",
      },
    },
  },
});
