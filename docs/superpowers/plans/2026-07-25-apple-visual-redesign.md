# Apple-style Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-subagent-driven-development (recommended) or superpowers-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the PCB HW guide as a restrained Apple-inspired publication, deepen the physical explanations, and expand it to at least thirty purposeful visual blocks using ImageGen, Three.js, technical drawings, Canvas, and HTML/CSS.

**Architecture:** Preserve the semantic single-page book and pure calculation module. Add locally pinned Three.js scenes as optional progressive enhancement, raster educational assets with HTML captions, and exact technical drawings while retaining Canvas for quantitative plots. All content and core interactions remain usable offline and when WebGL is unavailable.

**Tech Stack:** Semantic HTML, CSS, vanilla JavaScript, Canvas 2D, Three.js 0.185.1 ESM, PNG/WebP assets, Node.js built-in test runner, in-app browser QA.

**Repository note:** This workspace is not a Git repository, so commit steps are intentionally omitted. Do not initialize Git without user authorization.

---

### Task 1: Lock the redesign contract with failing tests

**Files:**
- Modify: `tests/structure.test.mjs`
- Create: `tests/visual-media.test.mjs`
- Read: `index.html`
- Read: `assets/styles.css`

- [ ] **Step 1: Add failing Apple-style assertions**

Add tests that read `assets/styles.css` and require the neutral palette and card treatment:

```js
test("visual system uses a neutral Apple-style palette", () => {
  assert.match(styles, /--paper:\s*#f5f5f7/i);
  assert.match(styles, /--ink:\s*#1d1d1f/i);
  assert.match(styles, /--accent:\s*#0071e3/i);
  assert.doesNotMatch(styles, /--copper:/);
});

test("explanatory cards do not use colored vertical rules", () => {
  const cards = styles.match(
    /\.example-card,[\s\S]*?\.warning-card\s*\{[\s\S]*?\}/,
  )?.[0] ?? "";
  assert.doesNotMatch(cards, /border-left/);
  assert.match(cards, /border:\s*1px solid var\(--line\)/);
  assert.match(cards, /border-radius:\s*(?:1rem|16px|18px|20px)/);
});
```

- [ ] **Step 2: Add failing media-diversity assertions**

Create `tests/visual-media.test.mjs` with:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const scenes = await readFile(new URL("../assets/three-scenes.js", import.meta.url), "utf8")
  .catch(() => "");

test("guide contains at least thirty instructional visual blocks", () => {
  const count = [...html.matchAll(/class="[^"]*\bvisual-panel\b/g)].length;
  assert.ok(count >= 30, `found ${count}`);
});

test("guide uses all approved visual media", () => {
  assert.ok([...html.matchAll(/data-visual-medium="imagegen"/g)].length >= 6);
  assert.ok([...html.matchAll(/data-visual-medium="three"/g)].length >= 4);
  assert.ok([...html.matchAll(/data-visual-medium="draw"/g)].length >= 5);
  assert.ok([...html.matchAll(/data-visual-medium="canvas"/g)].length >= 10);
});

test("instructional SVG stages are retired", () => {
  assert.doesNotMatch(html, /class="visual-stage"[\s\S]{0,240}<svg/);
});

