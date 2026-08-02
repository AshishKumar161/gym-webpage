/**
 * Animations Component — GSAP scroll reveals, parallax image effects,
 * VanillaTilt 3D cards, and button ripple effects.
 */
import { gsap } from 'gsap';
import VanillaTilt from 'vanilla-tilt';
import { qsa } from '../utils/dom.js';

export function initScrollAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize VanillaTilt on interactive cards
  const tiltElements = qsa('.feature-card, .plan-card, .transform-card, .trainer-card, .contact-card');
  if (tiltElements.length && !prefersReducedMotion) {
    VanillaTilt.init(tiltElements, {
      max: 8,
      speed: 400,
      glare: true,
      'max-glare': 0.15,
      scale: 1.02
    });
  }

  // Ripple effect on buttons
  qsa('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const circle = document.createElement('span');
      circle.classList.add('ripple-effect');
      circle.style.left = `${x}px`;
      circle.style.top = `${y}px`;

      this.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  });

  if (prefersReducedMotion) {
    qsa('.fade-up').forEach(el => el.classList.add('visible'));
    return;
  }

  // GSAP Entrance Animations
  gsap.from('.hero-title', {
    duration: 1.2,
    y: 40,
    opacity: 0,
    ease: 'power3.out',
    delay: 0.2
  });

  gsap.from('.hero-subtitle', {
    duration: 1,
    y: 30,
    opacity: 0,
    ease: 'power3.out',
    delay: 0.4
  });

  gsap.from('.hero-actions', {
    duration: 1,
    y: 30,
    opacity: 0,
    ease: 'power3.out',
    delay: 0.6
  });

  // IntersectionObserver reveal fallback for section elements
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  qsa('.fade-up').forEach(el => observer.observe(el));
}
