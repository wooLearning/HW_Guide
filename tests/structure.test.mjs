import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const appSource = await readFile(new URL("../assets/app.js", import.meta.url), "utf8");
const styles = await readFile(new URL("../assets/styles.css", import.meta.url), "utf8");

test("book exposes sixteen numbered chapters in order", () => {
  const ids = [...html.matchAll(/<section[^>]+id="chapter-(\d+)"/g)].map((match) =>
    Number(match[1]),
  );
  assert.deepEqual(ids, Array.from({ length: 16 }, (_, index) => index));
});

test("book has the core reading landmarks", () => {
  assert.match(html, /<nav[^>]+aria-label="주요 목차"/);
  assert.match(html, /<main[^>]+id="book"/);
  assert.match(html, /<a[^>]+class="skip-link"[^>]+href="#book"/);
});

test("book references only local runtime assets", () => {
  assert.match(html, /href="assets\/styles\.css"/);
  assert.match(html, /src="assets\/calculators\.js"/);
  assert.match(html, /src="assets\/visualizations\.js"/);
  assert.match(html, /src="assets\/app\.js"/);
  assert.doesNotMatch(html, /(?:src|href)="https?:\/\/[^"']+\.(?:js|css)(?:\?[^"']*)?"/);
});

test("reading tools expose accessible controls", () => {
  assert.match(html, /<button[^>]+data-menu-toggle/);
  assert.match(html, /<button[^>]+data-search-open/);
  assert.match(html, /<button[^>]+data-theme-toggle/);
  assert.match(html, /<button[^>]+data-font-step="-1"/);
  assert.match(html, /<button[^>]+data-font-step="1"/);
  assert.match(html, /<span[^>]+data-reading-progress/);
  assert.match(html, /<span[^>]+data-completion-count/);
});

test("search dialog has a labeled field, results, and close control", () => {
  assert.match(html, /<dialog[^>]+id="search-dialog"/);
  assert.match(html, /<input[^>]+type="search"[^>]+id="book-search"/);
  assert.match(html, /<div[^>]+id="search-results"[^>]+aria-live="polite"/);
  assert.match(html, /<button[^>]+data-search-close/);
});

test("every chapter has a matching table-of-contents link", () => {
  for (let index = 0; index < 16; index += 1) {
    assert.match(html, new RegExp(`href="#chapter-${index}"`));
  }
});

test("book includes a dedicated references section", () => {
  assert.match(html, /<section[^>]+id="references"/);
});

const requiredChapterBlocks = [
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
    const chapterPattern = new RegExp(
      `<section class="chapter" id="chapter-${index}"[\\s\\S]*?<\\/section>`,
    );
    const chapter = html.match(chapterPattern)?.[0] ?? "";
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
    const chapterPattern = new RegExp(
      `<section class="chapter" id="chapter-${index}"[\\s\\S]*?<\\/section>`,
    );
    const chapter = html.match(chapterPattern)?.[0] ?? "";
    const plainText = chapter.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    assert.ok(
      plainText.length >= 1400,
      `chapter-${index} has only ${plainText.length} text characters`,
    );
  }
});

test("book reserves at least twelve interactive visualization mounts", () => {
  const mounts = [...html.matchAll(/data-visualization="[^"]+"/g)];
  assert.ok(mounts.length >= 12, `found only ${mounts.length} visualization mounts`);
});

test("appendices include formula sheet, learning routes, and printable checklists", () => {
  assert.match(html, /class="[^"]*\bformula-sheet\b/);
  assert.ok(
    [...html.matchAll(/class="[^"]*\blearning-route\b/g)].length >= 2,
    "expected both compact and deep learning routes",
  );
  assert.ok(
    [...html.matchAll(/class="[^"]*\bprint-checklist\b/g)].length >= 4,
    "expected multiple printable engineering checklists",
  );
});

test("glossary contains at least eighty bilingual terms", () => {
  const terms = [...html.matchAll(/class="[^"]*\bglossary-term\b/g)];
  assert.ok(terms.length >= 80, `found only ${terms.length} glossary terms`);
});

test("source trail contains at least fifteen entries", () => {
  const sources = [...html.matchAll(/class="[^"]*\bsource-entry\b/g)];
  assert.ok(sources.length >= 15, `found only ${sources.length} source entries`);
});

test("source trail uses verified canonical technical references", () => {
  assert.match(html, /standards\.ieee\.org\/ieee\/370\/6165\//);
  assert.match(html, /ti\.com\/lit\/an\/scaa082\/scaa082\.pdf/);
  assert.match(html, /Oscilloscope-Fundamentals_bro_en_3608-2720-62_v0200\.pdf/);
});

test("reading completion state is persisted and rendered per chapter", () => {
  assert.match(appSource, /hw-guide-completed/);
  assert.match(appSource, /data-chapter-complete/);
  assert.match(appSource, /aria-pressed/);
});

test("print mode removes controls that do not belong on paper", () => {
  assert.match(styles, /@media print[\s\S]*?\.interactive-controls[\s\S]*?display:\s*none/);
  assert.match(styles, /@media print[\s\S]*?\.chapter-completion[\s\S]*?display:\s*none/);
});

test("visual system uses a neutral Apple-style palette", () => {
  assert.match(styles, /--paper:\s*#f5f5f7/i);
  assert.match(styles, /--ink:\s*#1d1d1f/i);
  assert.match(styles, /--accent:\s*#0071e3/i);
  assert.doesNotMatch(styles, /--copper:/);
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