test("Three scenes expose fallback and reduced-motion behavior", () => {
  assert.match(scenes, /webgl-fallback/);
  assert.match(scenes, /prefers-reduced-motion/);
  assert.match(scenes, /IntersectionObserver/);
});
```

- [ ] **Step 3: Run the new tests and verify RED**

Run:

```powershell
node --test tests/structure.test.mjs tests/visual-media.test.mjs
```

Expected: failures for missing Apple tokens, existing vertical card borders, fewer than thirty visual blocks,
missing media markers, existing SVG stages, and missing `assets/three-scenes.js`.

---

### Task 2: Rebuild the visual system in CSS

**Files:**
- Modify: `assets/styles.css`
- Test: `tests/structure.test.mjs`

- [ ] **Step 1: Replace root color and typography tokens**

Use:

```css
:root {
  color-scheme: light;
  --paper: #f5f5f7;
  --paper-raised: #ffffff;
  --paper-soft: #fbfbfd;
  --ink: #1d1d1f;
  --ink-muted: #6e6e73;
  --line: rgb(0 0 0 / 10%);
  --line-strong: rgb(0 0 0 / 18%);
  --accent: #0071e3;
  --accent-soft: #e8f2ff;
  --danger: #d70015;
  --shadow: 0 12px 36px rgb(0 0 0 / 7%);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
    "Apple SD Gothic Neo", "Segoe UI", sans-serif;
}

