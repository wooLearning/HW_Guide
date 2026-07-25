import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const code = await readFile(
  new URL("../assets/visualizations.js", import.meta.url),
  "utf8",
);
const context = { globalThis: {} };
vm.runInNewContext(code, context);

test("every declared visualization has a renderer route", () => {
  const declared = [
    ...html.matchAll(/data-visualization="([^"]+)"/g),
  ].map((match) => match[1]);
  const uniqueDeclared = [...new Set(declared)].sort();
  const registered = [...context.globalThis.HWVisualizationNames].sort();
  assert.deepEqual(registered, uniqueDeclared);
});

test("guide includes multiple explanatory visual modes", () => {
  const names = context.globalThis.HWVisualizationNames;
  assert.ok(names.length >= 16);
  assert.ok(names.includes("transmission-reflection"));
  assert.ok(names.includes("pdn-impedance"));
  assert.ok(names.includes("probe-ringing"));
  assert.ok(names.includes("bringup-flow"));
});
