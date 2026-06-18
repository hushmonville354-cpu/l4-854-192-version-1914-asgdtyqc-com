(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initNav() {
    var button = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!button || !menu) return;
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    document.querySelectorAll('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) return;
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
      });
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) return;
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('is-active', pos === index);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('is-active', pos === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, pos) {
      dot.addEventListener('click', function () {
        show(pos);
        start();
      });
    });

    root.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });
    root.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    var input = document.querySelector('[data-filter-input]');
    var year = document.querySelector('[data-year-filter]');
    var category = document.querySelector('[data-category-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    if (!cards.length) return;

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (input && q) {
      input.value = q;
    }

    function apply() {
      var text = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var categoryValue = category ? category.value : '';
      cards.forEach(function (card) {
        var searchText = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardCategory = card.getAttribute('data-category') || '';
        var matched = true;
        if (text && searchText.indexOf(text) === -1) matched = false;
        if (yearValue && cardYear !== yearValue) matched = false;
        if (categoryValue && cardCategory !== categoryValue) matched = false;
        card.hidden = !matched;
      });
    }

    [input, year, category].forEach(function (item) {
      if (item) item.addEventListener('input', apply);
      if (item) item.addEventListener('change', apply);
    });
    apply();
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-start');
      var stream = player.getAttribute('data-stream');
      if (!video || !stream) return;

      function bind() {
        if (player.getAttribute('data-ready') === 'yes') return;
        player.setAttribute('data-ready', 'yes');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        bind();
        if (button) button.classList.add('is-hidden');
        var promise = video.play();
        if (promise && promise.catch) promise.catch(function () {});
      }

      if (button) button.addEventListener('click', play);
      player.addEventListener('click', function (event) {
        if (event.target === video && video.paused) play();
      });
      video.addEventListener('play', function () {
        if (button) button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) button.classList.remove('is-hidden');
      });
    });
  }

  ready(function () {
    initNav();
    initSearchForms();
    initHero();
    initFilters();
    initPlayers();
  });
})();
