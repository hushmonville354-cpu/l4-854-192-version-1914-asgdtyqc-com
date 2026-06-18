(function () {
  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var cover = document.getElementById(options.buttonId);
    var started = false;
    var source = options.source;

    if (!video || !cover || !source) {
      return;
    }

    function attemptPlay() {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    function startPlayer() {
      if (started) {
        attemptPlay();
        return;
      }

      started = true;
      cover.classList.add("is-hidden");
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        attemptPlay();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          attemptPlay();
        });
        attemptPlay();
        return;
      }

      video.src = source;
      attemptPlay();
    }

    cover.addEventListener("click", startPlayer);
    video.addEventListener("click", function () {
      if (!started) {
        startPlayer();
      }
    });
  };
})();
