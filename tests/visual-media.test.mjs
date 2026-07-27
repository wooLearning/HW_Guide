import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const chapterDirectory = new URL("../chapters/", import.meta.url);
const chapterFiles = (await readdir(chapterDirectory))
  .filter((name) => name.endsWith(".html"))
  .sort();
const html = (await Promise.all(
  chapterFiles.map((name) => readFile(new URL(name, chapterDirectory), "utf8")),
)).join("\n");
const scenes = await readFile(new URL("../assets/three-scenes.js", import.meta.url), "utf8")
  .catch(() => "");
const threeModule = await readFile(
  new URL("../assets/vendor/three.module.min.js", import.meta.url),
  "utf8",
).catch(() => "");
const threeCore = await readFile(
  new URL("../assets/vendor/three.core.min.js", import.meta.url),
  "utf8",
).catch(() => "");

test("guide contains at least thirty instructional visual blocks", () => {
  const count = [...html.matchAll(/class="[^"]*\bvisual-panel\b/g)].length;
  assert.ok(count >= 30, `found ${count}`);
});

test("guide uses all approved visual media", () => {
  assert.ok([...html.matchAll(/data-visual-medium="imagegen"/g)].length >= 6);
  assert.ok([...html.matchAll(/data-visual-medium="three"/g)].length >= 4);
  assert.ok([...html.matchAll(/data-visual-medium="draw"/g)].length >= 5);
  assert.ok([...html.matchAll(/data-visual-medium="canvas"/g)].length >= 10);
});

test("instructional SVG stages are retired", () => {
  assert.doesNotMatch(html, /class="visual-stage"[\s\S]{0,240}<svg/);
});

test("Three scenes expose fallback and reduced-motion behavior", () => {
  assert.match(scenes, /webgl-fallback/);
  assert.match(scenes, /prefers-reduced-motion/);
  assert.match(scenes, /IntersectionObserver/);
  assert.match(scenes, /camera\.lookAt\(0, 0, 0\)/);
});

test("Three.js is pinned and loaded only from local assets", () => {
  assert.match(scenes, /from "\.\/vendor\/three\.module\.min\.js"/);
  assert.match(threeModule, /from"\.\/three\.core\.min\.js"/);
  assert.match(threeCore, /Three\.js Authors/);
  assert.doesNotMatch(html, /https?:\/\/[^"]*three(?:\.module)?(?:\.min)?\.js/i);
});

test("chapter 14 leads with a static probe comparison before controls", async () => {
  const chapter = await readFile(
    new URL("../chapters/14-probing-and-measurement.html", import.meta.url),
    "utf8",
  );
  const plate = chapter.indexOf("probe-ground-comparison-editorial.webp");
  const interactive = chapter.indexOf('data-visualization="probe-ringing"');
  assert.ok(plate >= 0);
  assert.ok(interactive >= 0);
  assert.ok(plate < interactive);
  assert.match(chapter, /긴 접지선 → 큰 루프 인덕턴스 → 공진·링잉 → 잘못된 판정/);
});
