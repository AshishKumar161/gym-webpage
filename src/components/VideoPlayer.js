/**
 * VideoPlayer Component — Handles gym tour video play interaction
 * with click & keyboard support (Enter/Space) and clean URL parameter handling.
 */
import { qs } from '../utils/dom.js';

/**
 * Initialises the gym tour video player.
 */
export function initVideoPlayer() {
  const placeholder = qs('#video-placeholder');
  const playBtn = qs('#play-btn');
  const videoWrap = placeholder?.closest('.video-wrapper');
  if (!videoWrap || !placeholder) return;

  const playVideo = () => {
    if (videoWrap.classList.contains('playing')) return;

    videoWrap.classList.add('playing');
    const iframe = qs('iframe', videoWrap);
    if (!iframe || !iframe.src) return;

    try {
      const url = new URL(iframe.src);
      if (!url.searchParams.has('autoplay')) {
        url.searchParams.set('autoplay', '1');
        iframe.src = url.toString();
      }
    } catch {
      if (!iframe.src.includes('autoplay=1')) {
        const delimiter = iframe.src.includes('?') ? '&' : '?';
        iframe.src += `${delimiter}autoplay=1`;
      }
    }

    // Set focus to the iframe for keyboard/screen reader users
    iframe.focus();
  };

  placeholder.addEventListener('click', playVideo);

  placeholder.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      playVideo();
    }
  });

  if (playBtn && playBtn !== placeholder) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playVideo();
    });

    playBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        playVideo();
      }
    });
  }
}
