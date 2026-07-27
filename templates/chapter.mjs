import { renderShell, escapeHtml } from "./shell.mjs";
import { renderChapterNavigation } from "./navigation.mjs";

const renderPagerLink = (chapter, direction) => chapter ? `
  <a class="pager-link pager-${direction}" href="${chapter.slug}.html">
    <span>${direction === "previous" ? "이전 장" : "다음 장"}</span>
    <strong>${chapter.number} · ${escapeHtml(chapter.title)}</strong>
  </a>` : "<span></span>";

const renderPager = (previous, next) => `
  <nav class="chapter-pager" aria-label="장 이동">
    ${renderPagerLink(previous, "previous")}
    ${renderPagerLink(next, "next")}
  </nav>`;

const renderKeyTerms = (chapter) => chapter.keyTerms?.length
  ? `<dl>${chapter.keyTerms.map(({ term, definition }) =>
      `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(definition)}</dd></div>`).join("")}</dl>`
  : "<p>핵심 정의는 본문과 함께 정리됩니다.</p>";

const renderContextRail = (chapter) => `
  <aside class="context-rail" aria-label="현재 장 정보">
    <section class="rail-current">
      <p class="eyebrow">NOW READING</p>
      <strong>${chapter.number}</strong>
      <h2>${escapeHtml(chapter.title)}</h2>
      <button type="button" class="chapter-complete-button"
        data-chapter-complete="${chapter.id}" aria-pressed="false">이 장을 학습 완료로 표시</button>
    </section>
    <section>
      <p class="rail-label">KEY TERMS</p>
      ${renderKeyTerms(chapter)}
    </section>
    ${chapter.benchCheck?.length ? `
      <section class="rail-bench-check">
        <p class="rail-label">BENCH CHECK</p>
        <ul>${chapter.benchCheck.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </section>` : ""}
    <section>
      <p class="rail-label">SOURCE CHECK</p>
      ${chapter.sources?.length
        ? chapter.sources.map((source) => `
          <a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">
            ${escapeHtml(source.organization)} · ${escapeHtml(source.title)}
          </a>`).join("")
        : '<a href="../reference/sources.html">전체 참고문헌과 검증 원칙 보기</a>'}
    </section>
  </aside>`;

export const renderChapterPage = ({
  guide,
  chapter,
  content,
  previous,
  next,
}) => renderShell({
  pageKind: "chapter",
  title: `${chapter.number} ${chapter.title} — ${guide.title}`,
  description: chapter.lead,
  pageData: {
    pageKind: "chapter",
    chapterId: chapter.id,
    chapterCount: guide.chapters.length,
    chapterSlug: chapter.slug,
  },
  body: `
    <div class="site-grid" data-chapter-id="${chapter.id}">
      ${renderChapterNavigation({ guide, currentId: chapter.id, prefix: "../" })}
      <main class="reading-column" id="main-content">
        ${content}
        ${renderPager(previous, next)}
      </main>
      ${renderContextRail(chapter)}
    </div>`,
});
