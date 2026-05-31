import type { Component } from "vue";

export type LearnTopicCategory =
  | "foundations"
  | "text-and-labels"
  | "interaction"
  | "visual";

export interface LearnTopic {
  id: string;
  titleKey: string;
  summaryKey: string;
  category?: LearnTopicCategory;
  component: Component;
}

export const learnTopics: LearnTopic[] = [
  {
    id: "native-rendering",
    titleKey: "learn.nativeRendering.title",
    summaryKey: "learn.nativeRendering.summary",
    category: "foundations",
    component: defineAsyncComponent(
      () => import("~/components/LearnTopic/NativeRendering.vue"),
    ),
  },
  {
    id: "invisible-text",
    titleKey: "learn.invisibleText.title",
    summaryKey: "learn.invisibleText.summary",
    category: "text-and-labels",
    component: defineAsyncComponent(
      () => import("~/components/LearnTopic/InvisibleText.vue"),
    ),
  },
  {
    id: "vague-label",
    titleKey: "learn.vagueLabel.title",
    summaryKey: "learn.vagueLabel.summary",
    category: "text-and-labels",
    component: defineAsyncComponent(
      () => import("~/components/LearnTopic/VagueLabel.vue"),
    ),
  },
  {
    id: "rem-units",
    titleKey: "learn.remUnits.title",
    summaryKey: "learn.remUnits.summary",
    category: "foundations",
    component: defineAsyncComponent(
      () => import("~/components/LearnTopic/RemUnits.vue"),
    ),
  },
  {
    id: "form-wrapping",
    titleKey: "learn.formWrapping.title",
    summaryKey: "learn.formWrapping.summary",
    category: "interaction",
    component: defineAsyncComponent(
      () => import("~/components/LearnTopic/FormWrapping.vue"),
    ),
  },
  {
    id: "accessible-name",
    titleKey: "learn.accessibleName.title",
    summaryKey: "learn.accessibleName.summary",
    category: "text-and-labels",
    component: defineAsyncComponent(
      () => import("~/components/LearnTopic/AccessibleName.vue"),
    ),
  },
  {
    id: "button-value-attribute",
    titleKey: "learn.buttonValueAttribute.title",
    summaryKey: "learn.buttonValueAttribute.summary",
    category: "interaction",
    component: defineAsyncComponent(
      () => import("~/components/LearnTopic/ButtonValueAttribute.vue"),
    ),
  },
  {
    id: "button-types",
    titleKey: "learn.buttonTypes.title",
    summaryKey: "learn.buttonTypes.summary",
    category: "interaction",
    component: defineAsyncComponent(
      () => import("~/components/LearnTopic/ButtonTypes.vue"),
    ),
  },
  {
    id: "button-disabled-states",
    titleKey: "learn.buttonDisabledStates.title",
    summaryKey: "learn.buttonDisabledStates.summary",
    category: "interaction",
    component: defineAsyncComponent(
      () => import("~/components/LearnTopic/ButtonDisabledStates.vue"),
    ),
  },
  {
    id: "toggle-buttons",
    titleKey: "learn.toggleButtons.title",
    summaryKey: "learn.toggleButtons.summary",
    category: "interaction",
    component: defineAsyncComponent(
      () => import("~/components/LearnTopic/ToggleButtons.vue"),
    ),
  },
  {
    id: "menu-triggers",
    titleKey: "learn.menuTriggers.title",
    summaryKey: "learn.menuTriggers.summary",
    category: "interaction",
    component: defineAsyncComponent(
      () => import("~/components/LearnTopic/MenuTriggers.vue"),
    ),
  },
  {
    id: "disclosure-triggers",
    titleKey: "learn.disclosureTriggers.title",
    summaryKey: "learn.disclosureTriggers.summary",
    category: "interaction",
    component: defineAsyncComponent(
      () => import("~/components/LearnTopic/DisclosureTriggers.vue"),
    ),
  },
  {
    id: "switches",
    titleKey: "learn.switches.title",
    summaryKey: "learn.switches.summary",
    category: "interaction",
    component: defineAsyncComponent(
      () => import("~/components/LearnTopic/Switches.vue"),
    ),
  },
];

export function getLearnTopic(id: string): LearnTopic | undefined {
  return learnTopics.find((t) => t.id === id);
}
