/**
 * Main Entry Point — A² ReVamp Gym SaaS Enterprise Platform
 *
 * Boot Order:
 * 1. Render UI shell immediately (theme, loader, hero, nav).
 * 2. Asynchronously attempt session restore via refresh token cookie.
 * 3. Render auth-aware nav based on session result.
 * 4. Initialize all page modules in parallel.
 * 5. Register PWA Service Worker.
 */
import '../css/style.css';

import { initThemeToggle } from '../components/ThemeToggle.js';
import { initLoader } from '../components/Loader.js';
import { initHeroCanvas } from '../components/HeroCanvas.js';
import { initHeaderScroll, initMobileNav, initActiveNavLinks, initAuthNav } from '../components/Navigation.js';
import { initScrollAnimations } from '../components/Animations.js';
import { initGallery } from '../components/Gallery.js';
import { initGalleryFilter } from '../components/GalleryFilter.js';
import { initVideoPlayer } from '../components/VideoPlayer.js';
import { initPricing } from '../components/Pricing.js';
import { initContactForm } from '../components/ContactForm.js';
import { initDashboardManager } from '../components/dashboards/DashboardManager.js';
import { initAIAssistant } from '../components/ai/AIAssistant.js';
import { initExerciseLibrary } from '../components/ExerciseLibrary.js';
import { initFAQ } from '../components/FAQ.js';
import { initAuthModal } from '../components/auth/AuthModal.js';
import { initAuth } from '../utils/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Phase 1 — Immediate UI (non-blocking)
  initThemeToggle();
  initLoader();
  initHeroCanvas();
  initHeaderScroll();
  initMobileNav();
  initScrollAnimations();
  initVideoPlayer();
  initActiveNavLinks();
  initGallery();
  initGalleryFilter();
  initPricing();
  initContactForm();
  initAIAssistant();
  initExerciseLibrary();
  initFAQ();

  // Phase 2 — Auth Bootstrap (async session restore)
  // initAuthModal must come before initAuth so the modal exists when DashboardManager tries to open it
  initAuthModal();

  // Try to restore session from HttpOnly refresh token cookie
  // This is a silent background fetch — does not block UI rendering
  await initAuth();

  // Phase 3 — Auth-aware modules (requires auth state resolved)
  initAuthNav();         // Render Login/Register or User Badge in nav
  initDashboardManager(); // Dashboard with RBAC guards

  // Phase 4 — PWA Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    });
  }
});
