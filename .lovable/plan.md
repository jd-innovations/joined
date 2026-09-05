# Monochrome Sideline (black & white, photos stay in color)

Strip all color out of the interface — greens, status reds/ambers, gradients — and let the photography be the only color on screen. The layout, spacing, and glass feel stay exactly as they are today.

## How it would look

- Backgrounds: pure white (light) / near-black (dark), with light grey cards and dividers.
- Text: black on white, white on black, greys for secondary labels.
- Buttons: solid black pill buttons with white text (inverted in dark mode); secondary buttons outlined grey.
- Weather card: today's emerald gradient becomes a deep charcoal-to-black gradient; the temperature stays big and bold.
- LIVE badge and alerts: black badge with white text instead of red. Live dot stays a pulsing black/white dot so it still reads as "happening now".
- Going / Maybe / RSVP states: shown with fill vs outline and a checkmark rather than green vs grey.
- Photos (event covers, group covers, avatars): untouched, full color — they become the only accent in the app.
- Active tab in the bottom bar: black icon + label, inactive greys.

## Trade-off to know

Status meaning currently comes from color (green = going, red = live, amber = warning). In black and white those need shape and weight instead: filled vs outlined chips, icons, and bolder text. Everything stays readable, but statuses become slightly less scannable at a glance.

## Technical notes

- All work is in `src/styles.css` token values only: set `--brand*`, `--success/warning/error/info`, and surfaces to neutral greys/black/white in both `:root` and `.dark`. Components already use semantic tokens, so no per-component color edits.
- Two exceptions needing component-level touch-ups: the hardcoded emerald gradient on the home weather card (`from-brand-primary to-emerald-700`) and any `bg-white/20` overlays on photos — those get neutral equivalents.
- Images are never filtered, so they stay in color automatically.
- Optionally keep a "color theme" switch later; the tokens make reverting a one-file change.
