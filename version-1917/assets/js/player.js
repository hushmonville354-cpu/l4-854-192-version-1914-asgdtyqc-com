function initMoviePlayer(playUrl) {
  var video = document.getElementById("moviePlayer");
  var button = document.getElementById("playButton");
  var hasAttached = false;

  if (!video || !button || !playUrl) {
    return;
  }

  function attachStream() {
    if (hasAttached) {
      return;
    }

    hasAttached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(playUrl);
      hls.attachMedia(video);
    } else {
      video.src = playUrl;
    }
  }

  function playMovie() {
    attachStream();
    button.style.display = "none";

    var playTask = video.play();

    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {
        button.style.display = "grid";
      });
    }
  }

  button.addEventListener("click", playMovie);

  video.addEventListener("click", function () {
    if (video.paused) {
      playMovie();
    }
  });
}
