# PCB Workflow and SMT Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compact circuit-design handoff and fabrication-to-SMT workflow to `HW_Guide` without changing its sixteen-chapter structure.

**Architecture:** Canonical copy remains in `content/`; the build regenerates `index.html`, `chapters/`, `reference/`, and `assets/search-index.json`. New editorial blocks reuse the existing chapter cards plus one responsive semantic process-flow component in the shared stylesheet.

**Tech Stack:** Static HTML, CSS, JSON, Node.js ES modules, built-in `node:test`.

## Global Constraints

- Preserve six Parts and exactly sixteen Chapters.
- Preserve all existing URLs, visualization IDs, offline assets, and page-navigation behavior.
- Add no dependency, external runtime, EDA tutorial, company procedure, universal IPC number table, stencil formula, or reflow recipe.
- Canonical files are under `content/`; generated files must only be changed by `scripts/build.mjs`.
- Use current official IPC pages only for scope/revision context; do not reproduce paid normative requirements.
- Use the bundled Node executable at `C:\Users\scott.woo\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`.

---

### Task 1: Lock the new curriculum contract with failing tests

**Files:**
- Modify: `tests/structure.test.mjs`
- Modify: `tests/build.test.mjs`

**Interfaces:**
- Consumes: generated chapter/reference HTML and `assets/search-index.json`.
- Produces: regression contracts for the circuit workflow, PCB/PCBA boundary, SMT stages, glossary, checklists, and search vocabulary.

- [ ] **Step 1: Add the failing structure test**

Add this test to `tests/structure.test.mjs` using the file-reading helper already present in that file:

```js
test("guide connects circuit design, artwork, fabrication, SMT, and PCBA release", async () => {
  const [chapter05, chapter08] = await Promise.all([
    readFile(new URL("../chapters/05-real-components.html", import.meta.url), "utf8"),
    readFile(new URL("../chapters/08-pcb-materials-stackup-and-vias.html", import.meta.url), "utf8"),
  ]);

  assert.match(chapter05, /요구사항[\s\S]*블록도[\s\S]*회로도[\s\S]*BOM[\s\S]*layout constraint/);
  assert.match(chapter05, /ERC[^.]*보장하지/);
  assert.match(chapter08, /Bare PCB[\s\S]*SMT[\s\S]*PCBA/);
  assert.match(chapter08, /solder paste[\s\S]*SPI[\s\S]*pick-and-place[\s\S]*reflow[\s\S]*AOI/);
});
```

- [ ] **Step 2: Add the failing search-index test**

Add to `tests/build.test.mjs` after its existing search-index assertions:

```js
test("search index exposes circuit handoff and SMT vocabulary", async () => {
  const entries = JSON.parse(await readFile(
    new URL("../assets/search-index.json", import.meta.url),
    "utf8",
  ));
  const text = entries.flatMap(({ title, keywords = [], body = "" }) => [
    title,
    ...keywords,
    body,
  ]).join(" ");

  for (const term of ["회로설계", "Artwork", "Bare PCB", "PCBA", "SMT", "SPI", "AOI", "centroid"]) {
    assert.match(text, new RegExp(term, "i"), `search vocabulary ${term}`);
  }
});
```

- [ ] **Step 3: Run the two test files and confirm RED**

Run:

```powershell
& 'C:\Users\scott.woo\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/structure.test.mjs tests/build.test.mjs
```

Expected: both new tests fail because the workflow, SMT sequence, and search vocabulary are absent. Keep the RED tests uncommitted until Task 2 makes them pass.

### Task 2: Add the circuit-design and fabrication-to-SMT chapter content

**Files:**
- Modify: `content/chapters/05-real-components.html`
- Modify: `content/chapters/08-pcb-materials-stackup-and-vias.html`
- Modify: `content/guide.json`
- Modify: `assets/styles.css`

**Interfaces:**
- Consumes: existing chapter card classes, Chapter 05/08 metadata, and the build's heading/search extraction.
- Produces: `development-flow` HTML/CSS plus searchable circuit-design and SMT content.

- [ ] **Step 1: Add Chapter 05's design-handoff section**

Insert a `deep-dive` block before Chapter 05's self-check. Its visible structure and copy must include:

```html
<article class="deep-dive" aria-labelledby="design-handoff-title">
  <header><h3 id="design-handoff-title">회로설계는 연결도가 아니라 인수물의 흐름이다</h3></header>
  <ol class="development-flow" aria-label="요구사항에서 보드 검증까지의 개발 흐름">
    <li><b>요구사항</b><span>동작 상태, 인터페이스, 환경과 합격 기준</span></li>
    <li><b>블록도·전원 트리</b><span>전압 도메인, clock/reset과 보호 경계</span></li>
    <li><b>부품 선정</b><span>권장 동작, 공차, derating과 대체품</span></li>
    <li><b>회로도</b><span>계산·simulation·ERC와 peer review</span></li>
    <li><b>BOM·제약조건</b><span>net class, layout constraint와 test point</span></li>
    <li><b>검증 인수</b><span>revision과 acceptance evidence 연결</span></li>
  </ol>
</article>
```

