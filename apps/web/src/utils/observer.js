/**
 * Reusable IntersectionObserver utilities.
 */

/**
 * Creates an IntersectionObserver with default fallback error safety.
 * @param {Function} callback
 * @param {IntersectionObserverInit} [options={}]
 * @returns {IntersectionObserver|null}
 */
export function createObserver(callback, options = {}) {
  if (typeof IntersectionObserver === 'undefined') {
    return null;
  }
  return new IntersectionObserver(callback, options);
}
