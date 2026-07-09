import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import LengthValueInput from "./LengthValueInput.vue";
import type { CssLength } from "../composables/useUnitConversion";

const meta = {
  title: "Inspector/Length value input",
  component: LengthValueInput,
  args: {
    modelValue: { value: 124, unit: "px" } as CssLength,
    disabled: false,
    pxStep: 2,
    rootPx: 16,
  },
  argTypes: {
    disabled: { control: "boolean" },
    pxStep: { control: "number" },
    rootPx: {
      control: "number",
      description: "Root font-size for px↔rem conversion (the app passes the simulated root).",
    },
  },
  render: (args) => ({
    components: { LengthValueInput },
    setup() {
      const value = ref<CssLength>({ ...args.modelValue });
      return { args, value };
    },
    template: `
      <div>
        <LengthValueInput
          v-model="value"
          :disabled="args.disabled"
          :px-step="args.pxStep"
          :root-px="args.rootPx"
        />
        <p style="margin:12px 0 0;font-size:13px;color:var(--text-muted)">
          model: {{ value.value }}{{ value.unit }}
        </p>
      </div>
    `,
  }),
} satisfies Meta<typeof LengthValueInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Switching the unit converts the value against rootPx (124px ↔ 7.75rem at 16). */
export const Default: Story = {};

export const RemUnit: Story = { args: { modelValue: { value: 1.5, unit: "rem" } } };

/** Shown but muted - the value stays readable while the control is off. */
export const Disabled: Story = { args: { disabled: true } };
