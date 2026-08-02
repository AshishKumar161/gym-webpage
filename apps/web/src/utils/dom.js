/**
 * Utility module for DOM manipulation, safe querying, and scroll management.
 */

/**
 * Safely query a single DOM element.
 * @param {string} selector
 * @param {ParentNode} [parent=document]
 * @returns {Element|null}
 */
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Safely query all matching DOM elements as an array.
 * @param {string} selector
 * @param {ParentNode} [parent=document]
 * @returns {Element[]}
 */
export function qsa(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * Gets the scrollbar width to prevent page shift when modals open.
 * @returns {number}
 */
export function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

/**
 * Locks page body scroll without causing horizontal layout jumps.
 */
export function lockScroll() {
  const scrollbarWidth = getScrollbarWidth();
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
  document.body.classList.add('modal-open');
}

/**
 * Unlocks page body scroll and restores padding.
 */
export function unlockScroll() {
  document.body.style.paddingRight = '';
  document.body.classList.remove('modal-open');
}

/**
 * Traps focus within a given container element (accessibility).
 * @param {HTMLElement} container
 * @param {KeyboardEvent} e
 */
export function trapFocus(container, e) {
  const focusables = qsa(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    container
  ).filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');

  if (!focusables.length) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
