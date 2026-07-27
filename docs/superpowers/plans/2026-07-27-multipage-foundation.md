# Multi-page Engineering Guide Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-subagent-driven-development (recommended) or superpowers-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current single-page PCB guide into a working 16-chapter static textbook site with the approved editorial/field-manual reading system, while preserving all existing chapter content, calculations, figures, progress state, and GitHub Pages compatibility.

**Architecture:** Keep authoring content in chapter HTML fragments plus one JSON metadata file. A dependency-free Node build renders the home page, sixteen chapter pages, four reference pages, a generated search index, and shared navigation from small ESM templates. Existing calculation and visualization modules remain shared runtime assets; the reading/search runtime is refactored for multi-page state and deep links.

**Tech Stack:** Semantic HTML5, CSS custom properties, vanilla JavaScript/ESM, Node built-in modules, Node test runner, self-hosted WOFF2 fonts, Canvas, locally pinned Three.js, GitHub Pages.

---

## Plan Boundary

This plan deliberately covers only the working multi-page foundation and approved reading design.
It migrates all current content without reducing it and fully redesigns Chapter 14 as the reference
chapter. Two follow-on plans will cover:

1. Source-backed content expansion across all sixteen chapters.
2. New scientific teaching plates and the reduction of low-value interactions.

At the end of this plan, the public site is complete and usable, even before those expansion plans.

## File Responsibility Map

### Authoring sources

- `content/guide.json` — canonical part/chapter/reference metadata and source-rail summaries.
- `content/home.html` — home-page editorial introduction and learning-route copy.
- `content/chapters/*.html` — one semantic chapter fragment per chapter.
- `content/reference/*.html` — formula, glossary, checklist, and source-page fragments.

### Build system

- `scripts/migrate-single-page.mjs` — one-time deterministic extraction of the sixteen legacy sections.
- `scripts/build.mjs` — validates source data and writes all deployable HTML and search JSON.
- `templates/shell.mjs` — document shell, shared header, asset paths, search dialog, and scripts.
- `templates/navigation.mjs` — desktop/mobile chapter navigation and progress markup.
- `templates/home.mjs` — home page composition.
- `templates/chapter.mjs` — chapter header, content, right rail, and previous/next navigation.
- `templates/reference.mjs` — shared reference-page composition.

### Runtime assets

- `assets/styles.css` — approved tokens, typography, layout, chapter components, responsive and print rules.
- `assets/app.js` — multi-page reading state, navigation drawer, theme, type scale, completion, and progress.
- `assets/search.js` — search-index loading, ranking, result rendering, and deep-link navigation.
- `assets/calculators.js` — unchanged pure engineering calculations.
- `assets/visualizations.js` — existing Canvas renderers adapted to page-scoped mounts.
- `assets/three-scenes.js` — existing Three.js scenes adapted to page-scoped mounts.
- `assets/fonts/` — self-hosted Pretendard Variable and Noto Serif KR webfont files plus license notices.

### Generated deployable output

- `index.html`
- `chapters/*.html`
- `reference/*.html`
- `assets/search-index.json`

### Tests and documentation

- `tests/build.test.mjs` — metadata, page count, links, anchors, source blocks, and output validation.
- `tests/runtime-contract.test.mjs` — stable data attributes, storage migration, and search/runtime contracts.
- `tests/structure.test.mjs` — revised assertions for the multi-page output.
- `tests/visual-media.test.mjs` — revised figure checks across chapter files.
- `README.md` — authoring/build/deploy instructions.
- `QA.md` — new browser and content verification record.

---

### Task 1: Protect the Legacy Build and Define Multi-page Contracts

**Files:**
- Modify: `.gitignore`
- Create: `legacy/index-single-page.html`
- Create: `tests/build.test.mjs`
- Modify: `tests/structure.test.mjs`

- [ ] **Step 1: Ignore local design-audit artifacts**

Add the exact entry:

```gitignore
.audit/
```

- [ ] **Step 2: Preserve the current published document**

Copy the current `index.html` byte-for-byte to `legacy/index-single-page.html`. Do not remove
`index.html` until the new build can generate its replacement.

- [ ] **Step 3: Write the failing multi-page output test**

