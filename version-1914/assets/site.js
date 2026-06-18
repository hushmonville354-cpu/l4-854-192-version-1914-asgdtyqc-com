(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"], input[type="search"]');
      const value = input ? input.value.trim() : '';
      const target = form.getAttribute('action') || './search.html';
      window.location.href = value ? target + '?q=' + encodeURIComponent(value) : target;
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const show = function (next) {
      if (!slides.length) return;
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const search = scope.querySelector('[data-card-search]');
    const selects = Array.from(scope.querySelectorAll('[data-filter]'));
    const cards = Array.from(scope.querySelectorAll('.movie-card'));
    const empty = scope.querySelector('[data-empty-state]');

    const apply = function () {
      const text = search ? search.value.trim().toLowerCase() : '';
      let shown = 0;

      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category'),
          card.getAttribute('data-year'),
          card.textContent
        ].join(' ').toLowerCase();

        const textOk = !text || haystack.indexOf(text) !== -1;
        const selectOk = selects.every(function (select) {
          const key = select.getAttribute('data-filter');
          const value = select.value;
          return !value || card.getAttribute('data-' + key) === value;
        });

        const ok = textOk && selectOk;
        card.style.display = ok ? '' : 'none';
        if (ok) shown += 1;
      });

      if (empty) empty.style.display = shown ? 'none' : 'block';
    };

    if (search) search.addEventListener('input', apply);
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
  });

  const searchForm = document.querySelector('[data-search-page-form]');
  const searchResults = document.querySelector('[data-search-results]');

  if (searchForm && searchResults && window.MOVIE_INDEX) {
    const params = new URLSearchParams(window.location.search);
    const input = searchForm.querySelector('input[name="q"]');
    const region = searchForm.querySelector('select[name="region"]');
    const type = searchForm.querySelector('select[name="type"]');

    if (input) input.value = params.get('q') || '';
    if (region) region.value = params.get('region') || '';
    if (type) type.value = params.get('type') || '';

    const render = function () {
      const q = input ? input.value.trim().toLowerCase() : '';
      const reg = region ? region.value : '';
      const typ = type ? type.value : '';
      const list = window.MOVIE_INDEX.filter(function (item) {
        const text = [item.title, item.region, item.type, item.genre, item.tags, item.year, item.oneLine].join(' ').toLowerCase();
        return (!q || text.indexOf(q) !== -1) && (!reg || item.region === reg) && (!typ || item.type === typ);
      }).slice(0, 160);

      searchResults.innerHTML = list.map(function (item) {
        return '<a class="movie-card compact" href="./' + item.file + '" data-title="' + escapeHtml(item.title) + '" data-region="' + escapeHtml(item.region) + '" data-type="' + escapeHtml(item.type) + '" data-category="' + escapeHtml(item.category) + '" data-year="' + escapeHtml(item.year) + '">' +
          '<div class="poster-wrap"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="badge">' + escapeHtml(item.duration) + '</span></div>' +
          '<div class="card-body"><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.oneLine) + '</p><div class="meta-row"><span>' + escapeHtml(item.region) + '</span><span>★ ' + item.rating + '</span></div></div>' +
          '</a>';
      }).join('') || '<p class="empty-state" style="display:block">没有找到匹配的视频</p>';
    };

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    [input, region, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', render);
        element.addEventListener('change', render);
      }
    });

    if (params.toString()) render();
  }

  const video = document.querySelector('.movie-video');
  const playButton = document.querySelector('[data-play-button]');

  if (video && playButton) {
    let ready = false;

    const start = function () {
      const stream = video.getAttribute('data-stream');
      if (!stream) return;

      if (!ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        video.setAttribute('controls', 'controls');
        ready = true;
      }

      playButton.classList.add('hidden');
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          playButton.classList.remove('hidden');
        });
      }
    };

    playButton.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) start();
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
