---
title: "Disclosure triggers and aria-expanded"
topicId: "disclosure-triggers"
summary: >-
  A disclosure trigger reveals a panel of related content. The trigger needs aria-expanded so assistive tech can announce whether the panel is open or shut.
---

A disclosure trigger is a button whose only job is to reveal or hide a region of related content. Accordions, FAQ items, expandable cards, and "Show more" links are all disclosure patterns. The trigger is a plain button — the meaning is in the relationship between the button and the panel below it.


## The correct pattern

Use a plain `<button>` element with `aria-expanded`. The attribute carries the current state of the panel. Flip it in the same click handler that shows or hides the panel.

Screen readers announce a button with aria-expanded as "button, expanded" or "button, collapsed." The label stays stable — "Show details" stays "Show details" whether the panel is open or shut. The state is carried by the attribute, not by relabeling.

Hide the panel with the browser-native `hidden` attribute or `display: none`. Both remove the panel from the accessibility tree while it is collapsed, which matches how assistive tech expects a collapsed disclosure to behave.


## When to add aria-controls

The `aria-controls` attribute points from the trigger to the panel it controls, by id. It can help some assistive technology surface a "jump to controlled element" affordance, but support is patchy and many screen readers ignore it.

Add aria-controls when the panel is far from the trigger in the DOM, or when one trigger controls a panel that lives elsewhere on the page. For the common case — a trigger immediately followed by its panel — the attribute is a nice-to-have rather than a requirement.

Whichever you choose, keep the id reference accurate. A stale aria-controls pointing at a removed element confuses tools more than no attribute at all.


## Why the label stays stable

It is tempting to alternate the label between "Show details" and "Hide details" as the panel opens and closes. The intuition is that the button always says what it will do next. Two problems arise.

First, voice-control users speak the visible label. If the label changes between activations, they cannot rely on a stable command — at the moment they speak, the button might read either way.

Second, screen reader users hear aria-expanded announced as "expanded" or "collapsed" automatically. Pairing that with a flipping label is redundant at best and contradictory at worst ("Hide details, collapsed"). Stable label plus state attribute is calmer and more predictable.


## Common anti-patterns


### Two failure modes show up repeatedly in production code:

Visual-only state. The panel appears and disappears on click but the trigger exposes no aria-expanded. Sighted users see the change; assistive technology hears a plain button each time, with no indication that anything has revealed or hidden. Level A failure of SC 4.1.2 Name, Role, Value.

aria-expanded that never updates. The attribute is on the trigger but stuck at "false" — the developer added it once and forgot to flip it in the toggle handler. Sighted users see the panel open while screen readers are told it is still closed. This is harder to catch than the missing attribute because automated tools see the attribute and assume the pattern is wired up.


## The native `details`/`summary` alternative

HTML ships a built-in disclosure pattern. A `<details>` element wrapping a `<summary>` and any other content gives you the trigger and the panel in one declaration. The browser handles the open/close toggling, the keyboard activation (Space and Enter), and the accessibility state announcements automatically — there is no aria-expanded to set and nothing to keep in sync.


### Reach for the native element first. It wins whenever:

- You need zero JavaScript — the pattern keeps working in static HTML, in markdown renderers, and before any client-side bundle has hydrated.
- You want unbreakable accessibility — the browser owns the state, so there is no equivalent of the "out-of-sync" bug. Whatever the visible state, the announced state matches.
- You want built-in keyboard support, a default disclosure marker, and (in Chrome) Find-in-page searching inside collapsed panels — all without writing code.

### Choose the button + aria-expanded pattern only when the native element cannot do what you need:

- Full visual control. The `<summary>` element is stylable but quirky — the default marker, cursor behaviour, and rendering differ across browsers. If your design system has a strict button vocabulary, mounting a summary to match it can be more work than using a real button.
- The trigger and panel are not adjacent in the DOM. A header button that reveals a sidebar elsewhere on the page cannot use `<details>` — the element requires the panel to be its own child.
- You need to react to opens and closes for animations, data loading, focus management, or analytics. The native element does fire a toggle event, but if you are writing the handlers anyway the saving evaporates.
- Animation. Native disclosure does not animate the reveal natively. Modern CSS is improving here (`interpolate-size`, transitions on `display`) but it is still finicky compared to a JavaScript-driven height transition.
Rule of thumb: default to `<details>`/`<summary>` unless you have a concrete reason not to. Move to the button + panel pattern when you need behaviour or layout the native element cannot give you — and accept that you have taken on the state-wiring responsibility the browser was handling for free.


## Disclosure vs. toggle vs. switch

All three patterns flip between two visible states. The semantic difference is what the button represents.

Use a disclosure trigger (`aria-expanded`) when the button reveals related content — a panel, a tooltip, an extra row of details. The button is not the setting; the panel is the thing.

Use a toggle button (`aria-pressed`) when the button performs an action whose effect persists — Mute, Bold, Pin. Use a switch (`role="switch"`) when the control represents a setting whose value is the point — Dark mode, Notifications.


## Related topics

Toggle buttons and aria-pressed

Switches and role=switch
