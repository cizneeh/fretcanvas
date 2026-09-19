# Piano implementation QA — 2026-09-19

final result: passed

## Visual targets and evidence

Screenshot paths below refer to local review artifacts under the git-ignored `tmp/screenshots` directory.

- Selected design: `tmp/screenshots/piano-reference-option-2.png` (1487 × 1058).
- Key proportions override supplied by the user: `tmp/screenshots/piano-reference-proportions.png` (1108 × 656).
- Implementation: `http://127.0.0.1:4321/ja/piano`.
- Desktop capture: `tmp/screenshots/piano-desktop-final.png` (1238 × 1328). Browser CSS viewport 1238 × 1329, reported DPR 1.98; the native capture is already normalized to approximately one image pixel per CSS pixel.
- State: Japanese, key C, chord C7(b9), note names and intervals, C3–C5, two octaves, 11 selected pitches including black keys.
- Full-view comparison: `tmp/screenshots/piano-design-comparison.png`. Source and implementation placed together, each at 740 px wide; unused page area and footer excluded. This compares composition, not pixel-identical layout: the existing control panel is deliberately retained.
- Focused comparison: `tmp/screenshots/piano-keyboard-comparison.png`. Selected keyboard, user proportion reference, and implemented keyboard placed together at equal 1200 px width. The second reference uses Cmaj7; only its key proportions are compared.
- Interaction captures: `tmp/screenshots/piano-context-menu.png`, `tmp/screenshots/piano-export-settings.png`.
- Mobile capture: `tmp/screenshots/piano-mobile.png`. The in-app browser's viewport override produces unused capture padding and a reduced raster; this capture is supplementary. DOM measurements at 394 × 852 CSS px show page width 393 px and keyboard width 960 px inside its scroller. The automated mobile check independently uses 390 × 844 and verifies no page overflow and successful access to the final C5 key.

## Findings and comparison history

1. **P2, fixed: note rectangles stayed too small when keys grew.** The initial implementation capped note size at 48 × 64 px on white keys. Rectangles and text now scale with key width. The final focused comparison shows readable rectangular notes with a colored lower edge on both white and black keys. White key geometry is 64 × 288 (1:4.5), black key geometry 38 × 180; the measured desktop white key is 75.16 × 338.21 CSS px.
2. **P2, fixed: mobile page overflow.** The existing footer forced the page to 456 px at a 390 px viewport. Allowing footer wrapping fixed it. The mobile interaction test now passes.
3. **P2, fixed: tuning Apply button could fall below the viewport.** Changing an octave reveals the custom-preset action, increasing dialog height. The dialog now observes size changes, repositions, and scrolls when necessary. The new octave-only transfer test successfully selects B4 for string 2, applies it, and transfers its first fret to C5, not C4.
4. **P2, fixed: range selectors had ambiguous accessible names.** Explicit labels now identify viewport and export bounds; range and export interaction tests pass.

No actionable P0/P1/P2 findings remain. The final combined comparisons were opened and visually reviewed after the note sizing correction.

## Required fidelity surfaces

- **Typography:** existing system sans-serif is retained. White-key primary/secondary text has distinct size and weight; black-key labels remain readable at the minimum 38 px key width. Note labels do not overlap neighboring keys. Undo/Redo remain available through the shared keyboard shortcuts. Their piano-only buttons were removed at the user's request.
- **Spacing and geometry:** long keys preserve their proportions at all viewport sizes. The desktop toolbar aligns above the keyboard; narrow screens wrap controls and scroll only the keyboard. White and black keys follow the real 2–3 pattern, with 15 white and 10 black keys for C3–C5.
- **Colors:** ordinary off-white and near-black keys, neutral outlines, existing dark panels, rose roots, cyan chord tones, green tensions, and orange outside notes. Notes use darker ink on white keys and lighter ink on black keys. No full-key semantic color fills.
- **Image/asset quality:** this is an interactive instrument control, not a decorative raster asset. Semantic key buttons and vector exports remain sharp. Existing product assets are retained; no placeholder images were introduced.
- **Copy/content:** existing key/chord/scale workflows and bilingual labels are retained. No implementation instructions appear in product copy. C# and A# spelling in this state follows the existing key-based note naming; the mock's Db/Bb spelling is not substituted independently on piano.

## Accepted differences from the generated mock

- The user's request to keep existing music selectors takes precedence over the mock's simplified selectors. Manual chord input, applied chord status, and export-range actions remain available.
- The user's later screenshot overrides the first mock's shorter key geometry.
- Generated mock keyboard anatomy contains extra/misplaced keys; implementation uses musically correct pitches and key counts.
- Empty keys reveal a note preview on hover/focus; persistent note chips represent selected notes only.
- Existing theme tokens, font, and footer are preserved instead of copying generated chrome and footer text.

## Verification

- All 19 Playwright tests pass against the production build: five pitch/migration tests, seven piano browser flows, and seven existing guitar flows.
- Verified exact-pitch transfer to every matching guitar position, styles, context menus, keyboard menu access, Undo/Redo, persistence, locale navigation, browser back, range changes, and valid PNG/SVG downloads.
- PNG test verifies the signature and 1984 × 696 dimensions; SVG test verifies labels and its view box.
- Fresh browser load after restart reports no console warnings or errors. The piano edit test checks uncaught page errors; existing guitar tests also check failed requests and server errors.
- Astro/TypeScript/Biome checks and production build pass. Biome reports an informational deprecation in the pre-existing configuration.
- Browser back/forward-cache restoration is handled, but the touch tests use Chromium emulation; physical iOS/Android devices and every browser engine have not been exhaustively tested.
- Development note: stop the Astro dev server before `astro check` or `astro build`; these commands share Vite dependency caches. In an agent environment Astro automatically backgrounds its preview, so the local test run reused that production preview after the Playwright-managed startup exited. GitHub CI runs the standard `npm run test:e2e` command.

## Implementation checklist

- [x] Piano routes and bilingual instrument navigation.
- [x] Long white/black keys and rectangular notes.
- [x] Adjustable two-octave starting range and pitch-preserving instrument transfer.
- [x] Context menu, history, persistence, and PNG/SVG exports.
- [x] Visual comparisons, responsive verification, and regression tests.
- [x] Local server and browser retained for review; no deployment.

## Follow-up polish

No blocking visual follow-up. Future chord-aware enharmonic spelling should be considered for both instruments together, rather than changing the piano independently.

## Self-review follow-up

- Removed the piano-only Undo/Redo controls and their unused translations; shared keyboard shortcuts still operate the same history. Screenshot: `tmp/screenshots/piano-reviewed.png` (Dm7 selected, empty keyboard).
- Reproduced two touch failures before fixing them: vertical swipes on keys did not scroll the page, and a 3 px finger movement cancelled the long-press menu. Keys now allow page scrolling, keyboard scrolling, and pinch zoom; a long press tolerates movement up to 8 px. New gesture tests verify both behaviors and that scrolling does not add notes.
- Extended export coverage to a C#4–G4 crop, verifying its width and exclusion of the neighboring C note.
- Reused one platform-aware history-shortcut test helper for guitar and piano.
- Touch scrolling tests send the finger's press, moves, and release explicitly. The browser's synthesized scroll gesture did not scroll in Linux CI; the explicit sequence passed five consecutive local runs and still fails when the former `touch-action: pan-x` restriction is restored in the test.
- Reviewed route localization, tuning migration, pitch conversion, history snapshots, persistence, context menus, and SVG escaping. No unresolved blocking finding remains.
