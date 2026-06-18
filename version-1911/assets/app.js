/* 高清剧集大全：页面交互 */
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
    });
  }

  function initImageFallback() {
    document.querySelectorAll("img[data-cover]").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-hidden");
        if (img.parentElement) {
          img.parentElement.classList.add("cover-missing");
        }
      }, { once: true });
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var previous = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (slides.length <= 1) {
      return;
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function initMovieFilters() {
    document.querySelectorAll("[data-movie-filter]").forEach(function (form) {
      var cards = Array.prototype.slice.call(document.querySelectorAll(form.getAttribute("data-target") || "[data-movie-card]"));
      var keywordInput = form.querySelector("[data-filter-keyword]");
      var typeSelect = form.querySelector("[data-filter-type]");
      var yearSelect = form.querySelector("[data-filter-year]");
      var resetButton = form.querySelector("[data-filter-reset]");

      function apply() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.type,
            card.dataset.year,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.tags
          ].join(" "));
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedType = !type || normalize(card.dataset.type).indexOf(type) !== -1 || normalize(card.dataset.genre).indexOf(type) !== -1;
          var matchedYear = !year || normalize(card.dataset.year) === year;
          card.hidden = !(matchedKeyword && matchedType && matchedYear);
        });
      }

      [keywordInput, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (resetButton) {
        resetButton.addEventListener("click", function () {
          form.reset();
          apply();
        });
      }
    });
  }

  function movieCard(movie) {
    var tags = [movie.type, movie.year].concat(movie.genreTags || []).filter(Boolean).slice(0, 4);
    return "" +
      "<article class="movie-card">" +
      "  <a class="card-poster" href="movie/" + escapeHTML(movie.slug) + ".html">" +
      "    <img src="" + escapeHTML(movie.cover) + "" alt="" + escapeHTML(movie.title) + "" loading="lazy" data-cover>" +
      "    <span class="card-play" aria-hidden="true">▶</span>" +
      "    <span class="card-rating">" + escapeHTML(movie.rating) + "</span>" +
      "  </a>" +
      "  <div class="card-body">" +
      "    <h3><a href="movie/" + escapeHTML(movie.slug) + ".html">" + escapeHTML(movie.title) + "</a></h3>" +
      "    <p>" + escapeHTML(movie.oneLine) + "</p>" +
      "    <div class="card-meta">" + tags.map(function (tag) {
      return "<span>" + escapeHTML(tag) + "</span>";
      }).join("") + "</div>" +
      "  </div>" +
      "</article>";
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var form = document.querySelector("[data-search-page-form]");
    var input = document.querySelector("[data-search-page-input]");
    if (!results || !window.SiteMovies) {
      return;
    }

    function runSearch() {
      var query = normalize(input && input.value);
      var movies = window.SiteMovies.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" "));
        return !query || haystack.indexOf(query) !== -1;
      }).slice(0, 120);

      if (!movies.length) {
        results.innerHTML = "<div class="empty-message">没有找到匹配内容，可尝试更换关键词。</div>";
      } else {
        results.innerHTML = movies.map(movieCard).join("");
      }
      initImageFallback();
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get("q") && input) {
      input.value = params.get("q");
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        runSearch();
      });
    }

    if (input) {
      input.addEventListener("input", runSearch);
    }

    runSearch();
  }

  ready(function () {
    initMenu();
    initImageFallback();
    initHero();
    initMovieFilters();
    initSearchPage();
  });
})();
