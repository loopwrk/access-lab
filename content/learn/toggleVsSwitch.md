---
title: Choosing between a toggle button and a switch
topicId: toggle-vs-switch
category: buttons-with-state
order: 3
related:
  - toggle-buttons
  - switches
concepts:
  - button-element
  - aria-state
summary: Toggle buttons and switches both flip between two states, but they
  are for different use cases. The shape of the label and what "off" actually
  means are the two clearest signals of which one fits.
---

Toggle buttons and switches both flip between two states, and at the HTML level they can look similar - both can sit on a `<button>` element, both carry an ARIA state attribute. They are for genuinely different use cases, though, and choosing the wrong one tends to make the control feel slightly off - to the eyes of a sighted user, and more obviously to assistive technology.

The short version:

- **Toggle button** - applies or removes a specific effect. Bold, Mute, Pin.
- **Switch** - flips a setting between two equal states. Wi-Fi on/Wi-Fi off, Dark mode on/dark mode off.

## The mental model

The clearest way to tell them apart is to ask what "off" actually means.

**Toggle off** means "I have not applied this." Off is the null state - the absence of the effect, the default. Bold off just means the text is normal. Mute off means audio plays normally. You do not think of yourself as having actively turned Bold off; you just have not turned it on.

**Switch off** means "I have set this to off on purpose." Off is a real, chosen configuration. Airplane mode off means the wireless radios in your phone are deliberately operating. Dark mode off means light mode is on. Notifications off is a setting someone chose, not the absence of a setting.

Both controls flip between two states, but only one of those states is meaningful for a toggle. Both states are meaningful for a switch.

## The label gives it away

A useful gut check: read the label out loud.

- If it sounds like a **verb describing an action** ("Mute", "Pin", "Bold", "Like", "Subscribe"), it is almost certainly a toggle button.
- If it sounds like a **noun naming a thing or setting** ("Wi-Fi", "Dark mode", "Notifications", "Airplane mode"), it is almost certainly a switch.

"Toggle dark mode" reads like a verb, but the control underneath is acting on a setting - that label is shaped like a toggle button's but its job is a switch's. In practice both forms appear in real interfaces; what matters is that the underlying ARIA matches the behaviour, not the grammatical shape of the words.

## Examples

| Label                    | Type   | Why                                                                            |
| ------------------------ | ------ | ------------------------------------------------------------------------------ |
| Bold (in a text editor)  | Toggle | Applies an effect to the selection. Off means unstyled text.                   |
| Mute (in a media player) | Toggle | Applies muting to playback. Off means normal audio.                            |
| Pin (on a forum post)    | Toggle | Applies a "pinned" mark to the item. Off means the item is in its usual place. |
| Like or Favourite        | Toggle | Applies the user's endorsement. Off means nothing has been applied.            |
| Wi-Fi                    | Switch | A setting with two real states: connected or offline.                          |
| Dark mode                | Switch | A theme setting. Off does not mean "no theme" - it means light mode is on.     |
| Email notifications      | Switch | A delivery setting the user chose.                                             |
| Airplane mode            | Switch | An operating mode. Off means the wireless radios are intentionally on.         |

## The ARIA that matches each pattern

The HTML markup tells assistive technology which mental model applies.

**Toggle button** - use `<button>` with `aria-pressed`:

```html
<button type="button" aria-pressed="false">
  Bold
</button>
```

Screen readers announce the control as a toggle button and say whether it is currently pressed.

**Switch** - use a button with `role="switch"` and `aria-checked`, or a native checkbox with `role="switch"`:

```html
<button
  type="button"
  role="switch"
  aria-checked="false"
>
  Dark mode
</button>
```

```html
<label>
  <span>Dark mode</span>
  <input type="checkbox" role="switch" />
</label>
```

Screen readers announce the control as a switch and say whether it is currently on or off.

Mixing these up is a common mistake. `aria-pressed` on a Wi-Fi setting announces as "Wi-Fi, toggle button, pressed" - technically functional, but it tells the user this is an action they took rather than a setting they configured. `aria-checked` on a Bold button announces it like a switch and points the user's mental model in the wrong direction.

## When the same feature could be either

Some features can be modelled either way depending on how the interface frames them. The shape of the label is what tips the balance.

- **Mute** as a toggle in a video player ("Mute" is the action). The default is audio playing; muting is an effect the user applies.
- **Sound** as a switch in system settings ("Sound" is the setting). The default is whatever the user last set; on and off are equally valid configurations.
- **Subscribe** as a toggle on a channel page ("Subscribe" is the action). Off means the user has not subscribed yet.
- **Auto-save** as a switch in an editor's preferences ("Auto-save" is the setting). Off means the user has deliberately opted for manual saving.

If you can frame the feature naturally as an action verb, lean toward a toggle button. If it sits more naturally as a noun naming a setting, lean toward a switch. The control type should follow the label, and the underlying ARIA should match the control type.

## Quick reference

- Label is a verb → probably a toggle button → `aria-pressed`.
- Label is a noun → probably a switch → `role="switch"` + `aria-checked` (or a native checkbox with `role="switch"`).
- "Off" feels like "have not done anything yet" → toggle button.
- "Off" feels like "deliberately set to off" → switch.
- The control sits in a toolbar of similar effects → almost always a toggle button.
- The control sits in a list of system or app settings → almost always a switch.
