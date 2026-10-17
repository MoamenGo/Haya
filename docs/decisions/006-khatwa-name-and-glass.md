# ADR-006: The app is called Khatwa (خطوة), and gets a Glass look

**Status:** accepted · 2026-10-17 · at the owner's request

## Context

The owner follows his study plans, tasks and worship from the phone through a small Android
app that opens this PWA. He asked for one name everywhere — **خطوة (Khatwa, "a step")** — on the
phone, the desktop and in the browser, a new professional logo, clearer text, smoother movement,
and a "glass" choice among the themes.

## Decision

- **Name.** Everything a person sees says خطوة / Khatwa: the page title, the PWA manifest, the
  header, the loading screen, the default palette's name and the backup file name
  (`khatwa-backup-YYYY-MM-DD.json`). Internal names stay as they were, because changing them
  would cost data or break old files: the repository, the Cloudflare address, the Dexie database
  name, `HayaDB`, `haya.*` localStorage keys, the palette id `haya`, and the backup id `haya`
  (old backups still import).
- **Logo.** Three steps rising — the ones already taken — and a dot just above them: the next
  step. Same drawing in `BrandMark.tsx`, `public/favicon.svg`, the boot screen and the PWA
  icons (`public/icons`, rendered from the same SVG; maskable icon keeps the mark in the safe zone).
- **Glass** is a fourth choice next to light / dark / system. It is a look, not a palette: it
  follows the device for light or dark and works with all ten palettes. `src/styles/glass.css`
  puts a fixed wash of the palette's own colours behind the page and makes surfaces frosted
  (`backdrop-filter`), with a bright top edge and a soft shadow. `resolveTheme()` in
  `src/app/appearance.ts` turns the setting into `{ dark, glass }`.
  - Readability: quiet text is pulled toward the main text colour under glass, and
    `tests/unit/glass.test.ts` checks every palette, light and dark, at the strongest spot of the
    wash: text, quiet text and links all reach WCAG AA (4.5:1) on the page and on a card.
  - Specificity: the rules live in the `utilities` layer and use `:where()`, so a frosted card
    beats a plain `bg-surface` but `hover:` and `active:` classes still win.
  - Without `backdrop-filter`, surfaces become nearly solid instead of see-through.
  - Menus and dialogs (`bg-surface-raised`) stay solid: a menu opened from the top bar sits inside
    the bar's own blur, and a blur inside a blur cannot see past its parent, so a see-through menu
    would show the page sharp behind its text.
- **Smoother.** Screens and theme switches cross-fade (View Transitions API, 180 ms, via the
  router's `defaultViewTransition` and `applyAppearance({ animate })`); `#section` jumps scroll
  smoothly; phones lose the tap flash and the double-tap delay. All of it is off under
  `prefers-reduced-motion`.
- **Clearer text.** Body text weight 430 (both fonts are variable, so it is a real weight), and the
  two smallest sizes went up: `text-xs` ≥ 13px, `text-sm` 14.5–15.5px.

## Consequences

- The `theme` setting accepts `glass`. Older versions on another device read it as invalid and
  fall back to "system" (settings are validated on read), so syncing is safe in both directions.
- Glass costs a little GPU on cheap phones because of the blur; "light" or "dark" stay as fast
  as before.
- CLAUDE.md keeps its history ("Hayah OS") in places; the product name is now Khatwa.