[data-theme="dark"] {
  color-scheme: dark;
  --paper: #000000;
  --paper-raised: #1c1c1e;
  --paper-soft: #111113;
  --ink: #f5f5f7;
  --ink-muted: #98989d;
  --line: rgb(255 255 255 / 12%);
  --line-strong: rgb(255 255 255 / 20%);
  --accent: #2997ff;
  --accent-soft: rgb(41 151 255 / 16%);
  --danger: #ff453a;
  --shadow: 0 16px 44px rgb(0 0 0 / 32%);
}
```

- [ ] **Step 2: Remove decorative grid and copper semantics**

Set `body` to a solid `var(--paper)` background. Rename all `--copper` and `--copper-deep` uses to
`--accent`, remove uppercase decoration that harms scanning, and replace navigation side rules with a
soft selected background and blue text.

- [ ] **Step 3: Restyle cards and controls**

Apply one neutral family to `.concept-block`, `.equation-panel`, `.example-card`, `.bridge-card`,
`.note-card`, `.warning-card`, `.visual-panel`, and `.self-check`: no `border-left` or colored top rule,
`border: 1px solid var(--line)`, 18 px radius, white/charcoal surface, low shadow, and semantic labels
distinguished by weight rather than a colored bar. Give controls 10–12 px radii and an Apple-blue focus ring.

- [ ] **Step 4: Update print and responsive styles**

Keep controls hidden in print, force white paper/black text in printed output, avoid splitting visual cards,
and keep the 390 px header within the viewport.

- [ ] **Step 5: Run the palette and card tests**

Run:

```powershell
node --test tests/structure.test.mjs
```

Expected: Apple palette and vertical-rule tests pass; media tests may still fail.

---

### Task 3: Prepare visual asset directories and local Three.js

**Files:**
- Create: `assets/images/.gitkeep`
- Create: `assets/diagrams/.gitkeep`
- Create: `assets/vendor/three.module.min.js`
- Create: `assets/vendor/THREE-LICENSE.txt`
- Modify: `index.html`
- Test: `tests/visual-media.test.mjs`

- [ ] **Step 1: Create asset directories with `apply_patch`**

Add the two `.gitkeep` files so the intended directory responsibilities are explicit before generated
assets arrive.

- [ ] **Step 2: Fetch the pinned official runtime**

Download `three@0.185.1/build/three.module.min.js` from the official npm package distribution, place the
exact file at `assets/vendor/three.module.min.js`, and copy the package MIT license to
`assets/vendor/THREE-LICENSE.txt`. Record the pinned version in `README.md`.

- [ ] **Step 3: Add local module loading**

Add only local runtime references:

```html
<script type="module" src="assets/three-scenes.js"></script>
```

Do not add CDN, remote font, or runtime image URLs.

- [ ] **Step 4: Add and run the local-runtime assertion**

Require `assets/three-scenes.js` to import:

```js
import * as THREE from "./vendor/three.module.min.js";
```

Run:

```powershell
node --test tests/structure.test.mjs tests/visual-media.test.mjs
```

Expected: local runtime checks pass; scene and asset count checks remain red.

---

### Task 4: Generate six colored ImageGen learning illustrations

**Files:**
- Create: `assets/images/em-field-around-trace.png`
- Create: `assets/images/field-energy-return-path.png`
- Create: `assets/images/near-far-field.png`
- Create: `assets/images/differential-common-mode.png`
- Create: `assets/images/source-coupling-victim.png`
- Create: `assets/images/decoupling-current-loop.png`

- [ ] **Step 1: Generate the conductor-field illustration**

Prompt for a clean textbook-quality cutaway of a copper PCB trace over a ground plane, with blue electric
field lines terminating between trace and plane, magenta magnetic loops encircling current, off-white
background, no embedded paragraphs, no fake labels, and enough empty margin for an HTML caption.

- [ ] **Step 2: Generate the energy/return-path illustration**

Prompt for a translucent 3D PCB cross-section showing electromagnetic energy concentrated in the dielectric
and return-current density concentrated below a fast signal trace, using the same color language.

- [ ] **Step 3: Generate the near/far-field illustration**

Prompt for a split educational scene comparing reactive near-field storage close to a PCB loop and radiating
far-field waves at distance, with a restrained scientific aesthetic and no text.

- [ ] **Step 4: Generate the differential/common-mode illustration**

Prompt for a side-by-side board-level comparison showing field cancellation for differential current and
strong cable/chassis radiation for common-mode current, without claiming exact scale.

- [ ] **Step 5: Generate the source/coupling/victim illustration**

Prompt for a clear system illustration of a noise source, capacitive/inductive/radiated coupling paths, and
a susceptible receiver, leaving labels to HTML.

- [ ] **Step 6: Generate the decoupling-loop illustration**

Prompt for an exploded, colored PCB power-current loop from IC power pin through local decoupling capacitor
and reference plane, emphasizing loop inductance and placement distance.

- [ ] **Step 7: Inspect and normalize assets**

Inspect every output at original resolution. Reject images with broken conductor topology, arrows that do not
form a plausible loop, embedded gibberish, or inconsistent color semantics. Crop only excessive empty area,
preserve aspect ratio, and keep each file below 1.5 MB where quality permits.

---

### Task 5: Produce five exact technical drawings

**Files:**
- Create: `assets/diagrams/probe-ground-comparison.png`
- Create: `assets/diagrams/return-path-discontinuity.png`
- Create: `assets/diagrams/bringup-flow.png`
- Create: `assets/diagrams/via-reference-transition.png`
- Create: `assets/diagrams/measurement-chain.png`

- [ ] **Step 1: Draw the probe connection comparison**

Create a reusable 16:9 PNG comparing a long probe ground lead with a ground spring. Show the loop area,
parasitic inductance location, DUT node, and scope input without decorative field effects.

- [ ] **Step 2: Draw the return-path discontinuity**

Show a trace crossing a plane split versus routing over a continuous reference plane, with the actual return
detour and loop area clearly distinguished.

- [ ] **Step 3: Draw the bring-up decision flow**

Create a top-down diagnostic flow from current-limited power application through rail checks, reset/clock,
interfaces, thermal inspection, and evidence capture. Keep decision diamonds and recovery paths legible in Korean.

- [ ] **Step 4: Draw the via/reference transition**

Show a signal via changing layers, adjacent stitching/reference vias, and the high-frequency displacement/current
return path. Include a bad case with distant stitching.

- [ ] **Step 5: Draw the measurement chain**

Show `DUT → test point → probe → cable/front end → ADC/acquisition → displayed result`, with bandwidth,
loading, noise, and setup as bounded annotations.

- [ ] **Step 6: Visually inspect all drawings**

Verify conductor continuity, reference-plane identity, arrow direction, Korean text legibility, and line weight
at both 1440 px and 390 px page widths.

---

### Task 6: Build four progressive-enhancement Three.js scenes

**Files:**
- Create: `assets/three-scenes.js`
- Modify: `assets/styles.css`
- Test: `tests/visual-media.test.mjs`

- [ ] **Step 1: Define the scene registry**

Export and register:

```js
export const sceneNames = [
  "pcb-stackup-3d",
  "transmission-reflection-3d",
  "probe-loop-3d",
  "pdn-current-loop-3d",
];
```

Bind only to `[data-three-scene]` mounts and place all sizing/disposal behavior in this module.

- [ ] **Step 2: Implement shared lifecycle**

Create renderer/camera helpers, `ResizeObserver`, `IntersectionObserver`, theme-aware colors,
`matchMedia("(prefers-reduced-motion: reduce)")`, pointer rotation, keyboard left/right rotation,
pause when off-screen, and full disposal of geometries/materials on teardown.

- [ ] **Step 3: Implement the PCB stackup scene**

Render translucent dielectric slabs, copper planes, a controlled-impedance trace, antipad, signal via,
and two stitching vias. Add HTML buttons for top, section, and return-path views.

- [ ] **Step 4: Implement the transmission/reflection scene**

Animate a bounded pulse marker from source to load and back. Drive the displayed reflection sign and
amplitude from `reflectionCoefficient()` in `assets/calculators.js`; do not duplicate the formula.

- [ ] **Step 5: Implement the probe-loop scene**

Render a probe tip, DUT pad, selectable long lead versus spring geometry, and a translucent loop-area surface.
Update the adjacent inductance estimate through the existing calculator.

- [ ] **Step 6: Implement the PDN current-loop scene**

Render the IC, package inductance, capacitor, power/ground planes, and current path. Let a placement-distance
control change loop geometry while the HTML caption explains that geometry is illustrative, not a field solver.

- [ ] **Step 7: Implement WebGL fallback**

If renderer creation fails, add `.webgl-fallback`, reveal the existing static fallback `<img>`, and leave
the caption and calculation results intact.

- [ ] **Step 8: Run the scene tests**

Run:

```powershell
node --test tests/visual-media.test.mjs tests/calculators.test.mjs
```

Expected: scene registry, fallback, reduced-motion, local import, and calculation tests pass.

---

### Task 7: Replace instructional SVG and expand to thirty visual blocks

**Files:**
- Modify: `index.html`
- Modify: `assets/visualizations.js`
- Modify: `assets/styles.css`
- Test: `tests/visual-media.test.mjs`
- Test: `tests/visualizations.test.mjs`

- [ ] **Step 1: Mark retained Canvas plots**

Add `data-visual-medium="canvas"` to the quantitative plots for energy/power, RC transient, phasor,
RLC response, real capacitor impedance, crosstalk, PDN impedance, scope bandwidth, sampling/aliasing,
probe ringing, and other live numeric plots. Keep their interactive inputs.

- [ ] **Step 2: Replace four SVG stages**

Replace the voltage-divider, stackup, return-path, and transmission/reflection instructional SVG stages
with the most appropriate Three.js, draw, or Canvas representation. Remove their SVG renderer routes from
`assets/visualizations.js` only after the replacement mounts render.

- [ ] **Step 3: Insert six ImageGen figures**

Place each generated image in the relevant chapter with:

```html
<figure class="visual-panel media-figure" data-visual-medium="imagegen">
  <img src="assets/images/..." alt="..." width="1600" height="1000" loading="lazy">
  <figcaption><strong>학습 질문</strong><span>해석과 적용 한계</span></figcaption>