Create `tests/build.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const chapterSlugs = [
  "00-models-and-scale",
  "01-electrical-quantities",
  "02-dc-circuits",
  "03-capacitors-and-inductors",
  "04-ac-frequency-and-resonance",
  "05-real-components",
  "06-electromagnetics",
  "07-transmission-lines",
  "08-pcb-materials-stackup-and-vias",
  "09-placement-routing-and-return-paths",
  "10-signal-integrity",
  "11-power-integrity",
  "12-emc-and-emi",
  "13-oscilloscope-fundamentals",
  "14-probing-and-measurement",
  "15-bringup-validation-and-debug",
];

test("build emits home and sixteen chapter pages", async () => {
  await access(new URL("../index.html", import.meta.url));
  for (const slug of chapterSlugs) {
    await access(new URL(`../chapters/${slug}.html`, import.meta.url));
  }
});

test("chapter pages expose shared reading contracts", async () => {
  const html = await readFile(
    new URL("../chapters/14-probing-and-measurement.html", import.meta.url),
    "utf8",
  );
  assert.match(html, /data-page-kind="chapter"/);
  assert.match(html, /data-chapter-id="chapter-14"/);
  assert.match(html, /class="chapter-navigation"/);
  assert.match(html, /class="context-rail"/);
  assert.match(html, /data-chapter-complete/);
});
```

- [ ] **Step 4: Run the new test and confirm the missing-output failure**

Run:

```powershell
node --test tests/build.test.mjs
```

Expected: FAIL because `chapters/00-models-and-scale.html` does not exist.

- [ ] **Step 5: Replace single-document structure assertions with output-aware helpers**

In `tests/structure.test.mjs`, add:

```js
import { readdir } from "node:fs/promises";

const chapterDirectory = new URL("../chapters/", import.meta.url);
const chapterFiles = (await readdir(chapterDirectory))
  .filter((name) => name.endsWith(".html"))
  .sort();
const chapterHtml = await Promise.all(
  chapterFiles.map((name) => readFile(new URL(name, chapterDirectory), "utf8")),
);
const allChapterHtml = chapterHtml.join("\n");
```

Update chapter-count, template-block, figure, and source assertions to use `allChapterHtml`
instead of assuming all chapters live in `index.html`. Retain current calculator and visual-media
requirements.

- [ ] **Step 6: Commit the contract and preserved legacy file**

```powershell
git add .gitignore legacy/index-single-page.html tests/build.test.mjs tests/structure.test.mjs
git commit -m "test: define multipage guide contracts"
```

---

### Task 2: Extract Sixteen Authoring Fragments

**Files:**
- Create: `scripts/migrate-single-page.mjs`
- Create: `content/guide.json`
- Create: `content/chapters/*.html`
- Create: `content/reference/*.html`
- Create: `content/home.html`

- [ ] **Step 1: Write metadata with stable IDs and slugs**

Create `content/guide.json` with this exact top-level shape:

