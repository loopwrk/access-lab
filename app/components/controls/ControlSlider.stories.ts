import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import ControlSlider from "./ControlSlider.vue";

const meta = {
  title: "Inspector/Control slider",
  component: ControlSlider,
  args: {
    modelValue: 40,
    ariaLabel: "Padding, all sides",
    min: 0,
    max: 120,
    step: 2,
    disabled: false,
  },
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
  },
  // ~300px matches the slider's share of a control row in the inspector.
  render: (args) => ({
    components: { ControlSlider },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div style="width:300px">
        <ControlSlider
          v-model="value"
          :aria-label="args.ariaLabel"
          :min="args.min"
          :max="args.max"
          :step="args.step"
          :disabled="args.disabled"
        />
        <p style="margin:12px 0 0;font-size:13px;color:var(--text-muted)">value: {{ value }}</p>
      </div>
    `,
  }),
} satisfies Meta<typeof ControlSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };

/** Fine-grained steps, e.g. the border-width scale. */
export const SmallRange: Story = { args: { max: 20, step: 1 } };
