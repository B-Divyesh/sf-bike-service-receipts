# Bike Service Receipts — visual thesis

## Direction: botanical field guide

Bike maintenance is easier to remember when it feels like observing and tending a living collection, not completing fleet paperwork. The interface borrows the quiet precision of a well-used botanical field guide: warm specimen paper, inked labels, small registration marks, ruled observations, and one carefully illustrated bicycle study. Each bike is treated as a named specimen; each receipt is an evidence card; each reminder is a field note about what may be due next. The visual language stays practical and never implies that the app diagnoses safety or mechanical condition.

## Palette

Light mode is intentionally the primary treatment, like a field notebook opened outdoors. Dark mode becomes a night-field journal rather than an inverted website.

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| paper / background | `#F4F0E4` | `#172019` | uncoated specimen paper / night foliage |
| surface | `#FFFDF6` | `#202B22` | receipt slips and forms |
| ink / text | `#203127` | `#F4F0E4` | near-black chlorophyll ink |
| muted ink | `#5D695F` | `#B8C3B9` | annotations; ≥4.5:1 on its surface |
| fern / accent | `#2F684B` | `#83C49D` | primary actions and active leaves |
| accent contrast | `#FFFFFF` | `#102117` | text on fern |
| marigold | `#A85B13` | `#F0B76E` | due-soon observations |
| berry | `#9C343A` | `#F08E91` | overdue/error evidence |
| moss | `#52713D` | `#A8CD88` | completed/healthy states |
| hairline | `#C8C2AF` | `#435045` | rules and specimen dividers |

Color never carries state alone: every state has a word, icon, or supporting sentence. All body/color pairings target WCAG AA contrast (4.5:1 or better).

## Type and numbers

- Display and receipt headings: `Georgia`, `Iowan Old Style`, serif. Its botanical-plate cadence makes each bike feel catalogued rather than gamified.
- Interface and field notes: `Arial`, `Helvetica Neue`, sans-serif. This keeps data entry plain and fast with no network or font payload.
- Scale: 14px annotations, 16px body, 18px labels, 24px section heads, clamp(34px–52px) h1. Body leading 1.55; prose measure 68 characters.
- Dates, money, and odometers use tabular figures. Uppercase is reserved for small specimen labels with generous tracking.

## Spacing, shape, and depth

The base rhythm is 4px with recurring steps of 8, 12, 16, 24, 32, and 48px. Content caps at 1180px. Receipt edges use 2–12px corner radii: paper is tactile but not bubbly. Independent records may be cards; forms and grouped controls rely on proximity and hairlines instead of nested panels. A faint CSS paper grain and ruled background create atmosphere without another asset request. Shadows are short, warm, and slightly offset like paper resting on paper.

On phones, secondary context folds below the current action, receipt metadata becomes a vertical docket, and the app navigation becomes a safe-area-aware bottom field tab bar. Every target is at least 44px.

## Interaction grammar

- The main action is “Log service,” always represented by a pressed-leaf green control.
- Changing bike changes the specimen label and all dependent evidence together.
- Forms appear as an in-page field sheet/dialog from the action that opened them; focus moves into the sheet and returns to its trigger.
- Save, import, delete, and install actions always return a visible result in the live field-note region.
- Destructive deletion names the bike/receipt and requires confirmation. Import validates before writing and never silently replaces data.

## Motion

State changes use 180–240ms opacity and short translate transitions, with the origin aligned to the invoking control. No decorative loops or parallax. A saved receipt receives one brief paper-settle animation. Under `prefers-reduced-motion: reduce`, movement and smooth scrolling are removed and state changes are instantaneous; hierarchy remains through scale, rules, and contrast.

## Asset plan and provenance

The hero is one original landscape illustration used only on the first-run field cover: a practical commuter bicycle arranged like a botanical specimen among chainring-like leaves, a small receipt slip, pencil, and maintenance objects. It teaches the “observe → record → tend” metaphor and leaves quiet negative space for onboarding copy. App icons and interface symbols are hand-authored SVG linework in the repository; they are functional, not generated.

### Prompt sheet

- Use case: `illustration-story`
- Asset: onboarding/empty-state hero, 3:2 landscape
- Subject: one unbranded everyday step-through bicycle shown in accurate side profile; nearby chain brush, oil bottle without label, small blank receipt slip, pencil; fern and clover specimens subtly echo bicycle components
- World/material: 1930s naturalist field plate meets contemporary editorial print, watercolor wash, fine graphite and ink hatching, lightly foxed uncoated paper, precise but warm
- Composition: bicycle centered-right; calm open paper on left/top for responsive cropping; objects physically separate and readable; no person
- Light/lens: soft diffuse north-window light, orthographic/specimen-board feeling, restrained shadows
- Palette words: specimen cream, deep chlorophyll, pressed fern, oxidized copper, marigold annotation
- Negative list: no text, no letters, no numbers, no watermark, no logo, no brands, no photorealism, no neon, no gradient, no UI screenshot, no extra wheels, no impossible drivetrain, no tools that resemble weapons

Generated on 2026-08-28 with the factory Azure image deployment via `/opt/fleet/lib/gen-image.sh`. The source PNG, exact prompt sidecar, and optimized WebP/AVIF derivatives are retained under `assets/src/` and `public/assets/`. The generated illustration is original for this product and contains no real people, brands, or copyrighted characters; the app footer discloses that it is AI-generated.

