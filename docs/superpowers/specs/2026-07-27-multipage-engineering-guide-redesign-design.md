# PCB HW Guide — Multi-page Engineering Textbook Redesign

Date: 2026-07-27  
Status: approved visual direction, pending written-spec review

## 1. Goal

Rebuild the current single-page PCB hardware guide as a multi-page Korean engineering
textbook website. The guide must support two kinds of use without becoming two separate
products:

1. A learner can start from circuit fundamentals and build a physically correct mental model.
2. A hardware engineer can return later and quickly recover a formula, layout principle,
   measurement caveat, or validation sequence.

The new edition is not an OJT cheat sheet. It is a first-principles guide that repeatedly
connects:

`physical law → circuit model → PCB structure → measured waveform → engineering decision`

## 2. Approved Design Direction

The visual target combines the selected concepts:

- The calm editorial structure, large scientific plates, restrained Korean serif chapter
  headings, definition rail, and citation treatment from concept 1.
- The practical probe/bench comparisons, causal chains, measurement checklists, and failure
  cues from concept 3.
- A light three-column desktop layout: chapter navigation, primary reading column, and a
  contextual reference rail.
- Warm white paper, near-black text, cobalt blue, safety orange, copper, and limited magenta
  for electromagnetic-field annotations.
- No giant centered page card, dark heavy sidebar, dashboard metrics, nested card grids,
  gradients, decorative pills, or tiny uppercase labels.

The approved visual target is stored with the project:

`docs/design/2026-07-27-approved-chapter-layout.png`

## 3. Audience and Depth

- Primary reader: an undergraduate-level learner or early-career PCB hardware engineer.
- Math prerequisite: high-school algebra and trigonometry. Complex numbers, derivatives,
  integrals, and vectors are reintroduced where they first become necessary.
- Depth target: a solid undergraduate overview plus enough PCB and bench context to explain
  why design rules work and where they stop working.
- Tone: precise, calm, and explanatory. Do not imitate lecture notes, datasheet prose, or
  certification marketing.
- Language: Korean first. Established English terms appear next to Korean on first use and
  remain searchable.

Each important claim must expose its assumptions. Rules of thumb must be marked as such and
must include the variable that controls validity, such as rise time, trace delay, loop area,
impedance, bandwidth, or current slew rate.

## 4. Information Architecture

### 4.1 Home

`index.html` becomes a real book home rather than the first page of one giant document.

It contains:

- Title, edition, scope, and a short statement of the guide's learning philosophy.
- A visual learning map from circuit abstraction to fields, PCB, SI/PI/EMC, and measurement.
- Five parts and sixteen chapter entries with short outcomes and estimated reading time.
- Three entry routes: first-principles route, PCB/SI route, and measurement/debug route.
- Continue-reading state from local progress.
- Search entry, glossary, formula sheet, references, and print/download guidance.

### 4.2 Chapter Pages

Create one URL per chapter under `chapters/`:

- `00-models-and-scale.html`
- `01-electrical-quantities.html`
- `02-dc-circuits.html`
- `03-capacitors-and-inductors.html`
- `04-ac-frequency-and-resonance.html`
- `05-real-components.html`
- `06-electromagnetics.html`
- `07-transmission-lines.html`
- `08-pcb-materials-stackup-and-vias.html`
- `09-placement-routing-and-return-paths.html`
- `10-signal-integrity.html`
- `11-power-integrity.html`
- `12-emc-and-emi.html`
- `13-oscilloscope-fundamentals.html`
- `14-probing-and-measurement.html`
- `15-bringup-validation-and-debug.html`

### 4.3 Reference Pages

- `reference/formulas.html`
- `reference/glossary.html`
- `reference/checklists.html`
- `reference/sources.html`

### 4.4 URL and Navigation Behavior

- Every chapter has stable section anchors for deep links.
- Previous/next chapter navigation appears at the end of the reading column.
- The left navigation preserves part and chapter context.
- On mobile, the left navigation becomes a chapter drawer and the right rail flows inline.
- Search results link directly to a chapter section, not only to the page top.

