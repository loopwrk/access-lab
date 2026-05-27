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
];

export function getLearnTopic(id: string): LearnTopic | undefined {
  return learnTopics.find((t) => t.id === id);
}
