import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const guide = JSON.parse(
  await readFile(path.join(root, "content/guide.json"), "utf8"),
);
const partById = new Map(guide.parts.map((part) => [part.id, part]));

const headerPattern =
  /(<section class="chapter"[^>]*>\s*)<p class="chapter-kicker">[\s\S]*?<\/p>\s*<h2>[\s\S]*?<\/h2>\s*<p class="chapter-lead">[\s\S]*?<\/p>/;

for (const chapter of guide.chapters) {
  const file = path.join(root, "content/chapters", `${chapter.slug}.html`);
  const source = await readFile(file, "utf8");
  if (source.includes('class="chapter-header"')) continue;
  const part = partById.get(chapter.part);
  if (!part) throw new Error(`Unknown part for ${chapter.slug}: ${chapter.part}`);
  const header = `$1<header class="chapter-header">
            <p class="chapter-kicker">CHAPTER ${chapter.number} · ${part.label.toUpperCase()}</p>
            <h2><span>${chapter.number}</span> ${chapter.title}</h2>
            <p class="chapter-thesis">${chapter.lead}</p>
          </header>`;
  const normalized = source.replace(headerPattern, header);
  if (normalized === source) throw new Error(`Could not normalize ${chapter.slug}`);
  await writeFile(file, normalized, "utf8");
}