</figure>
```

Write alt text describing the physical relationship rather than color alone.

- [ ] **Step 4: Insert five technical drawings**

Place the draw-skill figures in return-path, oscilloscope/probe, and bring-up chapters. Give each a learning
question, adjacent explanation, and explicit note where the drawing is qualitative.

- [ ] **Step 5: Insert four Three.js mounts**

Each mount contains a visible title, keyboard instructions, `role="img"` description, static fallback image,
and adjacent calculation/result strip.

- [ ] **Step 6: Reach and verify the media target**

Run:

```powershell
node --test tests/visual-media.test.mjs tests/visualizations.test.mjs
```

Expected: at least thirty visual panels, at least six ImageGen, four Three.js, five draw, ten Canvas,
zero instructional SVG stages, and a renderer route for every retained `data-visualization`.

---

### Task 8: Deepen the technical explanations around the new visuals

**Files:**
- Modify: `index.html`
- Modify: `tests/structure.test.mjs`

- [ ] **Step 1: Add depth assertions for field-heavy chapters**

Require chapters 6, 7, 9, 11, 12, 13, and 14 to contain at least 2,400 plain-text characters and require
the terms `boundary condition`, `Poynting`, `공통 모드`, `loop inductance`, `probe loading`, and
`measurement uncertainty` in their relevant sections.

- [ ] **Step 2: Run the assertions and verify RED**

Run:

```powershell
node --test tests/structure.test.mjs
```

Expected: failures identify chapters and concepts that need expansion.

- [ ] **Step 3: Deepen electromagnetics and return-path content**

Explain conductor/dielectric boundary conditions, why tangential electric field drives loss, Poynting-vector
energy flow, field concentration near a reference plane, skin/proximity effects, and where the quasi-TEM model
stops being adequate. Tie each derivation to the colored field illustrations.

- [ ] **Step 4: Deepen transmission-line and EMC content**

Add reflection timing, source/load impedance interaction, common-mode conversion from imbalance,
source-path-victim coupling, near/far-field limits, cable/chassis antenna behavior, and why suppressing a
source is usually preferable to shielding the victim.

- [ ] **Step 5: Deepen PI and measurement content**

Add package/plane/via inductance, anti-resonance, target impedance limitations, probe transfer functions,
noise floor versus resolution, alias ambiguity, trigger selection, measurement uncertainty, and a repeatable
setup-record template.

- [ ] **Step 6: Run structural and calculation tests**

Run:

```powershell
node --test tests/structure.test.mjs tests/calculators.test.mjs
```

Expected: all depth, terminology, structure, and engineering calculation tests pass.

---

### Task 9: Documentation and full visual verification

**Files:**
- Modify: `README.md`
- Modify: `QA.md`
- Modify: `.planning/2026-07-25-pcb-hw-guide/progress.md`

- [ ] **Step 1: Document the media system**

Update README with the Three.js 0.185.1 pin, asset directories, ImageGen/draw provenance, offline behavior,
WebGL fallback, reduced-motion behavior, and instructions for adding a visual without introducing SVG.

- [ ] **Step 2: Run the complete automated suite**

Run:

```powershell
node --test tests/*.test.mjs
```

Expected: zero failures.

- [ ] **Step 3: Verify responsive layouts**

In the in-app browser inspect 1440×1000, 768×1024, and 390×844. At each width verify zero horizontal
overflow, readable captions, correctly sized raster assets, usable scene controls, and no header overlap.
Reset the temporary viewport afterward.

- [ ] **Step 4: Verify both themes and reduced motion**

Toggle light/dark and confirm Canvas/Three colors update. Emulate or enable reduced motion and confirm
Three scenes remain stable rather than continuously animating.

- [ ] **Step 5: Exercise every visual medium**

Open one figure of each ImageGen and draw asset, manipulate every Three.js scene, adjust at least four Canvas
calculators, open search, change font size, mark/unmark a chapter, and verify print CSS hides controls.

- [ ] **Step 6: Inspect browser logs and record evidence**

Require zero browser errors and warnings after the complete interaction pass. Record exact automated test
count, media counts, viewport results, asset-loading results, and any bounded limitations in `QA.md`.

- [ ] **Step 7: Present the finished guide**

Leave the local guide open as a deliverable browser tab, clean up intermediate/error tabs, and provide clickable
links to `index.html`, `README.md`, `QA.md`, the redesign spec, and this implementation plan.
