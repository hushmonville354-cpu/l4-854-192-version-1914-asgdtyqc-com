(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var button = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (button && mobileNav) {
      button.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        button.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var stage = document.querySelector("[data-feature-stage]");

    if (stage) {
      var slides = Array.prototype.slice.call(stage.querySelectorAll("[data-feature-slide]"));
      var dots = Array.prototype.slice.call(stage.querySelectorAll("[data-feature-dot]"));
      var index = 0;
      var timer = null;

      function showSlide(next) {
        if (!slides.length) {
          return;
        }

        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
          slide.classList.toggle("is-active", current === index);
        });
        dots.forEach(function (dot, current) {
          dot.classList.toggle("is-active", current === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot, current) {
        dot.addEventListener("click", function () {
          showSlide(current);
          start();
        });
      });

      stage.addEventListener("mouseenter", stop);
      stage.addEventListener("mouseleave", start);
      showSlide(0);
      start();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]")).forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-text]"));
      var empty = scope.querySelector("[data-empty-state]");
      var filterValue = "all";

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search-text") || "").toLowerCase();
          var type = card.getAttribute("data-type") || "";
          var okText = !query || text.indexOf(query) !== -1;
          var okType = filterValue === "all" || type === filterValue;
          var ok = okText && okType;

          card.classList.toggle("is-hidden", !ok);

          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          filterValue = chip.getAttribute("data-filter-value") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          applyFilter();
        });
      });

      applyFilter();
    });
  });
})();
