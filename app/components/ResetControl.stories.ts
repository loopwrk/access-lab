import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ResetControl from "./ResetControl.vue";

const labels = {
  action: "Reset all",
  ariaLabel: "Reset all control-panel values to defaults",
  enabledTitle: "Reset every changed value in this panel to its default",
  disabledTitle: "No changes to reset",
};

const meta = {
  title: "Inspector/Reset control",
  component: ResetControl,
  args: { disabled: false, labels },
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Disabled (panel clean) vs enabled (panel dirty).",
    },
  },
  // ~200px matches one cell of the real inspector aside (~420px wide).
  render: (args) => ({
    components: { ResetControl },
    setup() {
      return { args };
    },
    template: `<div style="width:200px"><ResetControl :disabled="args.disabled" :labels="args.labels" /></div>`,
  }),
} satisfies Meta<typeof ResetControl>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Enabled (panel dirty). */
export const Enabled: Story = { args: { disabled: false } };

/** Disabled (panel clean - nothing to reset). */
export const Disabled: Story = { args: { disabled: true } };
