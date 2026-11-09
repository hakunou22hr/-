const EDITIONS = { '90': 's2uI0gUvm0k', '30': 'd6PuyDM0YpU' };
const frame = document.querySelector('#video-frame'), label = document.querySelector('#edition-label');
let current = new URLSearchParams(location.search).has('portrait') ? '30' : '90';
let player = null, ready = false;
const pending = [];

function applyEditionUI(edition) {
  frame.classList.toggle('portrait', edition === '30');
  label.textContent = edition === '30' ? '映画版30秒 · 縦9:16' : '映画版90秒 · 横16:9';
  document.querySelectorAll('[data-edition]').forEach(b => {
    const active = b.dataset.edition === edition;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', String(active));
  });
}

function whenReady(fn) { if (ready) fn(); else pending.push(fn); }

function select(edition, startSeconds) {
  return new Promise(resolve => {
    whenReady(() => {
      applyEditionUI(edition);
      if (current !== edition || startSeconds !== undefined) {
        current = edition;
        const opts = { videoId: EDITIONS[edition] };
        if (startSeconds !== undefined) opts.startSeconds = startSeconds;
        player.loadVideoById(opts);
      }
      resolve();
    });
  });
}
window.__selectEdition = select;

function initPlayer() {
  player = new YT.Player('player', {
    videoId: EDITIONS[current],
    playerVars: { rel: 0, playsinline: 1 },
    events: {
      onReady: () => {
        ready = true;
        applyEditionUI(current);
        while (pending.length) pending.shift()();
      }
    }
  });
}

if (window.YT && YT.Player) {
  initPlayer();
} else {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
  window.onYouTubeIframeAPIReady = initPlayer;
}

document.querySelectorAll('[data-edition]').forEach(b => b.onclick = () => select(b.dataset.edition));
document.querySelectorAll('[data-time]').forEach(b => b.onclick = () => select('90', Number(b.dataset.time) + .5));
document.querySelector('#restart').onclick = () => whenReady(() => { player.seekTo(0, true); player.playVideo(); });