## 5. Standard Chapter Learning Sequence

Every chapter follows the same semantic rhythm, while the visual composition may vary:

1. **Chapter thesis** — the one physical idea the reader should retain.
2. **Why this matters** — the later PCB or measurement problem this idea explains.
3. **First visual model** — a large static teaching plate before controls or derivations.
4. **Physical principle** — definitions, conservation law, boundary condition, and assumptions.
5. **Equation unpacked** — symbols, units, sign convention, limiting cases, and dimensional check.
6. **Worked example** — a realistic numerical example with a sanity check.
7. **PCB translation** — geometry, material, placement, routing, return path, or component effect.
8. **Bench translation** — what the instrument sees and how the setup can alter it.
9. **Failure comparison** — good/bad geometry, correct/incorrect measurement, or matched/unmatched case.
10. **Misconception correction** — one common but physically misleading explanation.
11. **Chapter synthesis** — a causal chain or annotated summary figure.
12. **Self-check** — three conceptual questions and one calculation or interpretation task.
13. **Sources and next reading** — section-level citations and an optional deeper path.

## 6. Content Scope by Chapter

### 00. Models, Scale, and Abstraction

- Lumped-circuit assumptions, propagation delay, rise time, wavelength, and model boundaries.
- The difference between an exact physical system and a useful engineering model.
- Visual: one ladder from electrostatics and lumped circuits to transmission lines and full-wave fields.

### 01. Electrical Quantities and Energy

- Charge, current, voltage, energy, power, reference potential, sign conventions, and SI units.
- Passive sign convention and energy accounting.
- Visual: energy ledger from source through fields and conductors to the load.

### 02. DC Circuits

- Ohm's law, KCL, KVL, node voltage, loop current, superposition, Thévenin/Norton, source resistance,
  loading, and measurement burden.
- Visual: annotated node/loop conservation map and loaded-divider comparison.

### 03. Capacitors and Inductors

- Constitutive relations, stored field energy, continuity conditions, RC/RL first-order response,
  initial/final value reasoning, and time constants.
- Visual: energy moving into E-field or H-field storage, with matching waveforms.

### 04. AC, Frequency, and Resonance

- Sinusoids, RMS, complex numbers, phasors, impedance, transfer functions, Bode plots, RLC resonance,
  Q, bandwidth, damping, and time/frequency duality.
- Visual: one coordinated phasor, time waveform, and frequency response.

### 05. Real Components

- ESR, ESL, self-resonance, tolerance, temperature, voltage bias, skin/proximity effects, diode recovery,
  MOSFET gate charge, switching loss, regulator stability, package and mounting parasitics.
- Visual: ideal symbol versus frequency-dependent physical equivalent.

### 06. Electromagnetics

- E, D, B, H, flux, Gauss, Faraday, Ampère–Maxwell, boundary conditions, field energy, Poynting vector,
  and the physical meaning of propagation.
- Visual: concept-1-style large colored plates for microstrip E/H fields, energy flow, and return current.

### 07. Transmission Lines

- Distributed L/C, characteristic impedance, velocity, delay, incident/reflected waves, reflection
  coefficient, source/load interaction, ringing, and termination.
- Visual: four-stage incident/reflected wave sequence plus matched/open/short limiting cases.

### 08. PCB Materials, Stackup, and Vias

- Copper, dielectric, Dk/Df, glass weave, solder mask, roughness, stackup, reference planes, microstrip,
  stripline, differential geometry, via barrels, stubs, pads, antipads, and fabrication tolerance.
- Visual: rotatable 3D stackup plus a static cross-section that remains understandable without WebGL.

### 09. Placement, Routing, and Return Paths

- Closed current loops, frequency-dependent return paths, reference continuity, plane gaps, layer changes,
  stitching vias/capacitors, loop area, placement by current path, and mixed-signal partitioning.
- Visual: good/bad return-path comparisons and field-confinement plates.

### 10. Signal Integrity

