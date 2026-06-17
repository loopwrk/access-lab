/**
 * CodeDrawer's behaviour worth pinning:
 *
 *   - pane availability: the CSS and JS tabs are HIDDEN (v-if) when there's no
 *     CSS / JS; and if the active pane loses its content, the view falls back to
 *     HTML (the hasCss / hasJs watchers);
 *   - clicking the tab buttons switches the visible pane (read off the code
 *     region's aria-label);
 *   - copy: the copy button writes the active pane's content to the clipboard,
 *     shows the "Copied" confirmation, then resets after the feedback delay; the
 *     HTML tab shows a single "Copy" with no CSS, splitting into in-line /
 *     with-classes once CSS exists;
 *   - the resize handle is keyboard-operable: arrows step by 24px and Home/End
 *     jump to the clamped bounds, reflected in aria-valuenow.
 *
 * Nuxt env: the drawer reads useRenderedHtml (useState) and uses useLocalStorage
 * + useWindowSize + useTimeoutFn. ProsePre is stubbed (it pulls in the Nuxt
 * Content prose/highlighter machinery we don't need here), the clipboard is
 * mocked, and localStorage is cleared per test so the height starts at default.
 */

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, nextTick } from "vue";
import CodeDrawer from "~/components/CodeDrawer.vue";
import { useRenderedHtml } from "~/composables/useRenderedHtml";

const MIN_HEIGHT = 80;
const STEP = 24;

let rendered: ReturnType<typeof useRenderedHtml>;
let panel: Awaited<ReturnType<typeof mountSuspended>> | null = null;
let writeText: ReturnType<typeof vi.fn>;

beforeAll(async () => {
  // Known viewport so the 70vh max gives the default 220px room to move.
  Object.defineProperty(window, "innerHeight", { value: 900, configurable: true, writable: true });
  Object.defineProperty(window, "innerWidth", { value: 1200, configurable: true, writable: true });
  const Capture = defineComponent({
    setup() {
      rendered = useRenderedHtml();
      return () => h("div");
    },
  });
  await mountSuspended(Capture);
}, 60000);

beforeEach(() => {
  rendered.setOutput("", "", "");
  localStorage.clear();
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
});

afterEach(() => {
  panel?.unmount();
  panel = null;
});

