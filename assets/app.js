"use strict";

(() => {
  const root = document.documentElement;
  const body = document.body;
  const chapters = [...document.querySelectorAll(".chapter")];
  const tocLinks = [...document.querySelectorAll('.book-nav a[href^="#chapter-"]')];
  const progress = document.querySelector("[data-reading-progress]");
  const railNumber = document.querySelector(".chapter-rail strong");
  const railTitle = document.querySelector(".chapter-rail span");
  const menuButton = document.querySelector("[data-menu-toggle]");
  const searchDialog = document.querySelector("#search-dialog");
  const searchInput = document.querySelector("#book-search");
  const searchResults = document.querySelector("#search-results");

  const memoryStorage = new Map();
  const safeStorage = {
    get(key) {
      try {
        return localStorage.getItem(key) ?? memoryStorage.get(key) ?? null;
      } catch {
        return memoryStorage.get(key) ?? null;
      }
    },
    set(key, value) {
      memoryStorage.set(key, String(value));
      try {
        localStorage.setItem(key, String(value));
      } catch {
        // The in-memory value keeps the session usable when storage is blocked.
      }
    },
  };

  const clamp = (value, minimum, maximum) =>
    Math.min(maximum, Math.max(minimum, value));

  const setTheme = (theme) => {
    const nextTheme = theme === "dark" ? "dark" : "light";
    root.dataset.theme = nextTheme;
    safeStorage.set("hw-guide-theme", nextTheme);
    const button = document.querySelector("[data-theme-toggle]");
    if (button) {
      button.setAttribute(
        "aria-label",
        nextTheme === "dark" ? "라이트 모드 켜기" : "다크 모드 켜기",
      );
    }
    document.dispatchEvent(
      new CustomEvent("hwguide:themechange", { detail: { theme: nextTheme } }),
    );
  };

  const storedTheme = safeStorage.get("hw-guide-theme");
  const systemDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(storedTheme ?? (systemDark ? "dark" : "light"));

  const setFontScale = (value) => {
    const nextScale = clamp(Number(value) || 1, 0.9, 1.2);
    root.style.setProperty("--font-scale", String(nextScale));
    root.dataset.fontScale = String(nextScale);
    safeStorage.set("hw-guide-font-scale", nextScale);
  };

  setFontScale(safeStorage.get("hw-guide-font-scale") ?? 1);

  document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });

  document.querySelectorAll("[data-font-step]").forEach((button) => {
    button.addEventListener("click", () => {
      const step = Number(button.dataset.fontStep);
      setFontScale(Number(root.dataset.fontScale) + step * 0.05);
    });
  });

  menuButton?.addEventListener("click", () => {
    const open = body.classList.toggle("nav-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  tocLinks.forEach((link) => {
    link.addEventListener("click", () => {
      body.classList.remove("nav-open");
      menuButton?.setAttribute("aria-expanded", "false");
    });
  });

  const parseCompleted = () => {
    try {
      const parsed = JSON.parse(safeStorage.get("hw-guide-completed") ?? "[]");
      return new Set(
        Array.isArray(parsed)
          ? parsed.filter((id) => chapters.some((chapter) => chapter.id === id))
          : [],
      );
    } catch {
      return new Set();
    }
  };

  const completedChapters = parseCompleted();
  const completionCount = document.querySelector("[data-completion-count]");

  const renderCompletion = () => {
    chapters.forEach((chapter) => {
      const complete = completedChapters.has(chapter.id);
      chapter.classList.toggle("is-complete", complete);
      const button = chapter.querySelector("[data-chapter-complete]");
      if (button) {
        button.setAttribute("aria-pressed", String(complete));
        button.textContent = complete ? "✓ 학습 완료" : "이 장을 학습 완료로 표시";
      }
      const link = tocLinks.find(
        (candidate) => candidate.getAttribute("href") === `#${chapter.id}`,
      );
      link?.toggleAttribute("data-completed", complete);
    });
    if (completionCount) {
      completionCount.textContent = `${completedChapters.size}/${chapters.length}`;
      completionCount.setAttribute(
        "aria-label",
        `${chapters.length}개 장 중 ${completedChapters.size}개 학습 완료`,
      );
    }
  };

  chapters.forEach((chapter) => {
    const completion = document.createElement("div");
    completion.className = "chapter-completion";
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.chapterComplete = chapter.id;
    button.addEventListener("click", () => {
      if (completedChapters.has(chapter.id)) completedChapters.delete(chapter.id);
      else completedChapters.add(chapter.id);
      safeStorage.set(
        "hw-guide-completed",
        JSON.stringify([...completedChapters]),
      );
      renderCompletion();
    });
    completion.append(button);
    chapter.append(completion);
  });
  renderCompletion();

  const updateProgress = () => {
    if (!progress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable <= 0 ? 0 : clamp(window.scrollY / scrollable, 0, 1);
    progress.style.width = `${ratio * 100}%`;
  };

  let progressFrame = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (progressFrame) return;
      progressFrame = window.requestAnimationFrame(() => {
        updateProgress();
        progressFrame = 0;
      });
    },
    { passive: true },
  );
  updateProgress();

  const setCurrentChapter = (chapter) => {
    if (!chapter) return;
    tocLinks.forEach((link) => {
      const current = link.getAttribute("href") === `#${chapter.id}`;
      if (current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });

    const heading = chapter.querySelector("h2");
    const number = heading?.querySelector("span")?.textContent?.trim() ?? "";
    const title = heading?.textContent?.replace(number, "").trim() ?? "";
    if (railNumber) railNumber.textContent = number;
    if (railTitle) railTitle.textContent = title;
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);
        if (visible[0]) setCurrentChapter(visible[0].target);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: [0, 0.1, 0.5] },
    );
    chapters.forEach((chapter) => observer.observe(chapter));
  } else {
    setCurrentChapter(chapters[0]);
  }

  const normalize = (value) =>
    value
      .toLocaleLowerCase("ko")
      .normalize("NFKC")
      .replace(/\s+/g, " ")
      .trim();

  const searchIndex = chapters.map((chapter) => {
    const heading = chapter.querySelector("h2")?.textContent?.trim() ?? "";
    const text = chapter.textContent?.replace(/\s+/g, " ").trim() ?? "";
    return {
      id: chapter.id,
      heading,
      text,
      normalizedHeading: normalize(heading),
      normalizedText: normalize(text),
    };
  });

  const renderSearchResults = (query) => {
    if (!searchResults) return;
    searchResults.replaceChildren();
    const normalizedQuery = normalize(query);
    if (normalizedQuery.length < 2) {
      const hint = document.createElement("p");
      hint.className = "search-empty";
      hint.textContent = "두 글자 이상 입력하면 관련 장을 찾아드립니다.";
      searchResults.append(hint);
      return;
    }

    const tokens = normalizedQuery.split(" ").filter(Boolean);
    const ranked = searchIndex
      .map((entry) => {
        const headingHits = tokens.filter((token) =>
          entry.normalizedHeading.includes(token),
        ).length;
        const bodyHits = tokens.filter((token) =>
          entry.normalizedText.includes(token),
        ).length;
        return { ...entry, score: headingHits * 4 + bodyHits };
      })
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 20);

    if (ranked.length === 0) {
      const empty = document.createElement("p");
      empty.className = "search-empty";
      empty.textContent = `"${query}"와 일치하는 내용을 찾지 못했습니다.`;
      searchResults.append(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    ranked.forEach((entry) => {
      const link = document.createElement("a");
      link.className = "search-result";
      link.href = `#${entry.id}`;

      const title = document.createElement("strong");
      title.textContent = entry.heading;
      const excerpt = document.createElement("span");
      const firstToken = tokens[0];
      const matchIndex = entry.normalizedText.indexOf(firstToken);
      const start = Math.max(0, matchIndex - 54);
      const end = Math.min(entry.text.length, start + 150);
      excerpt.textContent = `${start > 0 ? "…" : ""}${entry.text.slice(start, end)}${
        end < entry.text.length ? "…" : ""
      }`;

      link.append(title, excerpt);
      link.addEventListener("click", () => searchDialog?.close());
      fragment.append(link);
    });
    searchResults.append(fragment);
  };

  const openSearch = () => {
    if (!searchDialog) return;
    if (typeof searchDialog.showModal === "function") searchDialog.showModal();
    else searchDialog.setAttribute("open", "");
    renderSearchResults(searchInput?.value ?? "");
    window.requestAnimationFrame(() => searchInput?.focus());
  };

  const closeSearch = () => {
    if (!searchDialog) return;
    if (typeof searchDialog.close === "function") searchDialog.close();
    else searchDialog.removeAttribute("open");
  };

  document.querySelector("[data-search-open]")?.addEventListener("click", openSearch);
  document.querySelector("[data-search-close]")?.addEventListener("click", closeSearch);
  searchInput?.addEventListener("input", () => renderSearchResults(searchInput.value));

  searchDialog?.addEventListener("click", (event) => {
    if (event.target === searchDialog) closeSearch();
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
  });

  window.HWGuideApp = Object.freeze({
    setTheme,
    setFontScale,
    renderCompletion,
    renderSearchResults,
    updateProgress,
  });
})();
