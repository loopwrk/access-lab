---
title: Why button labels matter
topicId: vague-label
category: accessible-names
order: 2
related: []
summary: Automated tools verify a button has a name, but they can't tell whether
  the name is meaningful out of context.
---

Screen reader users often navigate by element list, a feature that reads out every button, link, or heading on the page in sequence. Out of that context, a bare "OK" or "More" tells them nothing about what the button actually does. The user has to either guess or backtrack into the surrounding content to find out.

Sighted users are affected too. Clear labels reduce cognitive load. A well-named button answers "what will happen if I press this?" before the user has to read the surrounding context. It's especially valuable for users with attention or memory impairments, anyone in a hurry, or non-native speakers parsing an unfamiliar UI.

## Vague labels slip past accessibility tools

Most accessibility tools check that a button has an accessible name, but they can't check whether that name is meaningful. A button with a vague label like "OK" or "Submit" passes the automated check just as cleanly as something detailed like "Save changes to article". Users are left to guess what it does.

## What makes a good label

**Here are 2 simple patterns to make button labels easy to understand on their own.**

1. Combine a verb and a noun: Instead of just "Save" or "Delete," use "Save changes" or "Delete account." Adding the noun tells the user exactly what their action will affect.

2. Focus on the outcome, not the technology: Instead of using a generic technical word like "Submit," use "Send email." This tells the user exactly what will happen next, rather than how the website processes it behind the scenes.

## When short labels are okay

**Single-word or generic labels are not always wrong. They can be appropriate when:**

Having a clear, visible label right above the input (e.g., Search our catalog) is the gold standard.

- The surrounding visual context already provides meaning. If a search input has a clear, visible label right above the input (e.g., Search our catalog), then a button labelled "Search" is unambiguous in that setting.

- The button is part of a familiar pattern, like the "Next" of an onboarding step. Users recognise these conventions without further explanation.

## The read-aloud test

A practical check: read the label out loud, alone, with no visible context. If it's self-evident what the button does, the label is doing its job. If it isn't, expand it until it is.