async function flush() {
  await nextTick();
  await nextTick();
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Wrapper = Awaited<ReturnType<typeof mountSuspended>>;

async function mountDrawer() {
  const w = await mountSuspended(CodeDrawer, {
    global: {
      stubs: {
        // ProsePre pulls in the Content highlighter; UTooltip needs a
        // TooltipProvider (normally from UApp) that a bare mount lacks. Stub
        // both — UTooltip as a slot passthrough so the wrapped buttons render.
        ProsePre: true,
        UTooltip: { template: "<div><slot /></div>" },
      },
    },
  });
  panel = w;
  await flush();
  return w;
}

type ButtonWrapper = ReturnType<Wrapper["findAll"]>[number];
function btn(w: Wrapper, label: string) {
  return w.findAll("button").find((b: ButtonWrapper) => b.text().trim() === label);
}
function regionLabel(w: Wrapper) {
  return w.find("[role=\"region\"]").attributes("aria-label") ?? "";
}

describe("CodeDrawer — pane availability", () => {
  it("hides the JS tab without JS, and shows it once JS arrives", async () => {
    rendered.setOutput("<button>Hi</button>", "", "");
    const w = await mountDrawer();
    expect(btn(w, "JavaScript")).toBeUndefined();

    rendered.renderedJs.value = "console.log(1)";
    await flush();
    expect(btn(w, "JavaScript")).toBeDefined();
  });

  it("hides the CSS tab without CSS, and shows it once CSS arrives", async () => {
    rendered.setOutput("<button>Hi</button>", "", ""); // no inline styles → no class-converted css
    const w = await mountDrawer();
    expect(btn(w, "CSS")).toBeUndefined();

    rendered.renderedCss.value = ".x{color:red}";
    await flush();
    expect(btn(w, "CSS")).toBeDefined();
  });
});

describe("CodeDrawer — pane switching", () => {
  it("switches the visible pane when the tab buttons are clicked", async () => {
    rendered.setOutput("<button>Hi</button>", ".x{color:red}", "console.log(1)");
    const w = await mountDrawer();
    expect(regionLabel(w)).toContain("HTML");

    await btn(w, "CSS")!.trigger("click");
    await flush();
    expect(regionLabel(w)).toContain("CSS");

    await btn(w, "JavaScript")!.trigger("click");
    await flush();
    expect(regionLabel(w)).toContain("JavaScript");

    await btn(w, "HTML")!.trigger("click");
    await flush();
    expect(regionLabel(w)).toContain("HTML");
  });

  it("falls back to HTML when the active CSS pane loses its content", async () => {
    rendered.setOutput("<button>Hi</button>", ".x{color:red}", "");
    const w = await mountDrawer();
    await btn(w, "CSS")!.trigger("click");
    await flush();
    expect(regionLabel(w)).toContain("CSS");

    rendered.renderedCss.value = "";
    await flush();
    expect(regionLabel(w)).toContain("HTML");
  });

  it("falls back to HTML when the active JS pane loses its content", async () => {
    rendered.setOutput("<button>Hi</button>", "", "console.log(1)");
    const w = await mountDrawer();
    await btn(w, "JavaScript")!.trigger("click");
    await flush();
    expect(regionLabel(w)).toContain("JavaScript");

    rendered.renderedJs.value = "";
    await flush();
    expect(regionLabel(w)).toContain("HTML");
  });
});

describe("CodeDrawer — copy", () => {
  it("shows a single Copy on the HTML tab with no CSS, copies, confirms, then resets", async () => {
    rendered.setOutput("<button>Hi</button>", "", ""); // no CSS → inline === classes, one button
    const w = await mountDrawer();
    expect(btn(w, "Copy in-line")).toBeUndefined();
    expect(btn(w, "Copy with classes")).toBeUndefined();

    await btn(w, "Copy")!.trigger("click");
    await flush();
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(String(writeText.mock.lastCall?.[0])).toContain("button");
    expect(btn(w, "Copied")).toBeDefined(); // confirmation shown
    expect(btn(w, "Copy")).toBeUndefined(); // label swapped to "Copied"

    await wait(900); // > COPY_FEEDBACK_MS (800)
    await flush();
    expect(btn(w, "Copy")).toBeDefined(); // reverted
  });

  it("splits into in-line / with-classes on the HTML tab once CSS is present", async () => {
    rendered.setOutput("<button>Hi</button>", ".x{color:red}", "");
    const w = await mountDrawer();
    expect(btn(w, "Copy")).toBeUndefined(); // single Copy gone
    expect(btn(w, "Copy in-line")).toBeDefined();
    expect(btn(w, "Copy with classes")).toBeDefined();

    await btn(w, "Copy in-line")!.trigger("click");
    await flush();
    expect(String(writeText.mock.lastCall?.[0])).toContain("button");
  });

  it("copies the active pane's own content for the CSS and JS tabs", async () => {
    rendered.setOutput("<button>Hi</button>", ".x{color:red}", "console.log(42)");
    const w = await mountDrawer();

    await btn(w, "CSS")!.trigger("click");
    await flush();
    await btn(w, "Copy CSS")!.trigger("click");
    await flush();
    expect(String(writeText.mock.lastCall?.[0])).toContain("color");

    await btn(w, "JavaScript")!.trigger("click");
    await flush();
    await btn(w, "Copy JavaScript")!.trigger("click");
    await flush();
    expect(String(writeText.mock.lastCall?.[0])).toContain("42");
  });
});

describe("CodeDrawer — keyboard resize", () => {
  it("steps by 24px on the arrows and jumps to the bounds on Home/End", async () => {
    rendered.setOutput("<button>Hi</button>", "", "");
    const w = await mountDrawer();
    const sep = () => w.find("[role=\"separator\"]");
    const valueNow = () => Number(sep().attributes("aria-valuenow"));
    const start = valueNow(); // default 220 (localStorage cleared), room either way

    await sep().trigger("keydown", { key: "ArrowUp" });
    expect(valueNow()).toBe(start + STEP);

    await sep().trigger("keydown", { key: "ArrowDown" });
    expect(valueNow()).toBe(start);

    await sep().trigger("keydown", { key: "Home" });
    expect(valueNow()).toBe(MIN_HEIGHT);

    await sep().trigger("keydown", { key: "End" });
    expect(sep().attributes("aria-valuenow")).toBe(sep().attributes("aria-valuemax"));
  });
});
