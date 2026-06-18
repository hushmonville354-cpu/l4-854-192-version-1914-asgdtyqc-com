const Hls = window.Hls;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMobileNav() {
  const button = $(".mobile-toggle");
  const panel = $(".mobile-panel");

  if (!button || !panel) {
    return;
  }

  button.addEventListener("click", () => {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen));
    panel.hidden = isOpen;
  });
}

function initPosterFallbacks() {
  $$(".poster-img").forEach((image) => {
    image.addEventListener("error", () => {
      const media = image.closest(".poster-media");
      if (media) {
        media.classList.add("is-missing");
      }
    });
  });
}

function initHeroSlider() {
  const slider = $("[data-hero-slider]");

  if (!slider) {
    return;
  }

  const slides = $$(".hero-slide", slider);
  const dots = $$(".hero-dot", slider);
  const previous = $("[data-slide-prev]", slider);
  const next = $("[data-slide-next]", slider);
  let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
  let timer = null;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }

  function schedule() {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5500);
  }

  previous?.addEventListener("click", () => {
    showSlide(activeIndex - 1);
    schedule();
  });

  next?.addEventListener("click", () => {
    showSlide(activeIndex + 1);
    schedule();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const target = Number(dot.dataset.slideTo || 0);
      showSlide(target);
      schedule();
    });
  });

  showSlide(activeIndex);
  schedule();
}

function initPageFiltering() {
  const input = $(".js-page-filter");
  const grid = $(".js-sortable-grid");
  const sortSelect = $(".js-sort-select");

  if (!grid) {
    return;
  }

  const cards = $$("[data-filter-card]", grid);

  function applyFilter() {
    const query = (input?.value || "").trim().toLowerCase();
    cards.forEach((card) => {
      const title = (card.dataset.title || "").toLowerCase();
      const category = (card.dataset.category || "").toLowerCase();
      const matches = !query || title.includes(query) || category.includes(query);
      card.classList.toggle("is-hidden", !matches);
    });
  }

  function applySort() {
    const mode = sortSelect?.value || "views";
    const sortedCards = [...cards].sort((a, b) => {
      if (mode === "rating") {
        return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
      }
      if (mode === "year") {
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      }
      return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
    });
    sortedCards.forEach((card) => grid.appendChild(card));
  }

  input?.addEventListener("input", applyFilter);
  sortSelect?.addEventListener("change", () => {
    applySort();
    applyFilter();
  });

  applySort();
  applyFilter();
}

function createSearchCard(movie) {
  const article = document.createElement("a");
  article.className = "movie-card";
  article.href = movie.url;
  article.innerHTML = `
    <div class="movie-poster-wrap">
      <div class="poster-media" aria-hidden="true">
        <img class="poster-img" src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="poster-fallback">${escapeHtml(movie.title.slice(0, 1))}</span>
      </div>
      <span class="duration-badge">${escapeHtml(movie.duration)}</span>
      <span class="category-badge">${escapeHtml(movie.category)}</span>
    </div>
    <div class="movie-card-body">
      <h3>${escapeHtml(movie.title)}</h3>
      <p>${escapeHtml(movie.oneLine || movie.genre || "")}</p>
      <div class="card-stats">
        <span>${Math.round(movie.views / 1000)}k</span>
        <span>★ ${escapeHtml(movie.rating)}</span>
      </div>
    </div>
  `;
  return article;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    };
    return map[char];
  });
}

function initSearchPage() {
  const app = $("#search-app");
  const input = $("#search-input");
  const sort = $("#search-sort");
  const results = $("#search-results");
  const count = $("#search-count");

  if (!app || !input || !sort || !results || !count || !window.MOVIE_INDEX) {
    return;
  }

  const movies = window.MOVIE_INDEX;
  const params = new URLSearchParams(window.location.search);
  let activeCategory = params.get("category") || "全部";
  input.value = params.get("q") || "";
  sort.value = params.get("sort") || "views";

  function render() {
    const query = input.value.trim().toLowerCase();
    const mode = sort.value;
    let filtered = movies.filter((movie) => {
      const haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        movie.oneLine,
        ...(movie.tags || [])
      ].join(" ").toLowerCase();
      const categoryMatches = activeCategory === "全部" || movie.category === activeCategory;
      return categoryMatches && (!query || haystack.includes(query));
    });

    filtered = filtered.sort((a, b) => {
      if (mode === "rating") {
        return Number(b.rating || 0) - Number(a.rating || 0);
      }
      if (mode === "latest") {
        return String(b.publishDate || "").localeCompare(String(a.publishDate || ""));
      }
      if (mode === "year") {
        return Number(b.year || 0) - Number(a.year || 0);
      }
      return Number(b.views || 0) - Number(a.views || 0);
    });

    results.innerHTML = "";
    const fragment = document.createDocumentFragment();
    filtered.forEach((movie) => fragment.appendChild(createSearchCard(movie)));
    results.appendChild(fragment);
    count.textContent = `找到 ${filtered.length} 个结果`;
    initPosterFallbacks();
  }

  $$("[data-search-category]").forEach((button) => {
    const category = button.dataset.searchCategory || "全部";
    button.classList.toggle("is-active", category === activeCategory);
    button.addEventListener("click", () => {
      activeCategory = category;
      $$("[data-search-category]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      render();
    });
  });

  input.addEventListener("input", render);
  sort.addEventListener("change", render);
  render();
}

const hlsInstances = new WeakMap();

function loadAndPlay(video) {
  const source = video.dataset.videoUrl;
  const card = video.closest(".player-card");

  if (!source) {
    return;
  }

  if (video.dataset.loaded === "true") {
    video.play().catch(() => {});
    return;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.dataset.loaded = "true";
      video.play().catch(() => {});
    });
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data?.fatal) {
        console.warn("HLS playback error", data);
      }
    });
    hlsInstances.set(video, hls);
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    video.dataset.loaded = "true";
    video.play().catch(() => {});
  }

  card?.classList.add("is-playing");
}

function initPlayers() {
  $$(".js-hls-player").forEach((video) => {
    const card = video.closest(".player-card");
    const button = card?.querySelector("[data-play-button]");

    button?.addEventListener("click", () => loadAndPlay(video));
    video.addEventListener("play", () => card?.classList.add("is-playing"));
    video.addEventListener("pause", () => card?.classList.remove("is-playing"));
    video.addEventListener("click", () => {
      if (video.dataset.loaded !== "true") {
        loadAndPlay(video);
      }
    });
  });

  window.addEventListener("beforeunload", () => {
    $$(".js-hls-player").forEach((video) => {
      const hls = hlsInstances.get(video);
      if (hls) {
        hls.destroy();
      }
    });
  });
}

initMobileNav();
initPosterFallbacks();
initHeroSlider();
initPageFiltering();
initSearchPage();
initPlayers();
