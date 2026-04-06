# Palette Redesign Spec

## Goal
Refine the dark premium color palette to increase trust, urgency, and readability while maintaining the unique dark theme that differentiates from all 9 analyzed competitors.

## Competitor Analysis Summary
All 9 competitors use light backgrounds with blue/green accents. Our dark theme is the sole differentiator — we keep it and refine it.

## Color Changes

| Token | Current | New | Reason |
|-------|---------|-----|--------|
| `bg` | `#0a0a0a` (pure black) | `#08080F` (dark navy) | Warmer, less "empty screen" |
| `surface` | `#111111` | `#12121E` | Navy tint matches bg |
| `surface-light` | `#1a1a1a` | `#1C1C2E` | Consistent navy undertone |
| `gold` | `#C8A45E` | `#D4AF37` | More vivid, "real gold" feel |
| `gold-light` | `#E0C878` | `#E8C867` | Brighter complement |
| `muted` | `#888888` | `#9A9590` | Warmer gray, better contrast |
| `error` | `#E05252` | `#EF4444` | Standard red-500 |
| NEW `cta` | — | `#E8652D` | Orange CTA for urgency |
| NEW `cta-hover` | — | `#D4561F` | Darker hover state |
| NEW `text` | `#ffffff` | `#E8E2D6` | Warm white, less eye strain |

## What Changes
- Tailwind config `colors` in `<head>` of all 15 HTML files
- `css/styles.css` — any hardcoded hex values (#0a0a0a, #C8A45E, #1a1a1a)
- CTA buttons: change from `border border-gold text-gold` to `bg-cta text-white` with glow shadow
- Hero CTA: solid orange with `box-shadow: 0 4px 20px rgba(232,101,45,0.3)`
- Body text: `text-white` → `text-text` (warm white)
- Strikethrough amounts: keep `text-red-400`

## What Does NOT Change
- Dark theme (competitive advantage)
- Fonts: Fraunces + Space Grotesk
- Layout structure, sections, components
- i18n system, JS files logic
- Lucide icons
- Quiz, calculator, FAQ functionality

## CTA Hierarchy
1. **Primary**: `bg-cta text-white` + glow shadow (quiz/form submission)
2. **Secondary**: `border border-gold text-gold` (alternative actions)
3. **Tertiary**: `bg-gold text-bg` (phone/call buttons)

## Files to Modify
- All 15 HTML files: Tailwind config colors in `<head>`
- `css/styles.css`: hardcoded color values
- `index.html`: CTA button classes, body text class
- Subpages: same CTA and text changes
