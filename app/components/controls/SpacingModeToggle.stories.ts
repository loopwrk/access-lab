import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
// Storybook's Vite has no Nuxt auto-imports, and UTooltip resolves its
// provider context from UApp, so the stories wrap the toggle themselves.
import UApp from "@nuxt/ui/components/App.vue";
import SpacingModeToggle from "./SpacingModeToggle.vue";

const meta = {
  title: "Inspector/Spacing mode toggle",
  component: SpacingModeToggle,
  args: {
    modelValue: false,
    label: "Individual padding",
    variant: "outline",
    disabled: false,
  },
  argTypes: {
    modelValue: {
      control: "boolean",
      description: "Pressed state: true edits the four sides individually.",
    },
    label: {
      control: "text",
      description: "Tooltip and accessible name (the icon never changes).",
    },
    variant: {
      control: "inline-radio",
      options: ["outline", "solid"],
      description:
        "outline: quiet chip used in the inspector legends. solid: mirrors the segmented content pickers' active/inactive styling.",
    },
    disabled: { control: "boolean" },
  },
  // Extra left padding keeps the left-side tooltip inside the canvas.
  render: (args) => ({
    components: { UApp, SpacingModeToggle },
    setup() {
      const independent = ref(args.modelValue);
      return { args, independent };
    },
    template: `
      <UApp>
        <div style="padding: 24px 24px 24px 160px; display: inline-block;">
          <SpacingModeToggle
            v-model="independent"
            :label="args.label"
            :variant="args.variant"
            :disabled="args.disabled"
          />
        </div>
      </UApp>
    `,
  }),
} satisfies Meta<typeof SpacingModeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Outline, resting (linked "All sides" mode) - the inspector legend chip. */
export const Outline: Story = {};

/** Outline, pressed (individual sides mode). */
export const OutlinePressed: Story = { args: { modelValue: true } };

/** Solid, resting - matches a segmented picker's inactive button. */
export const Solid: Story = { args: { variant: "solid" } };

/** Solid, pressed - matches a segmented picker's active button; the icon strokes on-brand. */
export const SolidPressed: Story = { args: { variant: "solid", modelValue: true } };

/** Disabled (either variant). */
export const Disabled: Story = { args: { disabled: true } };
