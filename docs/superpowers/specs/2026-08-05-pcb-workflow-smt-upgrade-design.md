# PCB Workflow and SMT Upgrade Design

## Purpose

Keep `HW_Guide` as the compact, scan-friendly companion to the deeper Study Studio while closing two curriculum gaps: the end-to-end circuit-design handoff and the distinction between bare-board fabrication and SMT assembly.

The existing six-part, sixteen-chapter navigation remains unchanged. New material is added to the canonical files under `content/`; generated pages under `chapters/` and `reference/` continue to be produced by the build.

## Audience and success criteria

The primary reader is a beginner who needs to participate in PCB reviews before becoming a domain specialist. After the upgrade, the reader must be able to:

- place circuit design, PCB artwork/layout, SI, PI, PCB fabrication, SMT, and bring-up in one development flow;
- distinguish the owner, input, output, and review question for each stage;
- distinguish a bare PCB from a PCBA and fabrication data from assembly data;
- identify the minimum document package required at circuit-to-layout, layout-to-fabricator, and layout-to-assembler handoffs;
- use concise checklists without treating DRC, ERC, AOI, or one prototype as proof of production readiness.

## Content design

### Chapter 05: circuit-design workflow

Add a compact section after the existing real-component discussion. It presents this ordered workflow:

1. product requirements and interfaces;
2. block diagram and power tree;
3. component selection with operating limits and derating;
4. schematic capture, calculation, simulation, and ERC;
5. BOM and approved alternatives;
6. layout constraints, test points, and review handoff.

The section includes a handoff table connecting each design decision to a reviewable artifact. It explicitly states that ERC checks connectivity rules but cannot prove ratings, stability, SI/PI margin, safety, or layout quality.

### Chapter 08: fabrication and SMT

Extend the existing fabrication explanation with a clearly separated process chain:

- bare-board fabrication: imaging, etching, lamination, drilling, plating, solder mask, surface finish, and electrical test;
- SMT assembly: solder-paste printing, SPI, pick-and-place, reflow, AOI/X-ray where applicable, functional inspection, and controlled rework;
- finished-state vocabulary: bare PCB versus PCBA.

Add an input/output table separating fabrication files from assembly files. Fabrication includes Gerber/ODB++/IPC-2581, NC drill, stackup, fabrication drawing, netlist, and acceptance notes. Assembly includes BOM, centroid/pick-and-place data, assembly drawing, polarity and pin-1 information, paste data, approved substitutions, and inspection criteria.

The section explains common SMT defects at an introductory level: insufficient/excess solder, bridging, tombstoning, polarity/orientation errors, opens, voiding, and hidden-joint inspection limits. It does not prescribe universal stencil apertures, reflow profiles, or acceptability numbers; those remain process-, component-, and current-standard-specific.

### Reference pages

Add bilingual glossary entries for Artwork/PCB Layout, Bare PCB, PCBA, SMT, SPI, AOI, DFA, centroid data, and assembly drawing.

Expand the printable checklists into four handoff groups:

- circuit-design review;
- artwork/SI/PI review;
- PCB fabrication release;
- SMT assembly release.

Update `content/guide.json` keywords, terms, and sources so the new concepts are searchable and source-backed without adding chapters.

## Visual and interaction design

Reuse the existing chapter visual language. Add one compact, semantic HTML process flow rather than a new interactive lab: requirements to schematic to layout to bare PCB to PCBA to bring-up. The flow must remain readable in print and at the existing mobile breakpoint. No new dependency, external runtime, or decorative image is introduced.

## Evidence and sourcing

Normative manufacturing values are out of scope. Process definitions and handoff guidance use current official IPC/JEDEC standard landing pages and official component or assembly-process documentation where publicly available. Every source added to metadata must use an HTTP(S) canonical page and must not imply that a paid standard's full requirements are reproduced.

## Testing

Add failing content-contract tests before production edits. Tests must prove that:

- the sixteen-chapter structure remains unchanged;
- the circuit workflow and fabrication/SMT distinction are present in generated content;
- glossary and checklist terms are searchable and rendered;
- the search index exposes the new workflow and SMT vocabulary;
- existing build, accessibility, visualization, and content-depth tests remain green.

Run `node scripts/build.mjs` and the complete `node --test tests/*.test.mjs` suite with the bundled Node.js runtime.

## Non-goals

- EDA-tool tutorials or screenshots;
- company-specific release procedures;
- universal IPC numeric tables, stencil rules, or reflow recipes;
- replacing the deeper Study Studio explanations;
- changing the visual system, navigation architecture, or chapter count.

## Delivery

Commit the upgrade in the `HW_Guide` repository after all tests pass. If GitHub authentication is already available, push the verified commit to `origin/main` so the existing GitHub Pages workflow can deploy it; otherwise stop before the push and report the required login step.
