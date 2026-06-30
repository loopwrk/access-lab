import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import type { TabsItem } from "@nuxt/ui";
import InspectorTabBar from "./InspectorTabBar.vue";

const items: TabsItem[] = [
  { label: "Controls", value: "controls" },
  { label: "Issues", value: "issues" },
  { label: "Manual", value: "manual" },
  { label: "Learn", value: "learn" },
];

const meta = {
  title: "Inspector/Tab bar",
  component: InspectorTabBar,
  args: { items, default: false, rounded: true, ariaLabel: "Inspector" },
  argTypes: {
    default: {
      control: "boolean",
      description: "Render the default tab menu",
    },
    rounded: {
      control: "boolean",
      description: "Tray only: tab corners on = 8px (0.5rem), off = square",
    },
    items: { control: false },
    ariaLabel: { control: "text" },
  },
  render: (args) => ({
    components: { InspectorTabBar },
    setup() {
      const model = ref("controls");
      return { args, model };
    },
    // 420px matches the real inspector aside width.
    template: `<div style="width:420px"><InspectorTabBar v-bind="args" v-model="model" /></div>`,
  }),
} satisfies Meta<typeof InspectorTabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rounded: Story = { args: { default: false, rounded: true } };

export const Square: Story = { args: { default: false, rounded: false } };

export const Default: Story = { args: { default: true } };

const caption =
  "font: 700 0.75rem/1 var(--al-font, sans-serif); text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin: 0 0 8px";

export const Comparison: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { InspectorTabBar },
    setup() {
      const defaultModel = ref("controls");
      const roundedModel = ref("controls");
      const squareModel = ref("controls");
      return { items, defaultModel, roundedModel, squareModel, caption };
    },
    template: `
      <div style="width:420px;display:flex;flex-direction:column;gap:28px">
        <div>
          <p :style="caption">Default &middot; link</p>
          <InspectorTabBar :items="items" :default="true" v-model="defaultModel" />
        </div>
        <div>
          <p :style="caption">New &middot; rounded (8px)</p>
          <InspectorTabBar :items="items" :rounded="true" v-model="roundedModel" />
        </div>
        <div>
          <p :style="caption">New &middot; square</p>
          <InspectorTabBar :items="items" :rounded="false" v-model="squareModel" />
        </div>
      </div>`,
  }),
} satisfies Story;
