import { renderShell, escapeHtml } from "./shell.mjs";

const routeCards = `
  <section class="learning-paths" aria-labelledby="route-title">
    <div class="section-heading">
      <p class="eyebrow">THREE WAYS IN</p>
      <h2 id="route-title">어디서 시작할까</h2>
    </div>
    <div class="route-grid">
      <article><span>01</span><h3>원리부터</h3><p>00장에서 시작해 회로·장·파동·PCB·측정을 순서대로 연결한다.</p></article>
      <article><span>02</span><h3>PCB 물리부터</h3><p>08장에서 구조를 보고, 06–07장으로 돌아가 원리를 채운다.</p></article>
      <article><span>03</span><h3>벤치에서</h3><p>13–15장으로 측정 습관을 잡고 필요한 이론 장을 역참조한다.</p></article>
    </div>
  </section>`;

export const renderHomePage = ({ guide, home, learningRoutes }) => renderShell({
  pageKind: "home",
  title: `${guide.title} — 한국어 엔지니어링 가이드`,
  description: "회로이론, 전자기학, PCB, SI·PI·EMC, 오실로스코프 측정을 물리 원리부터 연결하는 가이드.",
  pageData: {
    pageKind: "home",
    chapterCount: guide.chapters.length,
    chapters: guide.chapters.map(({ id, slug, number, title }) => ({
      id,
      slug,
      number,
      title,
      href: `chapters/${slug}.html`,
    })),
  },
  body: `
    <main class="home-page" id="main-content">
      ${home}
      <div class="home-actions">
        <a class="primary-action" href="chapters/${guide.chapters[0].slug}.html">처음부터 읽기</a>
        <a class="secondary-action" href="chapters/${guide.chapters[0].slug}.html" data-continue-reading>이어 읽기</a>
      </div>
      <section class="contents-overview" aria-labelledby="contents-title">
        <div class="section-heading">
          <p class="eyebrow">THE COMPLETE MAP</p>
          <h2 id="contents-title">회로에서 검증까지</h2>
          <p>16개 장을 여섯 개의 물리적 관점으로 묶었다. 제목을 눌러 독립된 읽기 페이지로 이동한다.</p>
        </div>
        ${guide.parts.map((part) => `
          <section class="part-group">
            <header>
              <p>${escapeHtml(part.label)}</p>
              <h3>${escapeHtml(part.title)}</h3>
            </header>
            <div class="chapter-card-grid">
              ${guide.chapters.filter((chapter) => chapter.part === part.id).map((chapter) => `
                <a class="chapter-card" href="chapters/${chapter.slug}.html" data-chapter-link="${chapter.id}">
                  <span>${chapter.number}</span>
                  <div><h4>${escapeHtml(chapter.title)}</h4><p>${escapeHtml(chapter.lead)}</p></div>
                </a>`).join("")}
            </div>
          </section>`).join("")}
      </section>
      ${routeCards}
      ${learningRoutes}
      <section class="reference-links" aria-labelledby="reference-title">
        <div><p class="eyebrow">REFERENCE DESK</p><h2 id="reference-title">막힐 때 돌아오는 곳</h2></div>
        <nav aria-label="참조 자료">
          <a href="reference/formulas.html"><span>A.1</span> 공식·단위</a>
          <a href="reference/glossary.html"><span>A.2</span> 한–영 용어집</a>
          <a href="reference/checklists.html"><span>A.3</span> 체크리스트</a>
          <a href="reference/sources.html"><span>A.4</span> 출처·검증</a>
        </nav>
      </section>
    </main>`,
});
