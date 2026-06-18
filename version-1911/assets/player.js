/* 高清剧集大全：HLS 播放器 */
import { H as Hls } from "./hls-vendor-dru42stk.js";

function setStatus(message) {
  const status = document.querySelector("[data-player-status]");
  if (status) {
    status.textContent = message;
  }
}

function playVideo(video, source) {
  if (!video || !source) {
    setStatus("播放源暂不可用");
    return;
  }

  video.controls = true;

  if (Hls && Hls.isSupported()) {
    if (window.__currentHlsPlayer) {
      window.__currentHlsPlayer.destroy();
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    window.__currentHlsPlayer = hls;
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus("播放源已加载");
      video.play().catch(function () {
        setStatus("点击视频画面即可继续播放");
      });
    });
    hls.on(Hls.Events.ERROR, function (_, data) {
      if (data && data.fatal) {
        setStatus("播放加载遇到网络波动，请稍后重试");
      }
    });
    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    video.addEventListener("loadedmetadata", function () {
      setStatus("播放源已加载");
      video.play().catch(function () {
        setStatus("点击视频画面即可继续播放");
      });
    }, { once: true });
    return;
  }

  setStatus("当前浏览器暂不支持 HLS 播放");
}

document.addEventListener("DOMContentLoaded", function () {
  const button = document.querySelector("[data-play-button]");
  const video = document.querySelector("[data-player-video]");

  if (!button || !video) {
    return;
  }

  button.addEventListener("click", function () {
    const source = video.getAttribute("data-source");
    button.classList.add("is-hidden");
    playVideo(video, source);
  });
});