- Edge spectrum, interconnect discontinuities, reflections, overshoot/undershoot, crosstalk, timing,
  jitter, eye diagrams, differential pairs, skew, common-mode conversion, and S-parameter orientation.
- Visual: causality map from geometry discontinuity to waveform and timing margin.

### 11. Power Integrity

- PDN hierarchy, target impedance, transient current, decoupling loop inductance, capacitor impedance,
  anti-resonance, plane spreading, package/die contribution, ripple, and measurement.
- Visual: current-delivery time-scale ladder and spatial decoupling-loop comparison.

### 12. EMC and EMI

- Emission versus immunity, conducted versus radiated paths, source–path–victim, common/differential mode,
  near/far field, antennas as unintended structures, shielding, filtering, grounding, ESD/EFT overview,
  and pre-compliance logic.
- Visual: concept-1-style colored field/coupling plates plus a practical mitigation decision tree.

### 13. Oscilloscope Fundamentals

- Analog front end, bandwidth, rise time, sample rate, record length, interpolation, aliasing, trigger,
  vertical resolution, noise, averaging, acquisition modes, and measurement uncertainty.
- Visual: the same edge passing through bandwidth, sampling, and trigger stages.

### 14. Probing and Measurement

- Probe loading, passive/active/differential/current probes, compensation, attenuation, CMRR, common-mode
  limits, ground lead inductance, loop area, deskew, test points, fixtures, and safety.
- Visual: the approved long-ground-lead versus spring-ground teaching plate and waveform comparison.

### 15. Bring-up, Validation, and Debug

- Pre-power inspection, current-limited first power, rail sequence, current, ripple, clock, reset,
  interfaces, thermal checks, fault isolation, A/B experiments, evidence logging, and design review feedback.
- Visual: hypothesis → measurement → decision → next experiment flow with example evidence bundles.

## 7. Source and Verification Framework

The guide synthesizes sources; it does not reproduce protected textbook figures or long passages.

### 7.1 Foundation Sources

- MIT OpenCourseWare 6.002, *Circuits and Electronics*, for lumped abstraction, circuit analysis,
  energy storage, dynamics, and lab framing.
- MIT OpenCourseWare 8.02 and OpenStax *University Physics Volume 2* for charge, fields, induction,
  Maxwell equations, waves, AC, and resonance.
- Agarwal and Lang, *Foundations of Analog and Digital Electronic Circuits*, as a circuit-model
  reference.

### 7.2 High-speed, SI, and PI Sources

- Howard Johnson and Martin Graham, *High-Speed Digital Design*.
- Eric Bogatin, *Signal and Power Integrity — Simplified*, 3rd edition.
- David Pozar, *Microwave Engineering*, for transmission-line definitions and limiting cases.
- Current official semiconductor application notes for device-specific layout claims.

### 7.3 PCB and EMC Sources

- IPC official design-standard pages and current revision table, especially IPC-2221/2222,
  IPC-2141, IPC-2152, IPC-2228, and IPC-7351.
- Henry Ott, *Electromagnetic Compatibility Engineering*.
- Clayton Paul, Robert Scully, and Mark Steffka, *Introduction to Electromagnetic Compatibility*.
- Official TI, Analog Devices, and Rohde & Schwarz application notes for return paths, decoupling,
  common/differential-mode noise, filtering, and pre-compliance examples.

### 7.4 Measurement Sources

- Tektronix, *XYZs of Oscilloscopes* and *ABCs of Probes*.
- Keysight oscilloscope learning and probing guidance.
- Instrument manuals when a statement depends on an acquisition mode, probe topology, safety rating,
  bandwidth convention, or manufacturer-specific behavior.

### 7.5 Citation Rules

- Each chapter has a visible source rail and a complete source list.
- Claims tied to a standard include the document number, revision/date, and whether the source is
  normative or explanatory.
- Rules of thumb identify their source and applicability range.
- Generated figures are original and labeled as conceptual, approximate, or quantitative.
- Quantitative plots identify equations, assumptions, inputs, and units.
- Conflicting source conventions are stated rather than silently blended.

## 8. Visualization System

Every visual begins with a learning question and ends with an interpretation.

