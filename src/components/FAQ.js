/**
 * FAQ Component — Searchable accordion questions and answers.
 */
import { qsa } from '../utils/dom.js';

export function initFAQ() {
  const faqItems = qsa('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
}