Follow it with a compact artifact table naming owner question, input, output, and the next reviewer. Include the explicit limit sentence: `ERC 통과는 연결 규칙을 확인할 뿐 정격·안정도·SI/PI margin·안전·layout 품질을 보장하지 않는다.`

- [ ] **Step 2: Add Chapter 08's bare-board and SMT section**

Insert a `deep-dive` before Chapter 08's self-check with these ordered stages and definitions:

```html
<ol class="development-flow" aria-label="Bare PCB 제작부터 PCBA 검사까지의 흐름">
  <li><b>Bare PCB 제작</b><span>imaging·etching·lamination·drilling·plating</span></li>
  <li><b>표면 형성</b><span>solder mask·surface finish·electrical test</span></li>
  <li><b>Paste 인쇄</b><span>stencil과 solder paste, SPI로 높이·면적 확인</span></li>
  <li><b>Pick-and-place</b><span>centroid·rotation·polarity·fiducial 기준</span></li>
  <li><b>Reflow</b><span>paste·부품·보드·oven 조건별 thermal profile</span></li>
  <li><b>검사·시험</b><span>AOI·필요 시 X-ray·전기/기능 시험·통제된 rework</span></li>
</ol>
```

Add a two-column release table separating fabrication data (`Gerber/ODB++/IPC-2581`, `NC drill`, stackup, fabrication drawing, netlist, acceptance notes) from assembly data (BOM, centroid, assembly drawing, paste data, polarity/pin-1, approved substitutions, inspection criteria). Add defect explanations for insufficient/excess solder, bridging, tombstoning, open, void, and orientation errors, and state that SPI/AOI/X-ray have different detection coverage and do not independently prove electrical function or lifetime reliability.

- [ ] **Step 3: Update chapter metadata and sources**

In `content/guide.json`:

```json
{
  "chapter05KeywordsToAdd": ["회로설계", "block diagram", "power tree", "BOM", "ERC", "layout constraint"],
  "chapter08KeywordsToAdd": ["Bare PCB", "PCBA", "SMT", "SPI", "AOI", "centroid", "reflow"],
  "officialSourcesToAdd": [
    "https://www.ipc.org/ipc-document-revision-table",
    "https://www.ipc.org/news-release/ipc-releases-j-revisions-two-leading-standards-electronics-assembly"
  ]
}
```

Translate that specification into the existing Chapter 05 and 08 JSON objects: merge the keywords, add bilingual term definitions, and add source objects with exact official titles and `standards-body-revision-resource` or `standards-body-news-release` types. Do not add the wrapper object shown above.

- [ ] **Step 4: Style the semantic process flow**

Add a responsive component to `assets/styles.css`:

```css
.development-flow {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

.development-flow li {
  display: grid;
  gap: 0.35rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 1rem;
  background: var(--surface);
}

.development-flow span { color: var(--text-secondary); }

@media (max-width: 760px) {
  .development-flow { grid-template-columns: 1fr; }
}
```

Use the actual existing secondary-text and surface custom-property names if they differ; preserve these layout values.

- [ ] **Step 5: Build and confirm the chapter tests turn GREEN**

```powershell
& 'C:\Users\scott.woo\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/build.mjs
& 'C:\Users\scott.woo\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/structure.test.mjs tests/build.test.mjs
```

Expected: build reports sixteen chapters and both targeted test files pass.

- [ ] **Step 6: Commit chapter and generated output changes**

```powershell
git add tests/structure.test.mjs tests/build.test.mjs content/chapters/05-real-components.html content/chapters/08-pcb-materials-stackup-and-vias.html content/guide.json assets/styles.css index.html chapters reference assets/search-index.json
git commit -m "feat: explain circuit handoff and smt flow"
```

### Task 3: Add glossary and release checklists

**Files:**
- Modify: `content/reference/glossary.html`
- Modify: `content/reference/checklists.html`
- Regenerate: `reference/glossary.html`
- Regenerate: `reference/checklists.html`
- Regenerate: `assets/search-index.json`

**Interfaces:**
- Consumes: existing glossary-term and print-checklist markup.
- Produces: nine bilingual terms and four release-oriented checklist groups.

- [ ] **Step 1: Add a failing glossary and checklist contract**

Add to `tests/structure.test.mjs`:

```js
test("reference pages expose PCB production terms and release checklists", async () => {
  const [glossary, checklists] = await Promise.all([
    readFile(new URL("../reference/glossary.html", import.meta.url), "utf8"),
    readFile(new URL("../reference/checklists.html", import.meta.url), "utf8"),
  ]);
  for (const term of ["Artwork", "Bare PCB", "PCBA", "SMT", "SPI", "AOI", "DFA", "Centroid data"]) {
    assert.match(glossary, new RegExp(term, "i"), `glossary term ${term}`);
  }
  for (const heading of ["회로설계 릴리스", "Artwork·SI·PI 검토", "PCB 제작 릴리스", "SMT 조립 릴리스"]) {
    assert.match(checklists, new RegExp(heading), `checklist ${heading}`);
  }
});
```

