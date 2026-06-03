---
title: Why button labels matter
topicId: vague-label
category: accessible-names
order: 2
related: []
concepts:
  - accessible-name
  - button-element
summary: Automated tools verify a button has a name, but they can't tell whether the name is meaningful out of context.
---

Screen reader users often skim a webpage by using a shortcut that extracts and groups all the buttons, links, or headings into a single, isolated menu. When these interactive elements are separated from the surrounding page context, generic labels like "OK" or "More" provide no indication of what the button actually does. This forces users to either guess or backtrack through the layout to find clues.

Clear, specific labels reduce cognitive load for everyone. A well-named button answers the question _"What happens if I press this?"_ before a user ever has to read the surrounding text. This design standard is highly valuable for neurodivergent individuals, people experiencing temporary or permanent cognitive or memory challenges, non-native speakers parsing an unfamiliar interface, or anyone simply in a hurry.

## Vague Labels Slip Past Automated Tools

Most automated testing tools only check for the _presence_ of an accessible name. They cannot evaluate whether that name is actually meaningful to a human being.

A button with a vague label like "OK" passes automated accessibility audits just as cleanly as a descriptive label like "Save changes to article." However, the actual user experience remains broken, leaving people to guess the outcome of their actions.

## What Makes a Good Label?

To make button labels instantly understandable on their own, use these two reliable patterns:

### 1. Combine a Verb with a Noun

Instead of isolated actions like "Save" or "Delete," expand them to **"Save changes"** or **"Delete account."** Adding the specific noun tells the user exactly what asset or data their action will modify.

### 2. Focus on Outcomes, Not Technology

Avoid generic, system-focused terms like "Submit." Instead, describe the real-world result, such as **"Send email"** or **"Publish post."** This communicates what will happen next in the user's workflow, rather than how the server processes data behind the scenes.

## When Short Labels Work

Single-word or generic labels are completely appropriate when the immediate layout provides unmistakable clarity:

- **Direct Proximity to Input Labels:** If a search input field has a prominent, visible heading (e.g., "Search our catalog"), a nearby button simply labeled "Search" is clear and unambiguous.
- **Familiar Design Patterns:** Buttons that form part of an established user flow, like a "Next" or "Back" button in a multi-step setup wizard, rely on universal conventions that people naturally recognize without extra text.

## The Read-Aloud Test

A practical way to audit your interface is the read-aloud test: read the button's label completely out loud, entirely on its own, separated from the rest of the layout. If the exact action and outcome are immediately obvious, the label is successful. If it feels ambiguous, expand the wording until the purpose becomes self-evident.