```json
{
  "title": "PCB HW Design & Validation",
  "edition": "2026.2",
  "parts": [
    { "id": "part-0", "label": "Orientation", "title": "모델과 학습 지도" },
    { "id": "part-1", "label": "Circuit Language", "title": "회로를 읽는 언어" },
    { "id": "part-2", "label": "Fields & Waves", "title": "회로도 밖의 물리" },
    { "id": "part-3", "label": "PCB Physics", "title": "PCB라는 물리 구조" },
    { "id": "part-4", "label": "Measurement", "title": "보이는 것과 실제 신호" },
    { "id": "part-5", "label": "Validation", "title": "검증과 문제 해결" }
  ],
  "chapters": [
    { "id": "chapter-0", "number": "00", "part": "part-0", "slug": "00-models-and-scale", "title": "지도를 먼저 보자", "lead": "집중소자 회로에서 실제 PCB까지, 언제 모델을 바꿔야 하는지 배운다." },
    { "id": "chapter-1", "number": "01", "part": "part-1", "slug": "01-electrical-quantities", "title": "단위·전하·전압·전류·전력", "lead": "전기량을 에너지와 보존법칙의 언어로 다시 정의한다." },
    { "id": "chapter-2", "number": "02", "part": "part-1", "slug": "02-dc-circuits", "title": "DC 회로", "lead": "Ohm, KCL/KVL, 등가회로와 부하 효과를 연결한다." },
    { "id": "chapter-3", "number": "03", "part": "part-1", "slug": "03-capacitors-and-inductors", "title": "커패시터와 인덕터", "lead": "에너지 저장과 연속조건으로 과도응답을 이해한다." },
    { "id": "chapter-4", "number": "04", "part": "part-1", "slug": "04-ac-frequency-and-resonance", "title": "AC와 주파수", "lead": "복소수, 페이저, 임피던스, 공진과 Bode 관점을 익힌다." },
    { "id": "chapter-5", "number": "05", "part": "part-1", "slug": "05-real-components", "title": "실제 부품", "lead": "기생 RLC와 반도체의 비이상성이 회로를 바꾸는 방식을 본다." },
    { "id": "chapter-6", "number": "06", "part": "part-2", "slug": "06-electromagnetics", "title": "전자기학의 최소 골격", "lead": "E, H, B, flux와 Maxwell 방정식의 물리적 메시지를 잡는다." },
    { "id": "chapter-7", "number": "07", "part": "part-2", "slug": "07-transmission-lines", "title": "전송선로", "lead": "파동, 특성임피던스, 지연, 반사와 종단을 이해한다." },
    { "id": "chapter-8", "number": "08", "part": "part-3", "slug": "08-pcb-materials-stackup-and-vias", "title": "PCB 재료·스택업·비아", "lead": "동박, 유전체, 비아와 제조 공차를 전기적 구조로 읽는다." },
    { "id": "chapter-9", "number": "09", "part": "part-3", "slug": "09-placement-routing-and-return-paths", "title": "배치·배선·귀환 경로", "lead": "신호선만이 아니라 닫힌 전류 루프를 설계한다." },
    { "id": "chapter-10", "number": "10", "part": "part-3", "slug": "10-signal-integrity", "title": "Signal Integrity", "lead": "빠른 edge, 불연속, 크로스토크와 타이밍 여유를 연결한다." },
    { "id": "chapter-11", "number": "11", "part": "part-3", "slug": "11-power-integrity", "title": "Power Integrity", "lead": "PDN과 target impedance로 전원 노이즈를 설계한다." },
    { "id": "chapter-12", "number": "12", "part": "part-3", "slug": "12-emc-and-emi", "title": "EMC와 EMI", "lead": "source–path–victim과 공통 모드 관점으로 방출과 내성을 본다." },
    { "id": "chapter-13", "number": "13", "part": "part-4", "slug": "13-oscilloscope-fundamentals", "title": "오실로스코프", "lead": "대역폭, 샘플링, 메모리와 트리거가 화면을 만드는 방식을 익힌다." },
    { "id": "chapter-14", "number": "14", "part": "part-4", "slug": "14-probing-and-measurement", "title": "프로브와 측정", "lead": "프로브 로딩, ground lead와 안전이 측정 결과에 미치는 영향을 본다." },
    { "id": "chapter-15", "number": "15", "part": "part-5", "slug": "15-bringup-validation-and-debug", "title": "Bring-up·검증·고장분석", "lead": "가설–측정–판정의 반복으로 안전하게 원인을 좁힌다." }
  ]
}
```

- [ ] **Step 2: Implement deterministic legacy extraction**

Create `scripts/migrate-single-page.mjs` with:

```js
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const legacy = await readFile(path.join(root, "legacy/index-single-page.html"), "utf8");
const guide = JSON.parse(await readFile(path.join(root, "content/guide.json"), "utf8"));

const extractSection = (id) => {
  const pattern = new RegExp(
    `<section class="chapter" id="${id}"[\\s\\S]*?<\\/section>`,
  );
  const match = legacy.match(pattern);
  if (!match) throw new Error(`Missing legacy section: ${id}`);
  return `${match[0]}\n`;
};

const chapterDirectory = path.join(root, "content/chapters");
await mkdir(chapterDirectory, { recursive: true });

for (const chapter of guide.chapters) {
  const output = path.join(chapterDirectory, `${chapter.slug}.html`);
  await writeFile(output, extractSection(chapter.id), "utf8");
}
```

- [ ] **Step 3: Run the extraction and verify all files are substantial**

Run:

```powershell
node scripts/migrate-single-page.mjs
Get-ChildItem content\chapters\*.html | Measure-Object
Get-ChildItem content\chapters\*.html | Where-Object Length -lt 3000
```

Expected:

- Count is `16`.
- The second command returns no files.

- [ ] **Step 4: Extract reference sections without copying the book shell**

Move the existing formula sheet, glossary, checklists, and references content into:

```text
content/reference/formulas.html
content/reference/glossary.html
content/reference/checklists.html
content/reference/sources.html
```

Each file must contain one `<article class="reference-content">` root and retain existing
terms, links, and checklist content.

- [ ] **Step 5: Create the home editorial fragment**

Create `content/home.html`:

```html
<section class="home-introduction" aria-labelledby="home-title">
  <p class="eyebrow">FROM FIRST PRINCIPLES TO THE BENCH</p>
  <h1 id="home-title">PCB HW<br><span>Design &amp; Validation</span></h1>
  <p class="home-thesis">
    회로 모델에서 출발해 장과 파동, PCB 구조, SI·PI·EMC, 측정까지
    하나의 물리로 연결하는 한국어 엔지니어링 가이드.
  </p>
</section>
```

- [ ] **Step 6: Commit the authoring-source migration**

