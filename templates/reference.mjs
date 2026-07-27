import { renderShell, escapeHtml } from "./shell.mjs";
import { renderChapterNavigation } from "./navigation.mjs";

export const renderReferencePage = ({ guide, reference, content }) => renderShell({
  pageKind: "reference",
  title: `${reference.title} — ${guide.title}`,
  description: reference.description,
  pageData: {
    pageKind: "reference",
    chapterCount: guide.chapters.length,
  },
  body: `
    <div class="site-grid reference-grid">
      ${renderChapterNavigation({ guide, prefix: "../" })}
      <main class="reading-column reference-page" id="main-content">
        <header class="reference-header">
          <p class="chapter-kicker">REFERENCE · ${escapeHtml(reference.number)}</p>
          <h1>${escapeHtml(reference.title)}</h1>
          <p>${escapeHtml(reference.description)}</p>
        </header>
        ${content}
      </main>
      <aside class="context-rail reference-rail">
        <p class="eyebrow">REFERENCE DESK</p>
        <nav aria-label="참조 자료">
          <a href="formulas.html">공식·단위</a>
          <a href="glossary.html">한–영 용어집</a>
          <a href="checklists.html">체크리스트</a>
          <a href="sources.html">출처·검증</a>
        </nav>
      </aside>
    </div>`,
});
