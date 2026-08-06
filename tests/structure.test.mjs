import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const appSource = await readFile(new URL("../assets/app.js", import.meta.url), "utf8");
const styles = await readFile(new URL("../assets/styles.css", import.meta.url), "utf8");
const chapterDirectory = new URL("../chapters/", import.meta.url);
const chapterFiles = (await readdir(chapterDirectory))
  .filter((name) => name.endsWith(".html"))
  .sort();
const chapterHtml = await Promise.all(
  chapterFiles.map((name) => readFile(new URL(name, chapterDirectory), "utf8")),
);
const allChapterHtml = chapterHtml.join("\n");
const referenceDirectory = new URL("../reference/", import.meta.url);
const referenceFiles = (await readdir(referenceDirectory))
  .filter((name) => name.endsWith(".html"))
  .sort();
const referenceHtml = await Promise.all(
  referenceFiles.map((name) => readFile(new URL(name, referenceDirectory), "utf8")),
);
const allReferenceHtml = referenceHtml.join("\n");
const allPagesHtml = [html, allChapterHtml, allReferenceHtml].join("\n");

test("book exposes sixteen numbered chapters in order", () => {
  const ids = [...allChapterHtml.matchAll(/<section[^>]+id="chapter-(\d+)"/g)].map((match) =>
    Number(match[1]),
  );
  assert.deepEqual(ids, Array.from({ length: 16 }, (_, index) => index));
});

test("book has the core reading landmarks", () => {
  assert.match(allChapterHtml, /<nav[^>]+aria-label="주요 목차"/);
  assert.match(allChapterHtml, /<main[^>]+class="reading-column"[^>]+id="main-content"/);
  assert.match(allChapterHtml, /<a[^>]+class="skip-link"[^>]+href="#main-content"/);
});

test("book references only local runtime assets", () => {
  assert.match(html, /href="assets\/styles\.css\?v=[^"]+"/);
  assert.match(allChapterHtml, /src="\.\.\/assets\/calculators\.js"/);
  assert.match(allChapterHtml, /src="\.\.\/assets\/visualizations\.js"/);
  assert.match(allChapterHtml, /src="\.\.\/assets\/app\.js\?v=[^"]+"/);
  assert.doesNotMatch(allPagesHtml, /(?:src|href)="https?:\/\/[^"']+\.(?:js|css)(?:\?[^"']*)?"/);
});

test("reading tools expose accessible controls", () => {
  assert.match(html, /<button[^>]+data-menu-toggle/);
  assert.match(html, /<button[^>]+data-search-open/);
  assert.match(html, /<button[^>]+data-theme-toggle/);
  assert.match(html, /<button[^>]+data-font-step="-1"/);
  assert.match(html, /<button[^>]+data-font-step="1"/);
  assert.match(html, /<span[^>]+data-reading-progress/);
  assert.match(html, /<button[^>]+data-completion-count/);
});

test("search dialog has a labeled field, results, and close control", () => {
  assert.match(html, /<dialog[^>]+id="search-dialog"/);
  assert.match(html, /<input[^>]+type="search"[^>]+id="book-search"/);
  assert.match(html, /<div[^>]+id="search-results"[^>]+aria-live="polite"/);
  assert.match(html, /<button[^>]+data-search-close/);
});

test("every chapter has a matching table-of-contents link", () => {
  for (let index = 0; index < 16; index += 1) {
    assert.match(html, new RegExp(`data-chapter-link="chapter-${index}"`));
    assert.match(allChapterHtml, new RegExp(`data-chapter-link="chapter-${index}"`));
  }
});

test("book includes a dedicated references section", () => {
  assert.match(allReferenceHtml, /id="references-title"/);
});

const requiredChapterBlocks = [
  "chapter-header",
  "chapter-thesis",
  "intuition",
  "equation",
  "pcb-bridge",
  "measurement-note",
  "misconception",
  "worked-example",
  "self-check",
];

test("every chapter follows the full learning template", () => {
  for (let index = 0; index < 16; index += 1) {
    const chapter = chapterHtml[index] ?? "";
    for (const block of requiredChapterBlocks) {
      assert.match(
        chapter,
        new RegExp(`class="[^"]*\\b${block}\\b`),
        `chapter-${index} is missing .${block}`,
      );
    }
  }
});

test("every chapter contains substantial explanatory text", () => {
  for (let index = 0; index < 16; index += 1) {
    const chapter = chapterHtml[index] ?? "";
    const plainText = chapter.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    assert.ok(
      plainText.length >= 1400,
      `chapter-${index} has only ${plainText.length} text characters`,
    );
  }
});