```powershell
git add content scripts/migrate-single-page.mjs
git commit -m "build: extract guide authoring sources"
```

---

### Task 3: Build the Static Page Generator

**Files:**
- Create: `package.json`
- Create: `templates/shell.mjs`
- Create: `templates/navigation.mjs`
- Create: `templates/home.mjs`
- Create: `templates/chapter.mjs`
- Create: `templates/reference.mjs`
- Create: `scripts/build.mjs`
- Modify: `tests/build.test.mjs`

- [ ] **Step 1: Add dependency-free build commands**

Create `package.json`:

```json
{
  "name": "pcb-hw-design-validation-guide",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "node scripts/build.mjs",
    "test": "node --test tests/*.test.mjs",
    "check": "npm run build && npm test"
  }
}
```

- [ ] **Step 2: Write escaping and path helpers in the shell template**

`templates/shell.mjs` must export:

```js
export const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export const assetPrefixFor = (pageKind) =>
  pageKind === "home" ? "" : "../";
```

It must also export `renderShell({ pageKind, title, description, body, pageData })`,
which writes:

- `<html lang="ko" data-theme="light">`
- metadata and title
- versioned local CSS
- `data-page-kind`
- shared header and search dialog
- `pageData` as safe JSON in `<script id="guide-page-data" type="application/json">`
- local calculator, visualization, Three.js, search, and app scripts with the correct prefix

- [ ] **Step 3: Render one navigation contract for desktop and mobile**

`templates/navigation.mjs` must export `renderChapterNavigation({ guide, currentId, prefix })`.
Each chapter link uses:

```html
<a
  href="${prefix}chapters/${chapter.slug}.html"
  data-chapter-link="${chapter.id}"
  ${chapter.id === currentId ? 'aria-current="page"' : ""}
>
  <span>${chapter.number}</span>
  <strong>${escapeHtml(chapter.title)}</strong>
</a>
```

Do not duplicate navigation data in the chapter fragments.

- [ ] **Step 4: Render the home page from metadata**

`templates/home.mjs` must:

- Render `content/home.html`.
- Render five part groups and all sixteen chapter cards.
- Render the three learning routes.
- Link formula, glossary, checklist, and source pages.
- Include `data-continue-reading` for runtime hydration.

- [ ] **Step 5: Render the chapter shell**

`templates/chapter.mjs` must export:

```js
export const renderChapterPage = ({
  guide,
  chapter,
  content,
  previous,
  next,
}) => renderShell({
  pageKind: "chapter",
  title: `${chapter.number} ${chapter.title} — ${guide.title}`,
  description: chapter.lead,
  pageData: {
    pageKind: "chapter",
    chapterId: chapter.id,
    chapterCount: guide.chapters.length,
    chapterSlug: chapter.slug,
  },
  body: `
    <div class="site-grid" data-chapter-id="${chapter.id}">
      ${renderChapterNavigation({ guide, currentId: chapter.id, prefix: "../" })}
      <main class="reading-column" id="main-content">
        ${content}
        ${renderPager(previous, next)}
      </main>
      ${renderContextRail(chapter)}
    </div>
  `,
});
```

`renderContextRail(chapter)` must always include:

- Current chapter number and title.
- Completion toggle.
- Key terms from metadata, or a “핵심 정의는 본문과 함께 정리됩니다.” neutral state.
- Verified-source links from metadata, or a link to the complete source page.

- [ ] **Step 6: Implement source validation and output writes**

`scripts/build.mjs` must:

1. Read and validate `content/guide.json`.
2. Reject duplicate IDs, numbers, or slugs.
3. Require exactly sixteen chapters numbered `00` through `15`.
4. Require a corresponding non-empty fragment for every chapter.
5. Render `index.html`.
6. Render all `chapters/*.html`.
7. Render all `reference/*.html`.
8. Generate `assets/search-index.json`.
9. Remove stale generated chapter/reference HTML files that are not in metadata.

The search index entry shape is:

