"use strict";

(() => {
  const root = document.documentElement;
  const body = document.body;
  const progress = document.querySelector("[data-reading-progress]");
  const menuButton = document.querySelector("[data-menu-toggle]");
  const completionCount = document.querySelector("[data-completion-count]");

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
        // Session memory keeps core reading controls usable when storage is blocked.
      }
    },
  };

  const clamp = (value, minimum, maximum) =>
    Math.min(maximum, Math.max(minimum, value));

  const readPageData = () => {
    const node = document.querySelector("#guide-page-data");
    if (!node) return { pageKind: "home", chapterCount: 16, chapterId: null };
    try {
      const parsed = JSON.parse(node.textContent ?? "{}");
      return {
        pageKind: parsed.pageKind === "chapter"
          ? "chapter"
          : parsed.pageKind === "reference"
            ? "reference"
            : "home",
        chapterId: typeof parsed.chapterId === "string" ? parsed.chapterId : null,
        chapterCount: Number(parsed.chapterCount) || 16,
        chapterSlug: typeof parsed.chapterSlug === "string" ? parsed.chapterSlug : null,
        chapters: Array.isArray(parsed.chapters) ? parsed.chapters : [],
      };
    } catch {
      return { pageKind: "home", chapterCount: 16, chapterId: null, chapters: [] };
    }
  };

  const pageData = readPageData();

  const setTheme = (theme) => {
    const nextTheme = theme === "dark" ? "dark" : "light";
    root.dataset.theme = nextTheme;
    safeStorage.set("hw-guide-theme", nextTheme);
    const button = document.querySelector("[data-theme-toggle]");
    button?.setAttribute(
      "aria-label",
      nextTheme === "dark" ? "라이트 모드 켜기" : "다크 모드 켜기",
    );
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

  const closeNavigation = () => {
    body.classList.remove("nav-open");
    menuButton?.setAttribute("aria-expanded", "false");
  };

  menuButton?.addEventListener("click", () => {
    const open = body.classList.toggle("nav-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll("[data-chapter-link]").forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("nav-open")) {
      closeNavigation();
      menuButton?.focus();
    }
  });

  const validChapterIds = new Set(
    Array.from({ length: pageData.chapterCount }, (_, index) => `chapter-${index}`),
  );

  const parseCompleted = () => {
    try {
      const parsed = JSON.parse(safeStorage.get("hw-guide-completed") ?? "[]");
      return new Set(
        Array.isArray(parsed)
          ? parsed.filter((chapterId) => validChapterIds.has(chapterId))
          : [],
      );
    } catch {
      return new Set();
    }
  };

  const completedChapters = parseCompleted();

  const renderChapterCompletion = (chapterId) => {
    const complete = completedChapters.has(chapterId);
    document
      .querySelectorAll(`[data-chapter-link="${chapterId}"]`)
      .forEach((link) => link.toggleAttribute("data-completed", complete));
    document
      .querySelectorAll(`[data-chapter-complete="${chapterId}"]`)
      .forEach((button) => {
        button.setAttribute("aria-pressed", String(complete));
        button.textContent = complete ? "학습 완료 · 취소하기" : "이 장을 학습 완료로 표시";
      });
    document
      .querySelector(`[data-chapter-id="${chapterId}"]`)
      ?.classList.toggle("is-complete", complete);
  };

  const renderCompletion = () => {
    validChapterIds.forEach(renderChapterCompletion);
    if (!completionCount) return;
    const currentComplete =
      pageData.chapterId !== null && completedChapters.has(pageData.chapterId);
    completionCount.textContent = `${completedChapters.size}/${pageData.chapterCount}`;
    completionCount.setAttribute("aria-pressed", String(currentComplete));
    completionCount.setAttribute(
      "aria-label",
      pageData.chapterId
        ? `현재 장 ${currentComplete ? "완료 취소" : "학습 완료로 표시"}. 전체 ${pageData.chapterCount}개 장 중 ${completedChapters.size}개 완료`
        : `전체 ${pageData.chapterCount}개 장 중 ${completedChapters.size}개 완료`,
    );
  };

  const toggleChapterCompletion = (chapterId) => {
    if (!chapterId || !validChapterIds.has(chapterId)) return;
    if (completedChapters.has(chapterId)) completedChapters.delete(chapterId);
    else completedChapters.add(chapterId);
    safeStorage.set("hw-guide-completed", JSON.stringify([...completedChapters]));
    renderCompletion();
  };

  completionCount?.addEventListener("click", () => {
    toggleChapterCompletion(pageData.chapterId);
  });

  document.querySelectorAll("[data-chapter-complete]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleChapterCompletion(button.dataset.chapterComplete);
    });
  });

  renderCompletion();

  if (pageData.pageKind === "chapter" && pageData.chapterSlug && pageData.chapterId) {
    safeStorage.set(
      "hw-guide-last-chapter",
      JSON.stringify({
        id: pageData.chapterId,
        slug: pageData.chapterSlug,
      }),
    );
  }

  const continueLink = document.querySelector("[data-continue-reading]");
  if (continueLink) {
    try {
      const lastChapter = JSON.parse(
        safeStorage.get("hw-guide-last-chapter") ?? "{}",
      );
      const metadata = pageData.chapters.find(
        (chapter) => chapter.id === lastChapter.id && chapter.slug === lastChapter.slug,
      );
      if (metadata?.href) {
        continueLink.href = metadata.href;
        continueLink.textContent = `${metadata.number}장 이어 읽기`;
      }
    } catch {
      // The static first-chapter link remains a valid fallback.
    }
  }

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

  window.HWGuideApp = Object.freeze({
    pageData,
    setTheme,
    setFontScale,
    renderCompletion,
    toggleChapterCompletion,
    updateProgress,
  });
})();
