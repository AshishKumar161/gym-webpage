/**
 * ContactForm Component — Form validation and interactive toast feedback.
 */
import { qs } from '../utils/dom.js';

export function initContactForm() {
  const form = qs('#contact-form');
  const toast = qs('#toast');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = qs('#form-name')?.value.trim();
    const phone = qs('#form-phone')?.value.trim();
    const message = qs('#form-message')?.value.trim();

    if (!name || !phone) {
      alert('Please fill in your name and phone number.');
      return;
    }

    // Trigger WhatsApp redirect or toast feedback
    if (toast) {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 4000);
    }

    const waText = encodeURIComponent(`Hi! My name is ${name}. Phone: ${phone}. Note: ${message || 'Interested in joining A² ReVamp Gym!'}`);
    window.open(`https://wa.me/918010844560?text=${waText}`, '_blank', 'noopener');
    form.reset();
  });
}