Run the test and confirm it fails because the new terms and headings are absent:

```powershell
& 'C:\Users\scott.woo\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/structure.test.mjs
```

- [ ] **Step 2: Add the glossary entries**

Add exactly these concepts using existing `glossary-term` markup:

```html
<div class="glossary-term"><dt>아트워크 · Artwork / PCB Layout</dt><dd>회로도의 net을 실제 footprint·배치·동박·비아·기준면 구조로 구현하는 PCB 물리 설계.</dd></div>
<div class="glossary-term"><dt>베어 PCB · Bare PCB</dt><dd>부품을 실장하기 전 제작과 전기검사를 마친 인쇄회로기판.</dd></div>
<div class="glossary-term"><dt>PCBA · Printed Circuit Board Assembly</dt><dd>PCB에 부품을 실장·납땜하고 필요한 검사를 수행한 조립체.</dd></div>
<div class="glossary-term"><dt>표면실장기술 · SMT</dt><dd>표면실장 부품을 paste 인쇄, 배치, reflow와 검사로 PCB에 조립하는 기술.</dd></div>
<div class="glossary-term"><dt>솔더 페이스트 검사 · SPI</dt><dd>실장 전에 인쇄된 solder paste의 위치·높이·면적·체적을 검사하는 공정.</dd></div>
<div class="glossary-term"><dt>자동광학검사 · AOI</dt><dd>카메라와 조명으로 부품 위치·극성 및 보이는 solder joint 상태를 검사하는 공정.</dd></div>
<div class="glossary-term"><dt>조립용이성 설계 · DFA</dt><dd>부품 배치·land pattern·접근성·공정 능력을 조립 수율과 검사 가능성에 반영하는 활동.</dd></div>
<div class="glossary-term"><dt>중심좌표 데이터 · Centroid data</dt><dd>pick-and-place 프로그램에 필요한 부품 기준점의 X/Y 좌표, 회전과 면 정보를 담은 파일.</dd></div>
<div class="glossary-term"><dt>조립도 · Assembly drawing</dt><dd>부품 위치, reference designator, 극성, pin 1, 미실장 option과 조립 주의사항을 표시한 도면.</dd></div>
```

- [ ] **Step 3: Replace the broad PCB checklist with four handoff groups**

Keep measurement and bring-up checklists unchanged. Add four `print-checklist` groups whose headings and minimum checks are:

```html
<h4>회로설계 릴리스</h4>
<!-- requirements, power tree, ratings/derating, ERC limits, BOM alternates, layout constraints/test points, revision -->
<h4>Artwork·SI·PI 검토</h4>
<!-- footprint/pin map, source-load-return, stackup/impedance, layer transitions, critical loops, decoupling loop, DRC limits -->
<h4>PCB 제작 릴리스</h4>
<!-- Gerber/ODB++/IPC-2581, NC drill, stackup, drawing, netlist, impedance coupon, independent viewer, revision -->
<h4>SMT 조립 릴리스</h4>
<!-- BOM, centroid, assembly drawing, polarity/pin 1, paste, substitutions, fiducials/courtyard, SPI/AOI/X-ray/test acceptance -->
```

Render every comment item above as a visible checkbox label, not an HTML comment.

- [ ] **Step 4: Rebuild and rerun the targeted contracts**

```powershell
& 'C:\Users\scott.woo\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/build.mjs
& 'C:\Users\scott.woo\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/structure.test.mjs tests/build.test.mjs
```

Expected: glossary, checklist, and search assertions pass.

- [ ] **Step 5: Commit the reference upgrade**

```powershell
git add tests/structure.test.mjs content/reference/glossary.html content/reference/checklists.html reference/glossary.html reference/checklists.html assets/search-index.json
git commit -m "docs: add pcb release glossary and checklists"
```

### Task 4: Full verification and release readiness

**Files:**
- Verify only: whole repository

**Interfaces:**
- Consumes: all previous task outputs.
- Produces: clean, reproducible site ready for branch push and PR.

- [ ] **Step 1: Run the production build and complete test suite**

```powershell
& 'C:\Users\scott.woo\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/build.mjs
& 'C:\Users\scott.woo\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/*.test.mjs
```

Expected: build reports one home, sixteen chapters, four references, and all tests pass with zero failures.

- [ ] **Step 2: Verify generated-file consistency and Git scope**

```powershell
git diff --check
git status --short
git diff --stat origin/main...HEAD
```

Expected: no whitespace errors; only the design, plan, tests, canonical content/style/metadata, and generated outputs named by this plan are changed.

- [ ] **Step 3: Commit any build-only generated updates**

```powershell
git add index.html chapters reference assets/search-index.json
git diff --cached --quiet; if ($LASTEXITCODE -ne 0) { git commit -m "build: refresh pcb workflow guide pages" }
```
