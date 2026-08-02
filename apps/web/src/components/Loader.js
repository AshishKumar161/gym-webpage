/**
 * Loader Component — Luxury branded preloader animation.
 */
import { qs } from '../utils/dom.js';

export function initLoader() {
  const preloader = qs('#preloader');
  const loaderBar = qs('.loader-bar');
  if (!preloader) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 25) + 15;
    if (progress >= 100) {
      progress = 100;
      if (loaderBar) loaderBar.style.width = '100%';
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('loaded');
      }, 300);
    } else {
      if (loaderBar) loaderBar.style.width = `${progress}%`;
    }
  }, 100);
}
