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
  assert.match(app, /chapter-\$\{index\}/);
});

test("completion updates all matching navigation links", () => {
  assert.match(app, /querySelectorAll\("\[data-chapter-link/);
});

test("last opened chapter hydrates the home continue-reading link", () => {
  assert.match(app, /hw-guide-last-chapter/);
  assert.match(app, /data-continue-reading/);
});
