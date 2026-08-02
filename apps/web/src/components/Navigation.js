/**
 * Navigation Component — Handles header scroll state, mobile menu toggle,
 * keyboard accessibility (Escape key, click-outside), and active link tracking.
 */
import { qs, qsa } from '../utils/dom.js';
import { createObserver } from '../utils/observer.js';

/**
 * Adds/removes the `scrolled` class on header based on scroll position.
 */
export function initHeaderScroll() {
  const header = qs('#site-header');
  if (!header) return;

  let ticking = false;

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 30);
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/**
 * Handles mobile nav menu drawer toggle, keyboard Escape closing, and click-outside detection.
 */
export function initMobileNav() {
  const navToggle = qs('#nav-toggle');
  const navMenu = qs('#nav-menu');
  if (!navToggle || !navMenu) return;

  const closeMenu = () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    navMenu.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
  };

  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navMenu.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when a link inside menu is clicked
  qsa('.nav-link', navMenu).forEach(link => {
    link.addEventListener('click', () => closeMenu());
  });

  // Close menu when clicking outside header navigation
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      closeMenu();
    }
  });

  // Close menu on Escape keypress
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMenu();
      navToggle.focus();
    }
  });
}

/**
 * Tracks sections in viewport and highlights active header navigation link.
 */
export function initActiveNavLinks() {
  const sections = qsa('section[id]');
  const navLinks = qsa('.nav-link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = createObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const targetId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const isMatch = link.getAttribute('href') === `#${targetId}`;
            link.classList.toggle('active', isMatch);
            if (isMatch) {
              link.setAttribute('aria-current', 'true');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        }
      });
    },
    {
      rootMargin: '-20% 0px -65% 0px',
      threshold: 0
    }
  );

  if (observer) {
    sections.forEach(section => observer.observe(section));
  }
}