test("book reserves at least twelve interactive visualization mounts", () => {
  const mounts = [...allChapterHtml.matchAll(/data-visualization="[^"]+"/g)];
  assert.ok(mounts.length >= 12, `found only ${mounts.length} visualization mounts`);
});

test("appendices include formula sheet, learning routes, and printable checklists", () => {
  assert.match(allReferenceHtml, /class="[^"]*\bformula-sheet\b/);
  assert.ok(
    [...html.matchAll(/class="[^"]*\blearning-route\b/g)].length >= 2,
    "expected both compact and deep learning routes",
  );
  assert.ok(
    [...allReferenceHtml.matchAll(/class="[^"]*\bprint-checklist\b/g)].length >= 4,
    "expected multiple printable engineering checklists",
  );
});

test("glossary contains at least eighty bilingual terms", () => {
  const terms = [...allReferenceHtml.matchAll(/class="[^"]*\bglossary-term\b/g)];
  assert.ok(terms.length >= 80, `found only ${terms.length} glossary terms`);
});

test("source trail contains at least fifteen entries", () => {
  const sources = [...allReferenceHtml.matchAll(/class="[^"]*\bsource-entry\b/g)];
  assert.ok(sources.length >= 15, `found only ${sources.length} source entries`);
});

test("source trail uses verified canonical technical references", () => {
  assert.match(allReferenceHtml, /standards\.ieee\.org\/ieee\/370\/6165\//);
  assert.match(allReferenceHtml, /ti\.com\/lit\/an\/scaa082\/scaa082\.pdf/);
  assert.match(allReferenceHtml, /Oscilloscope-Fundamentals_bro_en_3608-2720-62_v0200\.pdf/);
});

test("reading completion state is persisted and rendered per chapter", () => {
  assert.match(appSource, /hw-guide-completed/);
  assert.match(appSource, /data-chapter-complete/);
  assert.match(appSource, /aria-pressed/);
});

test("header completion count toggles the currently visible chapter", () => {
  assert.match(appSource, /completionCount\?\.addEventListener\("click"/);
  assert.match(appSource, /toggleChapterCompletion\(pageData\.chapterId\)/);
});

test("print mode removes controls that do not belong on paper", () => {
  assert.match(styles, /@media print[\s\S]*?\.interactive-controls[\s\S]*?display:\s*none/);
  assert.match(styles, /@media print[\s\S]*?\.chapter-completion[\s\S]*?display:\s*none/);
});

test("visual system uses a neutral Apple-style palette", () => {
  assert.match(styles, /--paper:\s*#fffefa/i);
  assert.match(styles, /--ink:\s*#16171a/i);
  assert.match(styles, /--blue:\s*#075fda/i);
  assert.match(styles, /--copper:\s*#b96831/i);
});

test("explanatory cards do not use colored vertical rules", () => {
  const cardRules = [
    ...styles.matchAll(
      /\.(?:example-card|bridge-card|note-card|warning-card)[^{]*\{([^}]*)\}/g,
    ),
  ].map((match) => match[1]).join("\n");
  assert.doesNotMatch(cardRules, /border-left/);
  assert.match(cardRules, /border:\s*1px solid var\(--line\)/);
  assert.match(cardRules, /border-radius:\s*(?:1rem|16px|18px|20px)/);
});

test("reading system self-hosts Korean sans and serif fonts", () => {
  assert.match(styles, /font-family:\s*"Pretendard Variable"/);
  assert.match(styles, /font-family:\s*"Noto Serif KR"/);
  assert.match(styles, /url\("fonts\/pretendard-variable\.woff2"\)/);
  assert.match(styles, /url\("fonts\/noto-serif-kr-semibold\.woff2"\)/);
});

test("body and captions meet the new readable type floor", () => {
  assert.match(styles, /--body-size:\s*1\.0625rem/);
  assert.match(styles, /--caption-size:\s*0\.8125rem/);
});

test("guide connects circuit design, artwork, fabrication, SMT, and PCBA release", async () => {
  const [chapter05, chapter08] = await Promise.all([
    readFile(new URL("../chapters/05-real-components.html", import.meta.url), "utf8"),
    readFile(
      new URL("../chapters/08-pcb-materials-stackup-and-vias.html", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(chapter05, /요구사항[\s\S]*블록도[\s\S]*회로도[\s\S]*BOM[\s\S]*layout constraint/);
  assert.match(chapter05, /ERC[^.]*보장하지/);
  assert.match(chapter08, /Bare PCB[\s\S]*SMT[\s\S]*PCBA/);
  assert.match(chapter08, /solder paste[\s\S]*SPI[\s\S]*pick-and-place[\s\S]*reflow[\s\S]*AOI/i);
});
