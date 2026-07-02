import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import RootRemControl from "./RootRemControl.vue";

const labels = {
  trigger: "Root rem",
  title: "Preview root size",
  description: "Sets 1rem for every component in the preview.",
  unit: "px",
  equals: "= 1rem",
  learn: "Learn about the preview root size",
  slider: "Root em (rem) value",
  presetsGroup: "Preset sizes",
  pixelsWord: "pixels",
};

const meta = {
  title: "Inspector/Root rem control",
  component: RootRemControl,
  args: { modelValue: 16, labels },
  // ~200px matches one cell of the real inspector aside (~420px wide).
  render: (args) => ({
    components: { RootRemControl },
    setup() {
      const px = ref(args.modelValue);
      return { args, px };
    },
    template: `<div style="width:200px"><RootRemControl v-model="px" :labels="args.labels" /></div>`,
  }),
} satisfies Meta<typeof RootRemControl>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click the chip to open the popover; drag the slider or pick a preset. */
export const Default: Story = {};
