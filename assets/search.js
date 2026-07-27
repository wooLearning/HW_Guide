"use strict";

(() => {
  const dialog = document.querySelector("#search-dialog");
  const input = document.querySelector("#book-search");
  const results = document.querySelector("#search-results");
  if (!dialog || !input || !results) return;

  const readPageData = () => {
    const node = document.querySelector("#guide-page-data");
    if (!node) return { assetPrefix: "" };
    try {
      const parsed = JSON.parse(node.textContent ?? "{}");
      return {
        assetPrefix: typeof parsed.assetPrefix === "string"
          ? parsed.assetPrefix
          : "",
      };
    } catch {
      return { assetPrefix: "" };
    }
  };

  const { assetPrefix } = readPageData();
  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFKC")
      .toLocaleLowerCase("ko")
      .replace(/\s+/g, " ")
      .trim();

  let searchEntries = [];
  let loadError = null;

  const prepareEntry = (entry) => ({
    ...entry,
    sectionTitleNormalized: normalize(entry.sectionTitle),
    chapterTitleNormalized: normalize(entry.chapterTitle),
    keywordsNormalized: normalize((entry.keywords ?? []).join(" ")),
    textNormalized: normalize(entry.text),
  });

  const indexPromise = fetch(`${assetPrefix}assets/search-index.json`)
    .then((response) => {
      if (!response.ok) throw new Error(`Search index returned ${response.status}`);
      return response.json();
    })
    .then((entries) => {
      searchEntries = Array.isArray(entries) ? entries.map(prepareEntry) : [];
      return searchEntries;
    })
    .catch((error) => {
      loadError = error;
      return [];
    });

  const scoreEntry = (entry, tokens) =>
    tokens.reduce((score, token) => {
      if (entry.sectionTitleNormalized === token) return score + 12;
      if (entry.sectionTitleNormalized.includes(token)) return score + 8;
      if (entry.chapterTitleNormalized.includes(token)) return score + 6;
      if (entry.keywordsNormalized.includes(token)) return score + 4;
      if (entry.textNormalized.includes(token)) return score + 1;
      return score;
    }, 0);

  const renderMessage = (message, className = "search-empty") => {
    results.replaceChildren();
    const paragraph = document.createElement("p");
    paragraph.className = className;
    paragraph.textContent = message;
    results.append(paragraph);
  };

  const excerptFor = (entry, token) => {
    const text = String(entry.text ?? "");
    const normalized = entry.textNormalized;
    const matchIndex = normalized.indexOf(token);
    const start = Math.max(0, matchIndex >= 0 ? matchIndex - 48 : 0);
    const end = Math.min(text.length, start + 170);
    return `${start > 0 ? "…" : ""}${text.slice(start, end)}${
      end < text.length ? "…" : ""
    }`;
  };

  const renderSearchResults = (query) => {
    const normalizedQuery = normalize(query);
    if (normalizedQuery.length < 2) {
      renderMessage("두 글자 이상 입력하면 전체 가이드에서 관련 절을 찾습니다.");
      return;
    }
    if (loadError) {
      renderMessage(
        "검색 색인을 불러오지 못했습니다. 네트워크 또는 파일 경로를 확인해 주세요.",
        "search-error",
      );
      return;
    }

    const tokens = normalizedQuery.split(" ").filter(Boolean);
    const ranked = searchEntries
      .map((entry) => ({ entry, score: scoreEntry(entry, tokens) }))
      .filter(({ score }) => score > 0)
      .sort((left, right) =>
        right.score - left.score ||
        left.entry.chapterNumber.localeCompare(right.entry.chapterNumber) ||
        left.entry.sectionTitle.localeCompare(right.entry.sectionTitle, "ko"))
      .slice(0, 20);

    if (ranked.length === 0) {
      renderMessage(`“${query}”와 일치하는 내용을 찾지 못했습니다.`);
      return;
    }

    const fragment = document.createDocumentFragment();
    ranked.forEach(({ entry }) => {
      const link = document.createElement("a");
      link.className = "search-result";
      link.href = `${assetPrefix}${entry.href}`;

      const meta = document.createElement("span");
      meta.className = "search-result-meta";
      meta.textContent = `${entry.chapterNumber} · ${entry.chapterTitle}`;

      const title = document.createElement("strong");
      title.textContent = entry.sectionTitle;

      const excerpt = document.createElement("span");
      excerpt.textContent = excerptFor(entry, tokens[0]);

      link.append(meta, title, excerpt);
      link.addEventListener("click", () => dialog.close());
      fragment.append(link);
    });
    results.replaceChildren(fragment);
  };

  const openSearch = async () => {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    if (searchEntries.length === 0 && !loadError) {
      renderMessage("검색 색인을 불러오는 중입니다.", "search-loading");
      await indexPromise;
    }
    renderSearchResults(input.value);
    window.requestAnimationFrame(() => input.focus());
  };

  const closeSearch = () => {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  };

  document.querySelector("[data-search-open]")?.addEventListener("click", openSearch);
  document.querySelector("[data-search-close]")?.addEventListener("click", closeSearch);
  input.addEventListener("input", () => renderSearchResults(input.value));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeSearch();
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target?.isContentEditable;
    if (event.key === "/" && !typing) {
      event.preventDefault();
      openSearch();
    }
    if (event.key === "Escape" && dialog.hasAttribute("open")) {
      closeSearch();
    }
  });

  window.HWGuideSearch = Object.freeze({
    normalize,
    scoreEntry,
    renderSearchResults,
    openSearch,
    closeSearch,
  });
})();
