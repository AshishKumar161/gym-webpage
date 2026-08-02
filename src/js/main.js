/**
 * Main Entry Point — A² ReVamp Gym SaaS Enterprise Platform
 * Imports master design system, initialises UI components, AI Assistant, Exercise Library, Dashboards & PWA Service Worker.
 */
import '../css/style.css';

import { initThemeToggle } from '../components/ThemeToggle.js';
import { initLoader } from '../components/Loader.js';
import { initHeroCanvas } from '../components/HeroCanvas.js';
import { initHeaderScroll, initMobileNav, initActiveNavLinks } from '../components/Navigation.js';
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

document.addEventListener('DOMContentLoaded', () => {
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
  initDashboardManager();
  initAIAssistant();
  initExerciseLibrary();
  initFAQ();

  // Register PWA Service Worker for offline support & caching
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    });
  }
});
