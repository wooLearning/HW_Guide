# PCB HW Design & Validation Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-subagent-driven-development (recommended) or superpowers-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an offline-first Korean HTML guidebook that connects circuit theory, electromagnetics, PCB design, SI/PI/EMC, oscilloscope measurement, and board validation through detailed explanations and interactive visualizations.

**Architecture:** `index.html` contains the semantic book content and visualization mount points. Focused CSS and JavaScript files provide the design system, navigation/search state, pure engineering calculations, and SVG/Canvas rendering. No build step or network dependency is required.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, SVG, Canvas 2D, Node.js built-in test runner

---

## File Map

- `index.html`: cover, navigation, all 16 chapters, appendices, accessible controls, visualization mount points
- `assets/styles.css`: responsive book layout, typography, components, print and dark themes
- `assets/calculators.js`: DOM-independent electrical calculation and formatting functions
- `assets/visualizations.js`: SVG/Canvas renderers and input bindings
- `assets/app.js`: navigation, search, progress, theme, font size, quiz disclosure
- `tests/calculators.test.mjs`: numerical unit tests for engineering calculations
- `tests/structure.test.mjs`: static checks for chapters, landmarks, references, and offline assets
- `README.md`: how to open, study, test, and extend the guide

## Task 1: Create the executable skeleton

**Files:**
- Create: `index.html`
- Create: `assets/styles.css`
- Create: `assets/app.js`
- Create: `tests/structure.test.mjs`

- [ ] **Step 1: Write the failing structural test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("book exposes sixteen numbered chapters", () => {
  const ids = [...html.matchAll(/<section[^>]+id="chapter-(\d+)"/g)].map((m) => Number(m[1]));
  assert.deepEqual(ids, Array.from({ length: 16 }, (_, index) => index));
});

