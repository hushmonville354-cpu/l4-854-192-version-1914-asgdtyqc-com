(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  if (slides.length) {
    showSlide(0);
    startHero();

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(heroTimer);
        showSlide(index);
        startHero();
      });
    });
  }

  var searchInput = document.querySelector('[data-search-input]');
  var genreSelect = document.querySelector('[data-genre-select]');
  var yearSelect = document.querySelector('[data-year-select]');
  var searchableCards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyState = document.querySelector('[data-search-empty]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applySearchFilters() {
    if (!searchableCards.length) {
      return;
    }

    var q = normalize(searchInput ? searchInput.value : '');
    var genre = normalize(genreSelect ? genreSelect.value : '');
    var year = normalize(yearSelect ? yearSelect.value : '');
    var visible = 0;

    searchableCards.forEach(function (card) {
      var title = normalize(card.getAttribute('data-title'));
      var tags = normalize(card.getAttribute('data-tags'));
      var cardGenre = normalize(card.getAttribute('data-genre'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var textMatch = !q || title.indexOf(q) > -1 || tags.indexOf(q) > -1 || cardGenre.indexOf(q) > -1;
      var genreMatch = !genre || cardGenre.indexOf(genre) > -1 || tags.indexOf(genre) > -1;
      var yearMatch = !year || cardYear === year;
      var matched = textMatch && genreMatch && yearMatch;

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? 'none' : 'block';
    }
  }

  if (searchInput || genreSelect || yearSelect) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    [searchInput, genreSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applySearchFilters);
        control.addEventListener('change', applySearchFilters);
      }
    });

    applySearchFilters();
  }
})();

function initMoviePlayer(source) {
  var video = document.querySelector('[data-video-player]');
  var cover = document.querySelector('[data-play-cover]');

  if (!video || !source) {
    return;
  }

  var started = false;
  var hlsInstance = null;

  function attachSource() {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function startPlayback() {
    attachSource();

    if (cover) {
      cover.classList.add('hidden');
    }

    var playResult = video.play();

    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
