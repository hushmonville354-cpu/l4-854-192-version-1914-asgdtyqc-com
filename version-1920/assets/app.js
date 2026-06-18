(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === current);
        dot.setAttribute("aria-current", idx === current ? "true" : "false");
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
        schedule();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        schedule();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        schedule();
      });
    }
    schedule();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
      var empty = scope.querySelector("[data-empty]");
      var active = "all";

      function update() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
          var mediaType = card.getAttribute("data-type") || "";
          var matchText = !query || keywords.indexOf(query) !== -1;
          var matchFilter = active === "all" || mediaType === active;
          var keep = matchText && matchFilter;
          card.hidden = !keep;
          if (keep) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", update);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          active = button.getAttribute("data-filter-value") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          update();
        });
      });
      update();
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();

function initMoviePlayer(videoId, buttonId, coverId, streamUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var cover = document.getElementById(coverId);
  if (!video || !button || !cover || !streamUrl) {
    return;
  }
  var loaded = false;
  var hlsPlayer = null;

  function loadStream() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsPlayer = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsPlayer.loadSource(streamUrl);
      hlsPlayer.attachMedia(video);
      return;
    }
    video.src = streamUrl;
  }

  function start() {
    cover.classList.add("is-hidden");
    video.setAttribute("controls", "controls");
    loadStream();
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  button.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    start();
  });
  cover.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (!loaded) {
      start();
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hlsPlayer && typeof hlsPlayer.destroy === "function") {
      hlsPlayer.destroy();
    }
  });
}
