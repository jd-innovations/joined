# Adjustable text size (accessibility preference)

## Goal
Let each user scale the app's text size on demand — like iOS Dynamic Type — from the Me settings page. The choice applies instantly across the whole app and is remembered on the device.

## How it works
- Add a **Text size** control on the Me page, next to the existing Appearance (theme) control.
- Options: **Small, Default, Large, Extra large** — shown as "A" glyphs at increasing sizes so users can preview the scale visually.
- Tapping one rescales all app text immediately (weather temperature, event titles, buttons, labels) without a reload.
- The choice is saved to the device and restored on the next visit, just like the theme setting.
- Works in both light and dark monochrome themes; no layout breaks at any size.

## Technical details
- New `TextSizeProvider` in `src/lib/theme.tsx` (or a sibling `src/lib/text-size.tsx`) following the existing `ThemeProvider` pattern: React context + localStorage (`sideline-text-size`).
- The provider sets `font-size` on the root `<html>` element as a percentage (87.5% / 100% / 112.5% / 125%). Because all Tailwind text utilities are `rem`-based, the entire type scale adjusts proportionally with one value.
- SSR/hydration safe: apply the stored size in an effect (same pattern as theme), so server and client render match.
- Me page gets a "Text size" card with four selectable buttons showing sample "A" sizes and the active one highlighted using existing brand tokens.
- No database or account needed — this is a per-device visual preference.

## Verification
- Typecheck + build pass.
- Preview check: switching sizes visibly scales all text on Home, Groups, and Schedule; selection persists after reload; no hydration errors.
