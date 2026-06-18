(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mainNav = document.querySelector("[data-main-nav]");

  if (menuButton && mainNav) {
    menuButton.addEventListener("click", function () {
      mainNav.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var activeIndex = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === activeIndex);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(activeIndex + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(activeIndex - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(activeIndex + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-local-search]").forEach(function (form) {
    var input = form.querySelector(".local-search");
    var list = document.querySelector("[data-list]");

    if (!input || !list) {
      return;
    }

    function filterCards() {
      var value = input.value.trim().toLowerCase();
      var cards = list.querySelectorAll("[data-card]");

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-text") || card.textContent || "").toLowerCase();
        card.classList.toggle("is-hidden", value && text.indexOf(value) === -1);
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      filterCards();
    });

    form.querySelectorAll("button").forEach(function (button) {
      button.addEventListener("click", filterCards);
    });

    input.addEventListener("input", filterCards);

    if (input.hasAttribute("data-auto-search")) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");

      if (q) {
        input.value = q;
        filterCards();
      }
    }
  });
})();
