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
