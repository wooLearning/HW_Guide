import { readFile, writeFile, mkdir, readdir, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { renderHomePage } from "../templates/home.mjs";
import { renderChapterPage } from "../templates/chapter.mjs";
import { renderReferencePage } from "../templates/reference.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");
const write = (relative, value) =>
  writeFile(path.join(root, relative), value.replace(/[ \t]+$/gm, ""), "utf8");

const guide = JSON.parse(await read("content/guide.json"));
const expectedNumbers = Array.from({ length: 16 }, (_, index) =>
  String(index).padStart(2, "0"));

const unique = (values) => new Set(values).size === values.length;
if (guide.chapters.length !== 16) throw new Error("Guide must contain exactly 16 chapters.");
if (!unique(guide.chapters.map(({ id }) => id))) throw new Error("Duplicate chapter ID.");
if (!unique(guide.chapters.map(({ slug }) => slug))) throw new Error("Duplicate chapter slug.");
if (!unique(guide.chapters.map(({ number }) => number))) throw new Error("Duplicate chapter number.");
if (guide.chapters.some((chapter, index) => chapter.number !== expectedNumbers[index])) {
  throw new Error("Chapter numbers must run from 00 through 15 in order.");
}

const stripTags = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const prefixAssets = (html) => html
  .replaceAll('src="assets/', 'src="../assets/')
  .replaceAll('href="assets/', 'href="../assets/');

const addSectionIds = (html, chapter) => {
  let sequence = 0;
  return html.replace(/<h3([^>]*)>([\s\S]*?)<\/h3>/g, (full, attributes, label) => {
    sequence += 1;
    if (/\sid=/.test(attributes)) return full;
    return `<h3${attributes} id="section-${chapter.number}-${sequence}">${label}</h3>`;
  });
};

const buildSearchEntries = (html, chapter) => {
  const entries = [];
  const headings = [...html.matchAll(/<h3[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h3>/g)];
  if (headings.length === 0) {
    entries.push({
      id: `${chapter.id}:${chapter.id}`,
      chapterId: chapter.id,
      chapterNumber: chapter.number,
      chapterTitle: chapter.title,
      sectionTitle: chapter.title,
      href: `chapters/${chapter.slug}.html#${chapter.id}`,
      text: stripTags(html).slice(0, 1200),
      keywords: chapter.keywords ?? [],
    });
    return entries;
  }
  headings.forEach((heading, index) => {
    const start = heading.index + heading[0].length;
    const end = headings[index + 1]?.index ?? html.length;
    const sectionId = heading[1];
    entries.push({
      id: `${chapter.id}:${sectionId}`,
      chapterId: chapter.id,
      chapterNumber: chapter.number,
      chapterTitle: chapter.title,
      sectionTitle: stripTags(heading[2]),
      href: `chapters/${chapter.slug}.html#${sectionId}`,
      text: stripTags(html.slice(start, end)).slice(0, 1200),
      keywords: chapter.keywords ?? [],
    });
  });
  return entries;
};

const cleanGenerated = async (directory, validNames) => {
  await mkdir(path.join(root, directory), { recursive: true });
  const entries = await readdir(path.join(root, directory), { withFileTypes: true });
  await Promise.all(entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html") && !validNames.has(entry.name))
    .map((entry) => unlink(path.join(root, directory, entry.name))));
};

await mkdir(path.join(root, "chapters"), { recursive: true });
await mkdir(path.join(root, "reference"), { recursive: true });

const chapterNames = new Set(guide.chapters.map(({ slug }) => `${slug}.html`));
const referenceDefinitions = [
  { slug: "formulas", number: "A.1", title: "공식·단위 치트시트", description: "식의 가정과 단위를 함께 확인하는 빠른 참조표." },
  { slug: "glossary", number: "A.2", title: "한–영 용어집", description: "PCB 하드웨어 문서와 데이터시트를 읽기 위한 핵심 용어." },
  { slug: "checklists", number: "A.3", title: "설계·측정 체크리스트", description: "설계 검토와 벤치 측정을 빠뜨리지 않기 위한 인쇄용 목록." },
  { slug: "sources", number: "A.4", title: "참고문헌과 검증 기준", description: "설명의 근거와 표준·공식 자료를 추적하는 source trail." },
];
const referenceNames = new Set(referenceDefinitions.map(({ slug }) => `${slug}.html`));
await cleanGenerated("chapters", chapterNames);
await cleanGenerated("reference", referenceNames);

const searchIndex = [];
for (const [index, chapter] of guide.chapters.entries()) {
  const raw = await read(`content/chapters/${chapter.slug}.html`);
  if (!raw.trim()) throw new Error(`Empty chapter fragment: ${chapter.slug}`);
  const content = prefixAssets(addSectionIds(raw, chapter));
  searchIndex.push(...buildSearchEntries(content, chapter));
  await write(`chapters/${chapter.slug}.html`, renderChapterPage({
    guide,
    chapter,
    content,
    previous: guide.chapters[index - 1] ?? null,
    next: guide.chapters[index + 1] ?? null,
  }));
}

for (const reference of referenceDefinitions) {
  const content = prefixAssets(await read(`content/reference/${reference.slug}.html`));
  await write(`reference/${reference.slug}.html`, renderReferencePage({
    guide,
    reference,
    content,
  }));
}

await write("index.html", renderHomePage({
  guide,
  home: await read("content/home.html"),
  learningRoutes: await read("content/home-routes.html"),
}));
await write("assets/search-index.json", `${JSON.stringify(searchIndex, null, 2)}\n`);

console.log(`Built 1 home, ${guide.chapters.length} chapters, ${referenceDefinitions.length} references, and ${searchIndex.length} search entries.`);
