# Apple-style Visual Redesign

Date: 2026-07-25

## Goal

Preserve the guidebook's technical depth, chapter structure, calculations, search, progress tracking,
and offline use while replacing the current copper/grid visual language with a calm Apple-inspired
editorial system and a more varied visualization stack. Increase the depth where a stronger physical
derivation, boundary condition, design trade-off, or measurement interpretation materially improves
understanding.

## Visual Direction

- Use `#f5f5f7` page backgrounds, white elevated surfaces, `#1d1d1f` primary text,
  `#6e6e73` secondary text, and Apple Blue as the single interface accent.
- Use system typography headed by `-apple-system`, `BlinkMacSystemFont`, and `SF Pro` fallbacks.
- Remove the graph-paper page texture, orange/copper palette, decorative all-caps density,
  and every colored vertical rule from explanatory text cards.
- Replace text-card side rules with quiet surface changes: 1 px neutral borders, 16–20 px radii,
  restrained shadows, generous padding, and semantic labels expressed through typography.
- Keep dark mode using black/charcoal surfaces, soft gray text, and a brighter blue accent.
- Retain responsive navigation, print styles, focus visibility, and contrast appropriate for long reading.

## Visualization Strategy

Use a hybrid approach so the medium matches the learning task.

The completed guide will contain at least thirty instructional visual blocks. Visual density must support
the explanation rather than decorate it: every visual needs a specific learning question, caption, and
adjacent interpretation.

### ImageGen: colored physical intuition

Use clean, text-free or minimally labeled educational illustrations for phenomena that depend on color
and spatial intuition:

1. Electric and magnetic fields around a current-carrying PCB trace.
2. Energy flow and concentrated return current between a trace and reference plane.
3. Near-field versus far-field transition and source/coupling/victim EMC model.
4. Common-mode versus differential-mode radiation.

Images will use a consistent light neutral background, blue electric-field cues, magenta/red
magnetic-field cues, and restrained translucent layers. Korean explanation and precise labels remain
in HTML captions so generated text inside images does not become an accuracy or accessibility risk.

### Three.js: interactive spatial structures

Add locally bundled, pinned Three.js code for:

1. A rotatable multilayer PCB stackup with signal trace, dielectric, planes, and vias.
2. A transmission-line/reflection scene showing an edge moving along a trace and returning from the load.
3. A probe measurement scene showing DUT node, probe tip, ground path, and loop-area changes.

Each scene gets keyboard-accessible controls, a static fallback image/caption, reduced-motion behavior,
and a bounded animation loop that pauses when off-screen. No runtime CDN is allowed.

### Draw skill: exact engineering diagrams

Use the technical drawing workflow for visuals where geometry and connection correctness matter more
than painterly depth:

1. Oscilloscope/probe connection and ground-spring comparison.
2. Board bring-up power sequencing and fault-isolation flow.
3. Return-path discontinuity and stitching-via placement.

These drawings use the same grayscale/blue visual language but are not used for the electromagnetic-field
illustrations.

### Canvas: quantitative plots

Keep Canvas for response curves, transients, sampling/aliasing, impedance, and other numeric plots because
their values change with inputs. Restyle axes, grids, legends, and controls to match the new neutral system.

### SVG retirement

Remove SVG as the primary illustration medium. Existing SVG scenes will be replaced by ImageGen,
Three.js, draw-skill assets, or Canvas depending on purpose. Small interface icons may remain as text/CSS;
no new instructional SVG figures will be introduced.

## Asset and Code Boundaries

- Store raster assets under `assets/images/` with descriptive names.
- Store draw-skill source/output under `assets/diagrams/`.
- Store Three.js 0.185.1, pinned from the official npm package, under `assets/vendor/` and scenes in
  `assets/three-scenes.js`.
- Keep engineering calculations in `assets/calculators.js`; scene code consumes results but does not
  duplicate formulas.
- Add meaningful `alt` text and adjacent HTML captions for every raster or 3D visualization.

## Performance and Failure Handling

- Compress generated images and provide explicit width/height to avoid layout shifts.
- Lazy-load below-the-fold raster images and initialize Three.js only near the viewport.
- Respect `prefers-reduced-motion`; show a stable scene when motion is reduced.
- If WebGL is unavailable, replace the scene with its static fallback and retain the explanation.
- Keep all reading and calculations usable when optional visual enhancement fails.

## Verification

- Add structure tests proving instructional SVG mounts have been retired and the three visual media are present.
- Add tests for local-only Three.js runtime references, image alternative text, reduced-motion handling,
  and WebGL fallback hooks.
- Re-run all calculation and structural tests.
- Visually inspect desktop, tablet, and mobile widths in light and dark themes.
- Exercise each Three.js scene, verify generated/drawn asset loading, and check browser warning/error logs.

## Out of Scope

- Rewriting chapter content or changing engineering formulas.
- Expanding explanations that preserve the existing chapter intent is in scope; wholesale chapter
  reorganization is not.
- Adding a build system or a network dependency.
- Replacing quantitative interactive plots with decorative images.
- Reproducing protected figures from standards or textbooks.
