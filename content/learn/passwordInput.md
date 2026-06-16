---
title: 'type="password": work with the password manager, not against it'
topicId: password-input
category: form-inputs
order: 6
related:
  - tel-input
  - number-input
  - accessible-name
concepts:
  - form-control
summary: '`type="password"` masks the field and plugs into the browser password manager, which saves logins, autofills them, and suggests strong new passwords. It is on by default; the job is not to break it. Name the role with `autocomplete="current-password"` or `new-password`, keep the password and username fields in one form, and never block paste or set `autocomplete="off"`.'
---

A password field looks like a normal text box that hides what you type behind dots or asterisks. `<input type="password">` does that masking - but it also plugs the field into something bigger: the browser password manager. Getting the most from a password field is mostly about working with that manager rather than fighting it.

## What browser password manager integration is

Every modern browser has a built-in password manager, and many people add a third-party one. When it recognises a sign-in or sign-up field, it can:

- **Offer to save** the username and password after a successful sign-in.
- **Autofill** saved credentials on the next visit, often behind a quick re-authentication.
- **Suggest a strong, unique password** when someone is creating an account or changing one.

This is a security feature first - it is what lets people use a different strong password for every site instead of reusing one they can keep in their head. It is also an accessibility feature: it removes a lot of careful typing into a field whose contents are hidden, which especially helps people with memory or attention differences, people with motor disabilities, and anyone typing on a small touch keyboard.

## How the browser knows (the HTML signals)

Integration is **on by default** for `<input type="password">` - you do not switch it on, you give the browser the right signals so it works well. The ones that matter:

- **`type="password"`** itself - the masking and the manager hook.
- **`autocomplete`** tokens that name the field's role: `current-password` for signing in, `new-password` for creating or changing a password.
- **A `<form>` that holds the username field and the password field together**, username first. The manager pairs the two, so place the username field before the password and give it `autocomplete="username"`.

A sign-in form, done well:

```html
<form action="/login" method="post">
  <label for="user">Email</label>
  <input id="user" name="user" type="email" autocomplete="username" />

  <label for="pass">Password</label>
  <input id="pass" name="pass" type="password" autocomplete="current-password" />

  <button type="submit">Sign in</button>
</form>
```

## Creating or changing a password

For a sign-up form, a change-password form, or a confirm-password field, use `autocomplete="new-password"`. This tells the manager to offer a freshly generated strong password instead of autofilling the old one, and to update what it has saved.

```html
<label for="new">New password</label>
<input id="new" name="new" type="password" autocomplete="new-password" />

<label for="confirm">Confirm new password</label>
<input id="confirm" name="confirm" type="password" autocomplete="new-password" />
```

## How integration gets disabled - and why not to

A few patterns switch the manager off or get in its way. Avoid all of them:

- **`autocomplete="off"`** on the field or the form asks the browser not to autofill. Most browsers now ignore it for password fields precisely because turning it off harms people, but it is still the wrong signal to send.
- **Blocking paste** (`onpaste="return false"` and similar) stops people pasting a password from their manager. It pushes everyone toward shorter, hand-typed, reused passwords - the opposite of what you want.
- **Scrambling `name` attributes** or clearing the field with JavaScript to defeat managers. These are user-hostile and break autofill for the people who depend on it.

Turning the manager off does not make a site more secure. It makes passwords weaker and entry more error-prone, and it removes an aid from the people who benefit from it most.

## Best practice: an accessible show-password toggle

Because the field is masked, typos are invisible - a barrier for everyone, and more so for people who find typing difficult. A show-password toggle lets people check what they entered. Build it as a real `<button type="button">` with a clear text label and a pressed state, and have it flip the input between `type="password"` and `type="text"`:

```html
<label for="pw">Password</label>
<input id="pw" name="pw" type="password" autocomplete="current-password" />
<button type="button" aria-pressed="false" aria-controls="pw">Show password</button>
```

Keep it a `type="button"` (so it never submits the form), give it a real label rather than an icon alone, and toggle `aria-pressed` as it switches so assistive technology announces the change. Offer it as a choice - do not remove masking by default.

## The short version

`type="password"` masks the field and connects it to the browser password manager, which is on by default. Help it: name the role with `autocomplete="current-password"` or `new-password`, keep the password and username fields in one `<form>` with the username first, and never block paste or set `autocomplete="off"`. Add an accessible show-password toggle so people can check what they typed.
