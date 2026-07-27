import { escapeHtml } from "./shell.mjs";

const chaptersForPart = (guide, partId) =>
  guide.chapters.filter((chapter) => chapter.part === partId);

export const renderChapterNavigation = ({ guide, currentId = "", prefix = "" }) => `
  <aside class="chapter-navigation">
    <div class="navigation-heading">
      <p class="eyebrow">CONTENTS</p>
      <strong>전체 16장</strong>
    </div>
    <nav class="book-nav" aria-label="주요 목차">
      ${guide.parts.map((part) => `
        <section class="nav-part">
          <p><span>${escapeHtml(part.label)}</span>${escapeHtml(part.title)}</p>
          ${chaptersForPart(guide, part.id).map((chapter) => `
            <a
              href="${prefix}chapters/${chapter.slug}.html"
              data-chapter-link="${chapter.id}"
              ${chapter.id === currentId ? 'aria-current="page"' : ""}
            >
              <span>${chapter.number}</span>
              <strong>${escapeHtml(chapter.title)}</strong>
            </a>`).join("")}
        </section>`).join("")}
    </nav>
  </aside>`;
