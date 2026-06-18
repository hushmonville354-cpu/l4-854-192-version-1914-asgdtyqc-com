(function() {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function() {
            mobileNav.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var currentSlide = 0;

    function setSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === currentSlide);
        });
    }

    var nextButton = document.querySelector("[data-slide-next]");
    var prevButton = document.querySelector("[data-slide-prev]");

    if (nextButton) {
        nextButton.addEventListener("click", function() {
            setSlide(currentSlide + 1);
        });
    }

    if (prevButton) {
        prevButton.addEventListener("click", function() {
            setSlide(currentSlide - 1);
        });
    }

    if (slides.length > 1) {
        window.setInterval(function() {
            setSlide(currentSlide + 1);
        }, 5600);
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupFilter(panel) {
        var target = panel.getAttribute("data-filter-target");
        var scope = target ? document.querySelector(target) : document;
        var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card")) : [];
        var empty = scope ? scope.querySelector(".empty-state") : null;
        var inputs = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-field]"));

        function applyFilter() {
            var state = {};
            inputs.forEach(function(input) {
                state[input.getAttribute("data-filter-field")] = normalize(input.value);
            });

            var visible = 0;

            cards.forEach(function(card) {
                var title = normalize(card.getAttribute("data-title"));
                var region = normalize(card.getAttribute("data-region"));
                var type = normalize(card.getAttribute("data-type"));
                var year = normalize(card.getAttribute("data-year"));
                var genre = normalize(card.getAttribute("data-genre"));
                var keyword = state.keyword || "";
                var matchesKeyword = !keyword || title.indexOf(keyword) > -1 || region.indexOf(keyword) > -1 || type.indexOf(keyword) > -1 || genre.indexOf(keyword) > -1;
                var matchesRegion = !state.region || region.indexOf(state.region) > -1;
                var matchesType = !state.type || type.indexOf(state.type) > -1;
                var matchesYear = !state.year || year.indexOf(state.year) > -1;
                var show = matchesKeyword && matchesRegion && matchesType && matchesYear;

                card.classList.toggle("is-hidden", !show);

                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        inputs.forEach(function(input) {
            input.addEventListener("input", applyFilter);
            input.addEventListener("change", applyFilter);
        });

        applyFilter();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]")).forEach(setupFilter);
})();
