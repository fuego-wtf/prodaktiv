# prodaktiv — Theme Decision

**Decision:** dual-mode (shell-level). Light is the default; dark via
`prefers-color-scheme: dark`. **Component-level coverage is partial** —
see "Follow-up" below.

## What's wired

- `projects/prodaktiv/index.css` (NEW) — `:root` light tokens +
  `@media (prefers-color-scheme: dark)` dark overrides for `--bg`,
  `--text-primary`, `--text-secondary`, `--surface`, `--border`,
  `--accent`. Body rule uses `var(--bg)` and `var(--text-primary)`.
- `projects/prodaktiv/index.html` — inline `<style>` removed (moved into
  `index.css`); inline Tailwind config gains explicit `darkMode: 'media'`
  so any `dark:` Tailwind variant respects OS preference.
- `projects/prodaktiv/App.tsx` line 272 (top-level container) — `dark:`
  variants added: `dark:bg-system-black`, `dark:text-white`,
  `dark:selection:bg-white`, `dark:selection:text-black`.
- `prototypes/prodaktiv.html` — mirrored `@media (prefers-color-scheme: dark)`
  block added to the prototype's `<style>` token set
  (`--bg`/`--ink`/`--paper`/`--soft`/`--line`/`--hair`/`--muted` flip;
  blue/green/warn accents shift luminance for AA on dark).

## What's NOT wired (the honest part)

prodaktiv was built with hardcoded Tailwind utility classes throughout
`App.tsx` and sub-components. Component-level dark-mode coverage requires
a `dark:` paired variant on each utility. The shell flips, but
individual components still render their light-mode appearance even when
OS is dark.

### Migration list — utilities that need `dark:` pairs

Search pattern (run in `projects/prodaktiv/`):

```bash
grep -rn "bg-white\|bg-gray\|text-gray\|border-gray\|text-black\|hover:text-black\|bg-black" --include="*.tsx" --include="*.jsx"
```

Examples found in `App.tsx`:
- `bg-white/90 backdrop-blur-sm` → add `dark:bg-system-black/90`
- `border-gray-100` → add `dark:border-white/10`
- `text-gray-400` → add `dark:text-gray-500` (or use `--text-secondary`)
- `hover:text-black` → add `dark:hover:text-white`
- `bg-gray-300` → add `dark:bg-white/20`
- `text-red-600` → keep (status color, valid in both modes)
- `selection:bg-black selection:text-white` → already paired in App.tsx:272

The same audit needs to run across every component in `components/`.
Estimate: 50-150 utility class updates spread across the component tree.

### Why not done in this iteration

The Wave C-2 plan scoped "externalize tokens, fix the latent body-color
bug, add dark variant" — assuming a CSS-tokens project. prodaktiv turned
out to be a Tailwind-CDN project where colors are baked into JSX utility
classes. The iteration delivered the SHELL part of the user's `(1)`
direction; the component pass is a separate sprint.

The "latent body-color bug" the plan referenced is also confirmed
non-existent — re-checking `index.html` showed `background-color: #ffffff;
color: #111111;` (a clean white-on-white pair, not the broken
`color: #ffffff` on white the audit had reported).

## AA contrast spot-check

| Pair | Contrast | Pass |
|---|---|---|
| Light `--bg` (#FFFFFF) + `--text-primary` (#111111) | ~17:1 | yes |
| Dark `--bg` (#111111) + `--text-primary` (#FFFFFF) | ~17:1 | yes |
| Light + selection (black bg, white text) | ~17:1 | yes |
| Dark + selection (white bg, black text — flipped via App.tsx:272) | ~17:1 | yes |

Component-internal pairs (e.g., `text-gray-400` on `bg-white` → on
`bg-system-black` after shell flip) are out-of-scope until the migration
list above is worked.

## Brand source

- `projects/prodaktiv/index.html` — inline Tailwind config defines
  `system-black: '#111111'` and `system-gray: '#f4f4f5'`. Monochrome
  identity — black IS the accent.
- `projects/prodaktiv/README.md` — describes a "physical deep-work
  system with software, hardware, and Linear sync." Identity is
  utilitarian-clean, not editorial-dark.
- `prototypes/prodaktiv.html` — uses warm off-white `#efefed` for prototype
  bg with monochrome ink + utility accents (blue/green/warn). Different
  values from the production app but same monochrome philosophy.

## How a user can extend (full component coverage)

1. Run the grep above to enumerate all utility classes.
2. For each class, decide the dark equivalent. Use the inline Tailwind
   `darkMode: 'media'` (already configured) so `dark:` variants apply
   based on OS preference.
3. Update each component's JSX to pair light + dark utilities.
4. Verify AA contrast for each surface in BOTH modes.
5. Update this file's "What's NOT wired" section to mark coverage
   complete.
6. Update `docs/ralph-loops/2026-05-10-light-dark-mode-decisions.md`
   prodaktiv entry to drop the "shell-level" qualifier.

## Verified at

- Decisions log: `docs/ralph-loops/2026-05-10-light-dark-mode-decisions.md`
- Loop iteration: 22 (2026-05-10)

## Toggle (2026-05-12)

The shell-level dual-mode has an explicit toggle. Form is an **icon toggle
(monitor / moon / sun)** rendered as a small segmented control sitting in
the **top-right of the page header**, in the right-side cluster before the
"Log in" link. Driven by the workspace shared script at
`brand/compound/tokens/theme-toggle.js` (inlined into a React effect for
the Vite bundle at `projects/prodaktiv/components/ThemeToggle.tsx`).

- localStorage key: `prodaktiv-theme`
- States: `auto` (monitor icon — removes attribute, follows OS), `dark`
  (moon icon — forces dark via `html[data-theme="dark"]`), `light`
  (sun icon — forces light)
- Selectors: light default in `:root`; dark in `@media (prefers-color-scheme: dark)
  :root:not([data-theme="light"])`; explicit overrides via `html[data-theme="dark|light"]`
- Mounted once per view, in the top-right header cluster:
  - `LandingPage.tsx` header nav, immediately before the "Log in" button
  - `App.tsx` Control Bar right cluster (top-of-page sticky bar), first
    item before the Settings / Emergency / Clear / Sidebar icon buttons
- The earlier `App.tsx` end-of-page footer strip mount was **dropped** to
  avoid duplication — the icon toggle in the header is the single source
- Visual style matches prodaktiv's brutalist identity:
  `border-2 border-black` on white with 28×28 hit targets; the active
  segment inverts (white icon on black background) mirroring the
  segmented-control pattern used elsewhere in the app
- Each segment carries an `aria-label` (Auto / Dark / Light); icons are
  `aria-hidden`
- Prototype `prototypes/prodaktiv.html` mirrors the same selectors and
  ships an inline IIFE so it works from `file://`

Component-level utility class coverage (the documented follow-up from
yesterday) still applies — the shell flips cleanly, but `bg-white`,
`text-gray-*`, etc. inside components still need `dark:` paired variants
for full coverage.