```js
{
  id: `${chapter.id}:${sectionId}`,
  chapterId: chapter.id,
  chapterNumber: chapter.number,
  chapterTitle: chapter.title,
  sectionTitle,
  href: `chapters/${chapter.slug}.html#${sectionId}`,
  text: plainText.slice(0, 1200),
  keywords: chapter.keywords ?? [],
}
```

- [ ] **Step 7: Run the build and make the page-count tests pass**

Run:

```powershell
npm run build
node --test tests/build.test.mjs
```

Expected: all build tests pass.

- [ ] **Step 8: Commit the generator and generated output**

```powershell
git add package.json scripts/build.mjs templates index.html chapters reference assets/search-index.json tests/build.test.mjs
git commit -m "build: generate multipage guide"
```

---

### Task 4: Implement the Approved Typography and Layout System

**Files:**
- Create: `assets/fonts/pretendard-variable.woff2`
- Create: `assets/fonts/noto-serif-kr-semibold.woff2`
- Create: `assets/fonts/OFL-Pretendard.txt`
- Create: `assets/fonts/OFL-Noto-Serif-KR.txt`
- Modify: `assets/styles.css`
- Modify: `tests/structure.test.mjs`

- [ ] **Step 1: Vendor fonts and licenses**

Download webfont files from the official Pretendard and Google Noto font distributions.
Store only the variable sans file and the serif semibold file used by the site. Store the
corresponding license text beside each font.

Verify:

```powershell
Get-Item assets\fonts\*.woff2 | Select-Object Name,Length
Get-Item assets\fonts\*.txt | Select-Object Name,Length
```

Expected: two non-empty WOFF2 files and two license files.

- [ ] **Step 2: Write failing typography-contract assertions**

Add to `tests/structure.test.mjs`:

```js
test("reading system self-hosts Korean sans and serif fonts", () => {
  assert.match(styles, /font-family:\s*"Pretendard Variable"/);
  assert.match(styles, /font-family:\s*"Noto Serif KR"/);
  assert.match(styles, /url\\("fonts\\/pretendard-variable\\.woff2"\\)/);
  assert.match(styles, /url\\("fonts\\/noto-serif-kr-semibold\\.woff2"\\)/);
});

