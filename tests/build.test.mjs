import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";

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

test("search index covers every chapter and uses deep links", async () => {
  const entries = JSON.parse(
    await readFile(new URL("../assets/search-index.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(
    new Set(entries.map((entry) => entry.chapterId)),
    new Set(Array.from({ length: 16 }, (_, index) => `chapter-${index}`)),
  );
  assert.ok(entries.every((entry) => /^chapters\/.+\.html#.+/.test(entry.href)));
});

test("every chapter declares searchable terms, key definitions, and sources", async () => {
  const guide = JSON.parse(
    await readFile(new URL("../content/guide.json", import.meta.url), "utf8"),
  );
  for (const chapter of guide.chapters) {
    assert.ok(chapter.keywords?.length >= 4, `${chapter.slug} needs four keywords`);
    assert.ok(chapter.keyTerms?.length >= 2, `${chapter.slug} needs two key terms`);
    assert.ok(chapter.sources?.length >= 2, `${chapter.slug} needs two sources`);
    assert.ok(
      chapter.sources.every((source) =>
        source.title && source.organization && /^https:\/\//.test(source.url)),
      `${chapter.slug} has incomplete source metadata`,
    );
  }
});

test("generated local links resolve and chapter pager boundaries are correct", async () => {
  const chapterDirectory = new URL("../chapters/", import.meta.url);
  const referenceDirectory = new URL("../reference/", import.meta.url);
  const chapterFiles = (await readdir(chapterDirectory))
    .filter((name) => name.endsWith(".html"))
    .sort();
  const referenceFiles = (await readdir(referenceDirectory))
    .filter((name) => name.endsWith(".html"))
    .sort();
  const pages = [
    new URL("../index.html", import.meta.url),
    ...chapterFiles.map((name) => new URL(name, chapterDirectory)),
    ...referenceFiles.map((name) => new URL(name, referenceDirectory)),
  ];

  for (const page of pages) {
    const source = await readFile(page, "utf8");
    for (const match of source.matchAll(/href="([^"]+)"/g)) {
      const href = match[1];
      if (/^(?:https?:|mailto:|#)/.test(href)) continue;
      await access(new URL(href.split("#")[0], page));
    }
  }

  const first = await readFile(new URL(chapterFiles[0], chapterDirectory), "utf8");
  const middle = await readFile(new URL(chapterFiles[7], chapterDirectory), "utf8");
  const last = await readFile(new URL(chapterFiles.at(-1), chapterDirectory), "utf8");
  assert.doesNotMatch(first, /pager-previous/);
  assert.match(first, /pager-next/);
  assert.match(middle, /pager-previous/);
  assert.match(middle, /pager-next/);
  assert.match(last, /pager-previous/);
  assert.doesNotMatch(last, /pager-next/);
});