### 8.1 Static Teaching Plates — Default

Use large, colored, mostly static diagrams for first comprehension:

- ImageGen for electromagnetic fields, energy flow, radiation modes, probing scenes, and spatial comparisons.
- Deterministic PNG technical drawings for exact connections, sequencing, and geometry comparisons.
- HTML labels and captions carry precise Korean text, equations, and accessibility information; generated
  images should avoid relying on embedded text.

### 8.2 Three.js — Spatial Structure Only

Retain or rebuild Three.js only where rotation or depth reveals information unavailable in a flat plate:

- PCB stackup, via barrel/stub, and reference-plane relationship.
- Optional transmission-line field/propagation scene.

Every 3D scene requires:

- A static fallback plate.
- Pause when off-screen.
- Reduced-motion mode.
- Keyboard-accessible camera presets.
- A fixed explanatory state that makes sense without interaction.

### 8.3 Canvas — Quantitative Relationships Only

Keep interactive values only where changing a parameter teaches a genuine dependency:

- Loaded voltage divider.
- RC/RLC response.
- Transmission-line reflection.
- PDN impedance.
- Oscilloscope bandwidth and sampling.
- Probe ground-lead ringing.

Limit visible controls to the two or three variables that carry the lesson. Each interactive figure
opens with a meaningful default and includes a nearby static “what to notice” annotation.

### 8.4 Visual Consistency

- Blue: incident signal, electric field, or selected/nominal state.
- Orange: reflected signal, loss, or practical comparison.
- Magenta: magnetic-field or common-mode annotation.
- Copper: conductor geometry only.
- Red: unsafe, failed, or outside-limit state.
- Gray: reference structures and secondary information.

Instructional SVG figures remain out of scope. Interface icons may use a consistent icon library.

## 9. Typography and Reading System

- Self-host a Korean-capable variable sans font for body/UI and a subsetted Korean serif for chapter titles.
- Preferred pairing: Pretendard Variable for body/UI and Noto Serif KR for major chapter titles.
- Body: 17–18 px desktop, 16–17 px mobile, line-height 1.72–1.82.
- Reading width: 60–65 Korean characters per line.
- Chapter title: 48–64 px desktop, 34–42 px mobile.
- Section title: 27–34 px.
- Figure title: 20–24 px.
- Captions and source notes: minimum 13 px; avoid the current 0.68–0.78 rem density.
- Mono font is reserved for equations, net names, units, register values, and instrument settings.

Hierarchy relies on type, spacing, alignment, and thin rules before borders or elevated surfaces.

## 10. Responsive Layout

### Desktop, 1280 px and above

- Left navigation: 224–248 px.
- Central reading column: 720–820 px.
- Right context rail: 232–272 px.
- Total content frame: 1240–1400 px.

### Tablet, 768–1279 px

- Collapsible chapter navigation.
- Main column plus an inline/overlay reference rail.
- Large figures may use the full content width.

### Mobile, below 768 px

- Single reading column.
- Sticky compact header with chapter drawer, search, progress, and text-size control.
- Right-rail content moves after the relevant section.
- Comparison figures stack vertically but keep the same scale and legend.
- Tables use semantic reflow or scoped horizontal scrolling only when unavoidable.

## 11. Technical Architecture

Use a dependency-light static-generation workflow while preserving GitHub Pages hosting.

### Source Structure

```text
content/
  chapters/
  reference/
  home.mjs
templates/
  layout.mjs
  chapter.mjs
scripts/
  build.mjs
  build-search-index.mjs
public/
  assets/
index.html
chapters/
reference/
```

- Chapter source files contain structured metadata and semantic HTML content.
- Shared templates render the header, navigation, right rail, citations, and previous/next links.
- The Node build script uses only built-in modules unless a dependency is demonstrably valuable.
- Generated pages are committed because GitHub Pages serves the repository directly.
- Search metadata is generated from chapter titles, headings, keywords, and plain text.

### Runtime Modules

