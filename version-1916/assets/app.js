(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        var open = mobileNav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
      var prev = carousel.querySelector('.hero-prev');
      var next = carousel.querySelector('.hero-next');
      if (!slides.length) {
        return;
      }
      var index = 0;
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }
      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
        });
      });
      window.setInterval(function () {
        show(index + 1);
      }, 5600);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    document.querySelectorAll('[data-filterable]').forEach(function (grid) {
      var scope = grid.parentElement || document;
      var input = scope.querySelector('.site-search-input');
      var yearSelect = scope.querySelector('.year-filter');
      var genreSelect = scope.querySelector('.genre-filter');
      var cards = Array.prototype.slice.call(grid.children);
      if (input && q) {
        input.value = q;
      }
      function matchYear(cardYear, selected) {
        if (!selected) {
          return true;
        }
        if (selected === 'older') {
          var y = parseInt(cardYear || '0', 10);
          return !y || y < 2023;
        }
        return cardYear === selected;
      }
      function apply() {
        var term = input ? input.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var genre = genreSelect ? genreSelect.value : '';
        cards.forEach(function (card) {
          var text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year].join(' ').toLowerCase();
          var ok = (!term || text.indexOf(term) !== -1) && matchYear(card.dataset.year || '', year) && (!genre || (card.dataset.genre || '').indexOf(genre) !== -1);
          card.classList.toggle('is-hidden', !ok);
        });
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
      if (genreSelect) {
        genreSelect.addEventListener('change', apply);
      }
      apply();
    });

    document.querySelectorAll('.player-card').forEach(function (box) {
      var video = box.querySelector('video[data-stream]');
      var button = box.querySelector('.play-overlay');
      if (!video) {
        return;
      }
      var loaded = false;
      var stream = video.getAttribute('data-stream');
      function load() {
        if (loaded || !stream) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          loaded = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          loaded = true;
          return;
        }
        video.src = stream;
        loaded = true;
      }
      function play() {
        load();
        box.classList.add('is-playing');
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {
            box.classList.remove('is-playing');
          });
        }
      }
      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          box.classList.remove('is-playing');
        }
      });
    });
  });
})();
