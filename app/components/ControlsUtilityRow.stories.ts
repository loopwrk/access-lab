import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import ControlsUtilityRow from "./ControlsUtilityRow.vue";
import RootRemControl from "./RootRemControl.vue";
import ResetControl from "./ResetControl.vue";

const rootRemLabels = {
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

const resetLabels = {
  action: "Reset all",
  ariaLabel: "Reset all control-panel values to defaults",
  enabledTitle: "Reset every changed value in this panel to its default",
  disabledTitle: "No changes to reset",
};

function row(resetDisabled: boolean) {
  return () => ({
    components: { ControlsUtilityRow, RootRemControl, ResetControl },
    setup() {
      const px = ref(16);
      return { px, rootRemLabels, resetLabels, resetDisabled };
    },
    template: `
      <div style="width:420px">
        <ControlsUtilityRow>
          <template #start>
            <RootRemControl v-model="px" :labels="rootRemLabels" />
          </template>
          <template #end>
            <ResetControl :disabled="resetDisabled" :labels="resetLabels" />
          </template>
        </ControlsUtilityRow>
      </div>
    `,
  });
}

const meta = {
  title: "Inspector/Controls utility row",
  component: ControlsUtilityRow,
} satisfies Meta<typeof ControlsUtilityRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Reset enabled (panel dirty). Click the Root rem chip to open the popover. */
export const Default: Story = { render: row(false) };

/** Reset disabled (panel clean - nothing to reset). */
export const ResetDisabled: Story = { render: row(true) };
