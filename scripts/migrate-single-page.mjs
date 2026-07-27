import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const legacy = await readFile(path.join(root, "legacy/index-single-page.html"), "utf8");
const guide = JSON.parse(await readFile(path.join(root, "content/guide.json"), "utf8"));

const sliceBetween = (startMarker, endMarker) => {
  const start = legacy.indexOf(startMarker);
  if (start < 0) throw new Error(`Missing legacy marker: ${startMarker}`);
  const end = legacy.indexOf(endMarker, start + startMarker.length);
  if (end < 0) throw new Error(`Missing legacy marker: ${endMarker}`);
  return `${legacy.slice(start, end).trim()}\n`;
};

const chapterDirectory = path.join(root, "content/chapters");
const referenceDirectory = path.join(root, "content/reference");
await mkdir(chapterDirectory, { recursive: true });
await mkdir(referenceDirectory, { recursive: true });

for (const [index, chapter] of guide.chapters.entries()) {
  const start = `<section class="chapter" id="${chapter.id}"`;
  const end = index < guide.chapters.length - 1
    ? `<section class="chapter" id="${guide.chapters[index + 1].id}"`
    : `<section id="appendices"`;
  const fragment = sliceBetween(start, end);
  await writeFile(
    path.join(chapterDirectory, `${chapter.slug}.html`),
    fragment,
    "utf8",
  );
}

const extractArticle = (startMarker, endMarker) => {
  const fragment = sliceBetween(startMarker, endMarker)
    .replace(/<article class="([^"]*)"/, '<article class="reference-content $1"');
  return fragment;
};

await writeFile(
  path.join(referenceDirectory, "formulas.html"),
  extractArticle(
    '<article class="appendix-block formula-sheet"',
    '<article class="appendix-block" aria-labelledby="routes-title"',
  ),
  "utf8",
);

await writeFile(
  path.join(referenceDirectory, "checklists.html"),
  extractArticle(
    '<article class="appendix-block" aria-labelledby="checklist-title"',
    '<article class="appendix-block" aria-labelledby="glossary-title"',
  ),
  "utf8",
);

await writeFile(
  path.join(referenceDirectory, "glossary.html"),
  extractArticle(
    '<article class="appendix-block" aria-labelledby="glossary-title"',
    "</section>\n\n        <section id=\"references\"",
  ),
  "utf8",
);

const sources = sliceBetween(
  '<section id="references"',
  "\n      </main>",
)
  .replace(/<section id="references" class="appendix"/, '<article class="reference-content appendix"')
  .replace(/<\/section>\s*$/, "</article>\n");
await writeFile(path.join(referenceDirectory, "sources.html"), sources, "utf8");