- `reading.js`: theme, font size, chapter completion, progress, and navigation state.
- `search.js`: generated search index and deep-link results.
- `figures.js`: shared figure lifecycle and accessibility behavior.
- `calculators.js`: pure engineering calculations with explicit units and validation.
- `visualizations.js`: Canvas charts only.
- `three-scenes.js`: bounded 3D scenes with fallbacks.

### State

- Completion state is stored by stable chapter ID.
- Existing completion data migrates from current `chapter-N` IDs.
- Theme and type scale remain local settings.
- Storage failure falls back to session memory without breaking reading.

## 12. Performance and Failure Handling

- Self-host fonts and subset weights/characters where practical.
- Convert large raster teaching plates to WebP with PNG fallback only when needed.
- Set image dimensions and lazy-load below-the-fold assets.
- Keep the initial home page and chapter shell lightweight; load Canvas/Three code only on pages that use it.
- Pause animations and observers when not visible.
- Respect `prefers-reduced-motion`.
- If WebGL fails, show the static teaching plate and retain all explanatory content.
- If JavaScript fails, chapter reading, navigation links, citations, and figures remain available.

## 13. Accessibility

- Semantic headings follow the visual hierarchy.
- The left navigation, chapter drawer, search, theme, and completion controls work by keyboard.
- Focus indicators remain visible on light and dark surfaces.
- All figures have concise alt text plus a longer adjacent interpretation.
- Color is never the only carrier of incident/reflected, good/bad, or E/H meaning.
- Equations expose readable text and symbol definitions.
- Interactive plots provide a short textual result and a table where useful.
- Minimum target size is 44 px for primary touch controls.
- Zoom and 390 px reflow must not hide content or create page-wide horizontal scrolling.

## 14. Validation

### Automated

- Build succeeds from a clean checkout.
- Exactly sixteen chapter pages and four reference pages are generated.
- Every chapter includes the standard semantic learning blocks.
- All internal links, assets, previous/next links, and deep anchors resolve.
- Every figure has alt text, caption, source status, and an interpretation.
- Calculation unit tests cover nominal, boundary, and invalid values.
- Search index contains every chapter and major section.
- No instructional SVG is introduced.

### Browser

- Verify desktop, tablet, and mobile layouts in light and dark themes.
- Check home → chapter → deep link → next chapter → search → reference flows.
- Check completion persistence and migration.
- Compare implementation screenshots with the approved design target at the same viewport.
- Check font loading, layout shift, cropped images, overflow, and console errors.
- Exercise all remaining interactive plots and all 3D fallbacks.

### Content

- Review equations, units, sign conventions, and limiting cases.
- Verify every standards claim against an official current-status page.
- Verify every measurement recommendation against official instrument guidance.
- Run a consistency pass across terminology, notation, color roles, and citations.

## 15. Migration Plan

- Preserve the existing public URL and redirect old chapter hash links where possible.
- Convert current chapter text into the new content source structure before expanding it.
- Reuse verified calculations, current source links, and valid teaching assets.
- Replace weak or redundant visuals chapter by chapter.
- Keep the old single-page build in Git history; do not ship two competing reading experiences.

## 16. Out of Scope

- Copying textbook prose, equations as page images, or protected figures.
- Republishing paid IPC standards.
- Accounts, cloud progress sync, comments, analytics, or a backend.
- Full-wave field solving, SPICE, or oscilloscope emulation in the browser.
- CAD tool tutorials and manufacturer-specific board house rules.
- Certification advice presented as legal or compliance approval.
- Decorative interaction that does not improve understanding.

## 17. Success Criteria

The redesign is successful when:

- A reader can identify the guide structure and start a route from the home page in under one minute.
- A chapter first explains the physical idea visually, then deepens it mathematically and practically.
- The body is comfortable to read without using the font-size control.
- A returned reader can find a chapter, term, formula, or checklist in a few actions.
- At least one static teaching plate in each technical part explains a spatial or causal relationship
  more clearly than the current interactive-first treatment.
- The complete 16-chapter site remains coherent, linkable, printable, accessible, and deployable as a
  static GitHub Pages repository.