test("body and captions meet the new readable type floor", () => {
  assert.match(styles, /--body-size:\s*1\\.0625rem/);
  assert.match(styles, /--caption-size:\s*0\\.8125rem/);
});
```

- [ ] **Step 3: Replace root tokens and typography**

The beginning of `assets/styles.css` must define:

```css
@font-face {
  font-family: "Pretendard Variable";
  src: url("fonts/pretendard-variable.woff2") format("woff2");
  font-weight: 45 920;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Noto Serif KR";
  src: url("fonts/noto-serif-kr-semibold.woff2") format("woff2");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

:root {
  --paper: #fffefa;
  --paper-subtle: #f6f7f9;
  --ink: #16171a;
  --ink-muted: #5d626b;
  --line: #dfe2e7;
  --blue: #075fda;
  --blue-soft: #edf5ff;
  --orange: #e75b17;
  --magenta: #d82888;
  --copper: #b96831;
  --danger: #c62828;
  --body-size: 1.0625rem;
  --caption-size: 0.8125rem;
  --reading-width: 46rem;
  --nav-width: 15rem;
  --rail-width: 16rem;
  font-family: "Pretendard Variable", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  font-size: calc(16px * var(--font-scale, 1));
  line-height: 1.78;
}
```

- [ ] **Step 4: Implement the three-column reading frame**

Use:

```css
.site-grid {
  width: min(100%, 90rem);
  margin-inline: auto;
  display: grid;
  grid-template-columns: var(--nav-width) minmax(0, var(--reading-width)) var(--rail-width);
  gap: clamp(2rem, 4vw, 4.5rem);
  align-items: start;
}

.chapter-navigation,
.context-rail {
  position: sticky;
  top: calc(var(--header-height) + 1.5rem);
  max-height: calc(100vh - var(--header-height) - 3rem);
  overflow: auto;
}

.reading-column {
  min-width: 0;
  padding-block: clamp(3rem, 8vw, 7rem);
}
```

At `max-width: 1199px`, remove the right column and flow context sections inline.
At `max-width: 767px`, use a single column and hide the desktop navigation behind the drawer.

- [ ] **Step 5: Restyle existing content classes without card proliferation**

- `.chapter h2` uses Noto Serif KR and `clamp(2.4rem, 5vw, 4rem)`.
- `.chapter p`, list items, and definitions inherit `var(--body-size)`.
- `.visual-panel` uses spacing and a top rule; it is not a floating card by default.
- Only examples, warnings, bench notes, and interactive controls use a tinted surface.
- Figure captions use at least `var(--caption-size)`.
- Existing `.keyword-row` becomes plain inline metadata, not a pill collection.

- [ ] **Step 6: Run structure tests**

Run:

```powershell
node --test tests/structure.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Commit the reading design**

```powershell
git add assets/fonts assets/styles.css tests/structure.test.mjs
git commit -m "style: add editorial engineering reading system"
```

---

### Task 5: Refactor Reading State for Multiple Pages

**Files:**
- Modify: `assets/app.js`
- Create: `tests/runtime-contract.test.mjs`
- Modify: `templates/shell.mjs`

- [ ] **Step 1: Write failing state-contract tests**

Create `tests/runtime-contract.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../assets/app.js", import.meta.url), "utf8");

test("reading state uses page metadata instead of counting local chapter sections", () => {
  assert.match(app, /guide-page-data/);
  assert.match(app, /chapterCount/);
  assert.match(app, /chapterId/);
});

test("legacy completion IDs remain valid after the multipage migration", () => {
  assert.match(app, /hw-guide-completed/);
  assert.match(app, /chapter-\\$\\{index\\}/);
});

test("completion updates all matching navigation links", () => {
  assert.match(app, /querySelectorAll\\("\\[data-chapter-link/);
});
```

- [ ] **Step 2: Parse page data safely**

Add to `assets/app.js`:

```js
const readPageData = () => {
  const node = document.querySelector("#guide-page-data");
  if (!node) return { pageKind: "home", chapterCount: 16 };
  try {
    const parsed = JSON.parse(node.textContent ?? "{}");
    return {
      pageKind: parsed.pageKind === "chapter" ? "chapter" : "home",
      chapterId: typeof parsed.chapterId === "string" ? parsed.chapterId : null,
      chapterCount: Number(parsed.chapterCount) || 16,
      chapterSlug: typeof parsed.chapterSlug === "string" ? parsed.chapterSlug : null,
    };
  } catch {
    return { pageKind: "home", chapterCount: 16 };
  }
};
```

- [ ] **Step 3: Make completion page-aware**

Use one `toggleChapterCompletion(chapterId)` function. The header count displays:

```js
completionCount.textContent = `${completedChapters.size}/${pageData.chapterCount}`;
```

The page and navigation reflect the state through:

```js
document
  .querySelectorAll(`[data-chapter-link="${chapterId}"]`)
  .forEach((link) => link.toggleAttribute("data-completed", complete));
```

When the current page is a chapter, the completion button toggles `pageData.chapterId`.

- [ ] **Step 4: Preserve old stored progress**

Treat existing `chapter-0` through `chapter-15` values as canonical. Do not rename them.
Filter invalid stored values with:

```js
const validChapterIds = new Set(
  Array.from({ length: pageData.chapterCount }, (_, index) => `chapter-${index}`),
);
```

- [ ] **Step 5: Implement continue-reading**

Store `hw-guide-last-chapter` when a chapter page loads. Hydrate the home link
`[data-continue-reading]` with the matching chapter URL supplied in page data.

- [ ] **Step 6: Run runtime and full tests**

Run:

```powershell
node --test tests/runtime-contract.test.mjs
npm test
```

Expected: all tests pass.

- [ ] **Step 7: Commit multi-page reading state**

```powershell
git add assets/app.js templates/shell.mjs tests/runtime-contract.test.mjs
git commit -m "feat: preserve reading state across chapter pages"
```

---

### Task 6: Build Cross-page Search

**Files:**
- Create: `assets/search.js`
- Modify: `scripts/build.mjs`
- Modify: `templates/shell.mjs`
- Modify: `tests/build.test.mjs`

- [ ] **Step 1: Add a failing generated-index test**

```js
test("search index covers every chapter and uses deep links", async () => {
  const entries = JSON.parse(
    await readFile(new URL("../assets/search-index.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(
    new Set(entries.map((entry) => entry.chapterId)),
    new Set(Array.from({ length: 16 }, (_, index) => `chapter-${index}`)),
  );
  assert.ok(entries.every((entry) => /^chapters\/.+\\.html#.+/.test(entry.href)));
});
```

- [ ] **Step 2: Generate stable section IDs**

During the build, require every chapter `<h3>` to have an ID. When the migrated source lacks
one, generate `section-${chapter.number}-${sequence}` and write it only to output, not back to
authoring source.

- [ ] **Step 3: Implement bounded search**

`assets/search.js` must:

- Fetch the correctly prefixed `assets/search-index.json`.
- Normalize Korean/English text with NFKC and lowercasing.
- Require at least two characters.
- Rank exact heading matches above keyword and body matches.
- Return at most twenty results.
- Resolve home-relative search URLs on chapter/reference pages.
- Show a clear offline/error message if the index cannot load.

Ranking:

```js
const scoreEntry = (entry, tokens) =>
  tokens.reduce((score, token) => {
    if (entry.sectionTitleNormalized === token) return score + 12;
    if (entry.sectionTitleNormalized.includes(token)) return score + 8;
    if (entry.chapterTitleNormalized.includes(token)) return score + 6;
    if (entry.keywordsNormalized.includes(token)) return score + 4;
    if (entry.textNormalized.includes(token)) return score + 1;
    return score;
  }, 0);
```

- [ ] **Step 4: Verify search links**

Run:

```powershell
npm run build
node --test tests/build.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit search**

```powershell
git add assets/search.js assets/search-index.json scripts/build.mjs templates/shell.mjs tests/build.test.mjs
git commit -m "feat: add cross-page guide search"
```

---

### Task 7: Recompose Chapter 14 to Match the Approved Visual Target

**Files:**
- Modify: `content/chapters/14-probing-and-measurement.html`
- Create: `assets/images/probe-ground-comparison-editorial.webp`
- Modify: `content/guide.json`
- Modify: `assets/styles.css`
- Modify: `tests/visual-media.test.mjs`

- [ ] **Step 1: Add the reference-chapter media test**

```js
test("chapter 14 leads with a static probe comparison before controls", async () => {
  const html = await readFile(
    new URL("../chapters/14-probing-and-measurement.html", import.meta.url),
    "utf8",
  );
  const plate = html.indexOf("probe-ground-comparison-editorial.webp");
  const interactive = html.indexOf('data-visualization="probe-ringing"');
  assert.ok(plate >= 0);
  assert.ok(interactive >= 0);
  assert.ok(plate < interactive);
  assert.match(html, /긴 접지선 → 큰 루프 인덕턴스 → 공진·링잉 → 잘못된 판정/);
});
```

- [ ] **Step 2: Produce the approved teaching plate as a project asset**

Generate a text-light 16:9 scientific/technical image containing:

- The same PCB test point on both sides.
- A long probe ground lead and visibly large loop.
- A spring ground and visibly small loop.
- Magnetic-field loop overlays with distinct labels carried in HTML.
- Matching blue/orange ringing waveform regions with no embedded numeric claims.

Save the accepted compressed asset as:

`assets/images/probe-ground-comparison-editorial.webp`

- [ ] **Step 3: Reorder the chapter into the approved learning sequence**

The chapter begins with:

```html
<header class="chapter-header">
  <p class="chapter-kicker">CHAPTER 14 · PROBING &amp; MEASUREMENT</p>
  <h2><span>14</span> 프로브가 파형을 바꾸는 방식</h2>
  <p class="chapter-thesis">
    프로브와 접지선은 회로의 일부다. 의심스러운 링잉이 보이면 DUT보다 먼저
    측정 루프의 인덕턴스와 대역폭을 확인한다.
  </p>
</header>
```

Then render, in order:

1. Static comparison plate.
2. `V = L · di/dt` equation with symbol definitions.
3. Causal chain.
4. Intuition and physical principle.
5. Correct setup checklist.
6. Failure symptoms.
7. Existing quantitative probe-ringing plot.
8. Probe types, loading, CMRR, safety, worked example, misconception, and self-check.

- [ ] **Step 4: Add right-rail metadata**

Add chapter metadata:

```json
{
  "keyTerms": [
    { "term": "루프 인덕턴스 L", "definition": "전류 귀환 루프의 면적과 경로가 만드는 기생 인덕턴스." },
    { "term": "프로브 로딩", "definition": "프로브 입력 R·C·L이 DUT의 동작점과 파형을 바꾸는 현상." }
  ],
  "benchCheck": [
    "스프링 접지 또는 매우 짧은 ground 접속",
    "probe tip과 return을 test point에 근접 배치",
    "대역폭 제한 전후 파형 비교",
    "동일 신호를 다른 접지 방식으로 반복 측정",
    "probe와 scope의 common-mode 및 안전 정격 확인"
  ]
}
```

- [ ] **Step 5: Rebuild and pass visual tests**

Run:

```powershell
npm run build
node --test tests/visual-media.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit the reference chapter**

```powershell
git add content/chapters/14-probing-and-measurement.html content/guide.json assets/images/probe-ground-comparison-editorial.webp assets/styles.css chapters/14-probing-and-measurement.html tests/visual-media.test.mjs
git commit -m "feat: redesign probing chapter as editorial field guide"
```

---

### Task 8: Make Every Migrated Chapter Complete and Navigable

**Files:**
- Modify: `content/chapters/*.html`
- Modify: `content/guide.json`
- Modify: `tests/build.test.mjs`
- Generated: `chapters/*.html`

- [ ] **Step 1: Add required-block validation**

For every chapter, require:

```js
const requiredClasses = [
  "chapter-header",
  "chapter-thesis",
  "intuition",
  "equation",
  "pcb-bridge",
  "measurement-note",
  "worked-example",
  "misconception",
  "self-check",
];
```

The test reports the chapter slug and missing class.

- [ ] **Step 2: Normalize chapter headers**

Replace each migrated kicker/title/lead group with:

```html
<header class="chapter-header">
  <p class="chapter-kicker">CHAPTER NN · PART LABEL</p>
  <h2><span>NN</span> CHAPTER TITLE</h2>
  <p class="chapter-thesis">EXISTING LEAD, EXPANDED INTO A PHYSICAL THESIS.</p>
</header>
```

Use each chapter's real number, part label, title, and existing lead. The thesis must state a
physical relation, not a marketing promise.

- [ ] **Step 3: Add initial key terms and sources to metadata**

For every chapter, add:

- Four to eight searchable keywords.
- Two to four `keyTerms`.
- At least two source entries with title, organization/author, URL, and source type.

Use only sources already present in the current guide or verified official/open sources from the
approved design specification.

- [ ] **Step 4: Validate previous/next and navigation links**

Add a test that resolves every local `href` in generated HTML against the repository and checks
that each target file exists. Check that chapter 00 has no previous link, chapter 15 has no next
link, and all intermediate chapters have both.

- [ ] **Step 5: Rebuild and run the full suite**

Run:

```powershell
npm run build
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit the complete migrated edition**

```powershell
git add content/chapters content/guide.json chapters tests/build.test.mjs
git commit -m "content: normalize all chapter reading flows"
```

---

### Task 9: Browser QA, Documentation, and Pages-ready Checkpoint

**Files:**
- Modify: `README.md`
- Modify: `QA.md`
- Modify: `docs/superpowers/plans/2026-07-27-multipage-foundation.md`

- [ ] **Step 1: Document authoring and build commands**

README must include:

```powershell
npm run build
npm test
python -m http.server 8766
```

Explain that `content/` and `templates/` are authoring sources while root HTML directories are
generated and committed for GitHub Pages.

- [ ] **Step 2: Run the final automated verification**

Run:

```powershell
npm run check
git diff --check
git status -sb
```

Expected:

- Build succeeds.
- All tests pass.
- No whitespace errors.
- Only intended QA/documentation changes remain before the final commit.

- [ ] **Step 3: Verify desktop flow in the in-app browser**

At 1536 × 1024, verify:

1. Home hierarchy and all five part groups.
2. Chapter 14 matches the approved target's layout and figure priority.
3. Left navigation and right context rail remain usable.
4. Completion changes `0/16` to `1/16` and persists after reload.
5. Search reaches a deep section on another chapter page.
6. Previous/next navigation works.
7. No console errors.

- [ ] **Step 4: Verify responsive and accessible states**

At 834 × 1194 and 390 × 844:

- Navigation drawer opens, traps no focus, and closes.
- Right-rail content moves into reading order.
- Comparison figures do not crop labels.
- No page-wide horizontal scrolling.
- Text remains readable at default and +20% scale.
- Reduced-motion mode keeps figures understandable.

- [ ] **Step 5: Compare against the approved target**

Capture the implementation at 1536 × 1024. Combine it with
`docs/design/2026-07-27-approved-chapter-layout.png` and inspect:

- Column proportions.
- Chapter-title weight and scale.
- Body line length.
- Plate dominance.
- Right-rail density.
- Borders, radii, whitespace, and caption size.

Fix visible mismatches before recording QA as passed.

- [ ] **Step 6: Record QA**

Update `QA.md` with:

- Date and commit under test.
- Automated test count.
- Desktop/tablet/mobile viewport results.
- Search, progress, theme, font, drawer, Canvas, and Three.js checks.
- Known limitations: content-expansion and new-visual plans remain.

- [ ] **Step 7: Mark plan tasks complete and commit**

```powershell
git add README.md QA.md docs/superpowers/plans/2026-07-27-multipage-foundation.md
git commit -m "docs: record multipage foundation verification"
```

- [ ] **Step 8: Push and verify GitHub Pages only after all checks pass**

```powershell
git push origin main
gh run list --repo wooLearning/HW_Guide --limit 3
```

Wait for the Pages workflow for the pushed commit, then verify the live home, Chapter 14,
search, completion, and a cross-chapter navigation path.

---

## Follow-on Plan 1: Source-backed Content Expansion

Create `docs/superpowers/plans/2026-07-27-content-expansion.md` after Task 9. It will deepen
the sixteen chapters part-by-part, add worked examples and derivations, and enforce section-level
citations using the source framework in the approved design specification.

## Follow-on Plan 2: Scientific Visual Overhaul

Create `docs/superpowers/plans/2026-07-27-scientific-visuals.md` after the content plan. It
will produce the concept-1-style electromagnetic, transmission-line, PDN, and EMC plates;
retain only the six quantitative interactions named in the specification; and validate static,
Canvas, Three.js, print, reduced-motion, and fallback states.
