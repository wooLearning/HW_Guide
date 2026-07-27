export const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export const assetPrefixFor = (pageKind) =>
  pageKind === "home" ? "" : "../";

const safeJson = (value) =>
  JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e");

const renderHeader = (prefix) => `
  <a class="skip-link" href="#main-content">본문으로 건너뛰기</a>
  <div class="reading-progress" aria-hidden="true"><span data-reading-progress></span></div>
  <header class="site-header">
    <a class="site-mark" href="${prefix}index.html" aria-label="가이드 홈">
      <span>HW</span>
      <strong>Design &amp; Validation</strong>
    </a>
    <div class="site-tools" aria-label="읽기 도구">
      <button class="tool-button menu-button" type="button" data-menu-toggle aria-expanded="false">
        목차
      </button>
      <button class="tool-button" type="button" data-search-open>검색 <kbd>/</kbd></button>
      <div class="type-controls" aria-label="글자 크기">
        <button type="button" data-font-step="-1" aria-label="글자 작게">A−</button>
        <button type="button" data-font-step="1" aria-label="글자 크게">A+</button>
      </div>
      <button class="tool-button" type="button" data-theme-toggle aria-label="다크 모드 켜기">명암</button>
      <button class="completion-count" type="button" data-completion-count aria-label="학습 완료 수">0/16</button>
    </div>
  </header>`;

const renderSearchDialog = () => `
  <dialog class="search-dialog" id="search-dialog" aria-labelledby="search-title">
    <div class="search-dialog-head">
      <div>
        <p class="eyebrow">SEARCH THE GUIDE</p>
        <h2 id="search-title">개념 찾기</h2>
      </div>
      <button class="tool-button" type="button" data-search-close aria-label="검색 닫기">닫기</button>
    </div>
    <label class="search-field" for="book-search">
      <span class="sr-only">검색어</span>
      <input type="search" id="book-search" autocomplete="off"
        placeholder="예: 반사계수, 리턴 전류, 프로브 로딩">
    </label>
    <p class="search-hint">두 글자 이상 입력하세요. 제목·핵심어·본문을 함께 검색합니다.</p>
    <div id="search-results" class="search-results" aria-live="polite"></div>
  </dialog>`;

export const renderShell = ({
  pageKind,
  title,
  description,
  body,
  pageData = {},
}) => {
  const prefix = assetPrefixFor(pageKind);
  return `<!doctype html>
<html lang="ko" data-theme="light">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="theme-color" content="#fffefa">
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="${prefix}assets/styles.css?v=20260727-1">
    <script defer src="${prefix}assets/calculators.js"></script>
    <script defer src="${prefix}assets/visualizations.js"></script>
    <script type="module" src="${prefix}assets/three-scenes.js"></script>
    <script defer src="${prefix}assets/search.js"></script>
    <script defer src="${prefix}assets/app.js?v=20260727-1"></script>
  </head>
  <body data-page-kind="${escapeHtml(pageKind)}">
    ${renderHeader(prefix)}
    ${body}
    ${renderSearchDialog()}
    <script id="guide-page-data" type="application/json">${safeJson({
      ...pageData,
      assetPrefix: prefix,
    })}</script>
  </body>
</html>
`;
};