test("book has offline local assets and core landmarks", () => {
  assert.match(html, /<nav[^>]+aria-label="주요 목차"/);
  assert.match(html, /<main[^>]+id="book"/);
  assert.doesNotMatch(html, /https?:\/\/[^"']+\.(?:js|css)/);
});
```

- [ ] **Step 2: Run the structural test and confirm the expected failure**

Run: `node --test tests/structure.test.mjs`

Expected: FAIL because `index.html` does not exist.

- [ ] **Step 3: Create all chapter sections and local asset links**

Create the document shell with `chapter-0` through `chapter-15`, a skip link, labeled navigation, search dialog, progress bar, appendices, and only these local scripts:

```html
<link rel="stylesheet" href="assets/styles.css">
<script defer src="assets/calculators.js"></script>
<script defer src="assets/visualizations.js"></script>
<script defer src="assets/app.js"></script>
```

- [ ] **Step 4: Add the minimum responsive layout and navigation state**

Define `--paper`, `--ink`, `--copper`, `--signal`, `--danger` tokens, a three-column desktop grid, a single-column mobile layout, visible `:focus-visible`, and print rules that hide `.book-nav`, `.book-tools`, and `.interactive-controls`.

- [ ] **Step 5: Run the structural test**

Run: `node --test tests/structure.test.mjs`

Expected: PASS for chapter IDs and offline asset checks.

## Task 2: Implement tested electrical calculations

**Files:**
- Create: `assets/calculators.js`
- Create: `tests/calculators.test.mjs`

- [ ] **Step 1: Write calculation tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const code = await readFile(new URL("../assets/calculators.js", import.meta.url), "utf8");
const context = { globalThis: {} };
vm.runInNewContext(code, context);
const c = context.globalThis.HWCalculators;

test("loaded voltage divider includes load resistance", () => {
  assert.equal(c.loadedDivider(5, 1000, 1000, Infinity).vout, 2.5);
  assert.ok(Math.abs(c.loadedDivider(5, 1000, 1000, 1000).vout - 5 / 3) < 1e-12);
});

test("RC charge reaches 63.2 percent at one time constant", () => {
  assert.ok(Math.abs(c.rcCharge(1, 1, 1, 1) - (1 - Math.exp(-1))) < 1e-12);
});

test("reflection coefficient handles matched open and short loads", () => {
  assert.equal(c.reflectionCoefficient(50, 50), 0);
  assert.equal(c.reflectionCoefficient(Infinity, 50), 1);
  assert.equal(c.reflectionCoefficient(0, 50), -1);
});

test("scope and signal rise times combine by root sum square", () => {
  assert.ok(Math.abs(c.observedRiseTime(1e-9, 2e-9) - Math.sqrt(5) * 1e-9) < 1e-18);
});
```

- [ ] **Step 2: Run tests and confirm the missing module failure**

Run: `node --test tests/calculators.test.mjs`

Expected: FAIL because `assets/calculators.js` does not exist.

- [ ] **Step 3: Implement the pure function API**

Expose one frozen `globalThis.HWCalculators` object containing:

```js
{
  loadedDivider,
  rcCharge,
  rcDischarge,
  rlcMagnitude,
  capacitorImpedance,
  reflectionCoefficient,
  reflectedStepLevels,
  parallelImpedance,
  targetImpedance,
  coupledNoiseEstimate,
  aliasFrequency,
  observedRiseTime,
  bandwidthForRiseTime,
  probeGroundInductance,
  formatEngineering
}
```

Each function validates finite positive values where physically required and returns `NaN` or a structured `{ error }` result for invalid interactive input.

- [ ] **Step 4: Run calculation tests**

Run: `node --test tests/calculators.test.mjs`

Expected: all tests PASS.

## Task 3: Build the reading interface

**Files:**
- Modify: `index.html`
- Modify: `assets/styles.css`
- Modify: `assets/app.js`
- Modify: `tests/structure.test.mjs`

- [ ] **Step 1: Extend static checks**

Add checks for `data-search-open`, `data-theme-toggle`, `data-font-step`, `data-reading-progress`, one TOC link per chapter, and a `references` section.

- [ ] **Step 2: Confirm the new checks fail**

Run: `node --test tests/structure.test.mjs`

Expected: FAIL on missing tool controls.

- [ ] **Step 3: Implement navigation and preferences**

In `assets/app.js`, implement:

```js
const safeStorage = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* memory-only fallback */ }
  }
};
```

Use `IntersectionObserver` to update the current chapter and reading progress. Store `hw-guide-theme`, `hw-guide-font-scale`, and `hw-guide-completed`.

- [ ] **Step 4: Implement search**

Index chapter headings, keyword badges, and paragraph text once after `DOMContentLoaded`. Render at most 20 ranked results, highlight the matching excerpt, move focus to results, and navigate to the chosen section without rewriting the source text.

- [ ] **Step 5: Verify structure and keyboard behavior**

Run: `node --test tests/structure.test.mjs`

Expected: PASS. Then use the browser with Tab, Shift+Tab, Enter, and Escape to verify tools and dialog focus.

## Task 4: Write Part I — circuit language

**Files:**
- Modify: `index.html`
- Modify: `assets/visualizations.js`
- Modify: `assets/styles.css`

- [ ] **Step 1: Draft chapters 0–5 using the chapter template**

Include charge/energy conservation, SI units, KCL/KVL, Thevenin/Norton, C/L continuity, time constants, complex impedance, resonance/Q, Bode intuition, and parasitic RLC of real parts.

- [ ] **Step 2: Add worked examples with verified values**

Use 5 V/1 kΩ divider loading, 10 kΩ·100 nF RC, 10 Ω–10 mH–1 µF RLC, and an MLCC with ESR/ESL examples. Show given values, equation, substitution, result, and a sanity check.

- [ ] **Step 3: Implement the Part I interactives**

Bind range/number inputs to voltage-divider, RC transient, phasor, RLC frequency-response, and real-capacitor impedance visualizations. Every visualization must update an adjacent textual result table.

- [ ] **Step 4: Check chapter completeness**

For chapters 0–5, confirm each contains `.intuition`, `.equation`, `.pcb-bridge`, `.measurement-note`, `.misconception`, `.worked-example`, and `.self-check`.

## Task 5: Write Part II and Part III — fields, transmission lines, PCB, SI/PI/EMC

**Files:**
- Modify: `index.html`
- Modify: `assets/visualizations.js`
- Modify: `assets/styles.css`
- Modify: `tests/calculators.test.mjs`

- [ ] **Step 1: Draft chapters 6–9**

Explain field quantities and Maxwell equations conceptually, Poynting-vector intuition, propagation velocity, characteristic impedance, reflection coefficient, electrical length, stackup/materials, fabrication constraints, and return-path continuity.

- [ ] **Step 2: Draft chapters 10–12**

Explain edge-rate-driven SI, discontinuities, crosstalk, timing/eye, target impedance, decoupling/anti-resonance, source-path-victim, common/differential mode, conducted/radiated paths, filtering, shielding, and pre-compliance thinking.

- [ ] **Step 3: Implement the Part II/III interactives**

Create SVG/Canvas views for field energy flow, transmission-line reflection, stackup field confinement, return-current detour, crosstalk, PDN impedance, and common/differential current.

- [ ] **Step 4: Add numerical tests**

Test `targetImpedance(0.05, 2) === 0.025`, a 1 m open 50 Ω line has Γ = 1, parallel capacitors reduce low-frequency impedance, and alias frequency remains inside `[0, fs/2]`.

- [ ] **Step 5: Run all automated tests**

Run: `node --test tests/*.test.mjs`

Expected: all tests PASS.

## Task 6: Write Part IV and Part V — measurement and validation

**Files:**
- Modify: `index.html`
- Modify: `assets/visualizations.js`
- Modify: `assets/styles.css`

- [ ] **Step 1: Draft chapters 13–14**

Cover bandwidth versus rise time, sample rate versus bandwidth, memory depth, interpolation and aliasing, trigger, probe attenuation/loading, compensation, ground-lead inductance, differential/current probes, floating measurement hazards, and measurement uncertainty.

- [ ] **Step 2: Draft chapter 15**

Build a safe sequence: documentation review, visual/ohmic checks, current-limited power-up, rail sequencing/ripple, clock/reset, firmware-independent tests, interfaces, load/thermal tests, margins, regression, and evidence logging.

- [ ] **Step 3: Implement measurement interactives**

Create sampling/aliasing, bandwidth/rise-time, probe loading/ground-lead ringing, and bring-up decision-flow visualizations. Display measurement cautions beside every control.

- [ ] **Step 4: Add reusable checklists**

Include printable pre-power, first-power, rail, clock/reset, digital interface, analog path, EMC pre-check, thermal, and defect-isolation checklists.

## Task 7: Add appendices and source trail

**Files:**
- Modify: `index.html`
- Modify: `README.md`
- Modify: `tests/structure.test.mjs`

- [ ] **Step 1: Add formula and unit sheet**

Include Ohm/power, RC/RL, complex impedance, resonance, propagation/reflection, target impedance, dB, bandwidth/rise-time, wavelength, and skin-depth forms with every symbol defined.

- [ ] **Step 2: Add glossary and learning routes**

Provide at least 80 Korean/English term pairs and 6-week and 12-week reading plans.

- [ ] **Step 3: Add references by authority tier**

List IPC/IEC/FCC/IEEE, official instrument and semiconductor vendor primers, and standard textbooks. Add access dates to web references and mark paywalled standards as such.

- [ ] **Step 4: Write README**

Document direct opening, optional local server command, test command, browser support, print-to-PDF, source policy, and how to add a chapter or visualization.

- [ ] **Step 5: Add structural thresholds**

Assert that the HTML contains at least 16 `.worked-example` blocks, 16 `.misconception` blocks, 16 `.self-check` blocks, 12 visualization mounts, 80 glossary terms, and 15 source entries.

## Task 8: Browser QA and correction

**Files:**
- Modify: any failing source file
- Create: `QA.md`

- [ ] **Step 1: Run the full test suite**

Run: `node --test tests/*.test.mjs`

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Serve locally**

Run: `python -m http.server 8765 --bind 127.0.0.1`

Expected: `Serving HTTP on 127.0.0.1 port 8765`.

- [ ] **Step 3: Inspect desktop and mobile layouts**

Verify at 1440×1000, 768×1024, and 390×844: no horizontal overflow, readable formulas, visible active chapter, usable controls, and correct canvas scaling.

- [ ] **Step 4: Test interactions**

Exercise every calculator at default, minimum, maximum, and one invalid input. Test search, theme, font size, completed state, reduced motion, internal links, and print preview.

- [ ] **Step 5: Check runtime health**

Read browser console logs and confirm no uncaught errors, failed local requests, missing assets, or accessibility-blocking focus traps.

- [ ] **Step 6: Record QA evidence**

Write `QA.md` with commands, pass/fail totals, viewports, interactions checked, content corrections, and remaining limitations.

## Plan Self-Review

- Spec coverage: all 16 chapters, 17 planned visuals, appendices, offline behavior, accessibility, responsive layout, print, calculations, citations, and QA are mapped to tasks.
- Placeholder scan: the plan contains no `TBD`, `TODO`, or unspecified implementation step.
- Interface consistency: `HWCalculators` names used in tests and visualizations match the Task 2 API.
- Scope decision: the guide is one coherent learning product. Deep RF/antenna and certification procedure remain explicitly outside the first edition.

