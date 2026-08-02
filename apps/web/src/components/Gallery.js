/**
 * Gallery Component — Lightbox overlay with keyboard navigation,
 * focus trapping, alt text sync, and layout shift prevention.
 */
import { qs, qsa, lockScroll, unlockScroll, trapFocus } from '../utils/dom.js';

let activeTrigger = null;

/**
 * Builds the lightbox modal DOM structure and appends it to document body.
 * @returns {HTMLElement}
 */
function createLightbox() {
  let lightbox = qs('#lightbox');
  if (lightbox) return lightbox;

  lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Image preview');

  lightbox.innerHTML = `
    <div class="lightbox-content">
      <button type="button" class="lightbox-close" id="lb-close" aria-label="Close image preview">&times;</button>
      <img id="lb-img" alt="Gallery image preview" />
      <div id="lb-caption" class="lightbox-caption-text"></div>
    </div>
  `;

  document.body.appendChild(lightbox);
  return lightbox;
}

/**
 * Opens the lightbox with the specified image URL and alt text.
 * @param {HTMLElement} lightbox
 * @param {string} src
 * @param {string} alt
 * @param {string} caption
 * @param {HTMLElement} triggerEl
 */
function openLightbox(lightbox, src, alt, caption, triggerEl) {
  const lbImg = qs('#lb-img', lightbox);
  const lbCaption = qs('#lb-caption', lightbox);
  const lbClose = qs('#lb-close', lightbox);

  if (!lbImg) return;

  activeTrigger = triggerEl;
  lbImg.src = src;
  lbImg.alt = alt || 'Gallery photo preview';
  if (lbCaption) {
    lbCaption.textContent = caption || '';
  }

  lightbox.classList.add('active');
  lockScroll();

  if (lbClose) {
    lbClose.focus();
  }
}

/**
 * Closes the lightbox modal and restores focus to the triggering element.
 * @param {HTMLElement} lightbox
 */
function closeLightbox(lightbox) {
  if (!lightbox.classList.contains('active')) return;

  lightbox.classList.remove('active');
  unlockScroll();

  if (activeTrigger) {
    activeTrigger.focus();
    activeTrigger = null;
  }
}

/**
 * Initialises gallery items with click and keyboard handlers.
 */
export function initGallery() {
  const galleryItems = qsa('.gallery-item');
  if (!galleryItems.length) return;

  const lightbox = createLightbox();
  const lbClose = qs('#lb-close', lightbox);
  const lbImg = qs('#lb-img', lightbox);

  galleryItems.forEach(item => {
    const handleOpen = () => {
      const img = qs('img', item);
      const caption = qs('.gallery-caption', item)?.textContent;
      if (img && img.src) {
        openLightbox(lightbox, img.src, img.alt, caption, item);
      }
    };

    item.addEventListener('click', handleOpen);

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpen();
      }
    });
  });

  // Close when clicking the close button
  lbClose?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox(lightbox);
  });

  // Close when clicking the backdrop background (outside content)
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox(lightbox);
    }
  });

  // Keyboard navigation & focus trap
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeLightbox(lightbox);
    } else if (e.key === 'Tab') {
      trapFocus(lightbox, e);
    }
  });
}
