/**
 * AIAssistant Component — Floating Glassmorphic AI Fitness Chatbot Widget.
 */
import { qs } from '../../utils/dom.js';

export function initAIAssistant() {
  const toggleBtn = qs('#ai-assistant-toggle');
  const chatWidget = qs('#ai-assistant-widget');
  const closeBtn = qs('#ai-chat-close');
  const form = qs('#ai-chat-form');
  const input = qs('#ai-chat-input');
  const body = qs('#ai-chat-messages');

  if (!toggleBtn || !chatWidget) return;

  toggleBtn.addEventListener('click', () => {
    chatWidget.classList.toggle('active');
  });

  closeBtn?.addEventListener('click', () => {
    chatWidget.classList.remove('active');
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    // Append User message
    appendMessage('user', text);
    input.value = '';

    // Typing indicator
    const typingId = appendMessage('bot', 'AI is thinking...', true);

    setTimeout(() => {
      document.getElementById(typingId)?.remove();
      const query = text.toLowerCase();
      let reply = "I'm your A² Gym AI Assistant! I can help you with workout splits, diet plans, gym timings, and membership options.";

      if (query.includes('protein') || query.includes('diet') || query.includes('eat')) {
        reply = "For muscle building, aim for 1.6 - 2.2g of protein per kg of body weight daily. Combine whey, eggs, chicken breast, or paneer!";
      } else if (query.includes('workout') || query.includes('chest') || query.includes('legs')) {
        reply = "A Push/Pull/Legs 6-day split is ideal for mass gain! Focus on compound lifts like bench press, squats, and deadlifts.";
      } else if (query.includes('timing') || query.includes('hours')) {
        reply = "A² ReVamp Gym is open Mon-Sat: 6:00 AM - 10:30 AM (Morning) & 5:00 PM - 9:30 PM (Evening). Closed on Sundays.";
      } else if (query.includes('price') || query.includes('membership')) {
        reply = "Monthly: ₹999 | Quarterly: ₹2,499 (Best Value) | Yearly: ₹7,999 (Includes free pool & sauna access).";
      }

      appendMessage('bot', reply);
    }, 800);
  });

  function appendMessage(sender, text, isTyping = false) {
    const id = `msg-${Date.now()}-${Math.random()}`;
    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.className = `ai-msg ai-msg-${sender}`;
    msgDiv.innerHTML = `<span>${text}</span>`;
    body.appendChild(msgDiv);
    body.scrollTop = body.scrollHeight;
    return id;
  }
}
