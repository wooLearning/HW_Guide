import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const search = await readFile(new URL("../assets/search.js", import.meta.url), "utf8");

test("cross-page search loads the generated index using page metadata", () => {
  assert.match(search, /guide-page-data/);
  assert.match(search, /search-index\.json/);
  assert.match(search, /fetch\(/);
});

test("cross-page search normalizes Korean text and bounds results", () => {
  assert.match(search, /\.normalize\("NFKC"\)/);
  assert.match(search, /\.slice\(0,\s*20\)/);
  assert.match(search, /sectionTitleNormalized/);
});

test("cross-page search opens from slash and closes from Escape", () => {
  assert.match(search, /event\.key === "\/"/);
  assert.match(search, /event\.key === "Escape"/);
});
