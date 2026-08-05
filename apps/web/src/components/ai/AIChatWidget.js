import { safeFetchApi } from '../../utils/auth.js';

export class AIChatWidget {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.isOpen = false;
    this.messages = [];
    this.render();
    this.attachEvents();
  }

  render() {
    this.container.innerHTML = `
      <div id="ai-chat-toggle" style="position:fixed; bottom:2rem; right:2rem; width:60px; height:60px; border-radius:50%; background:var(--primary); color:#000; display:flex; align-items:center; justify-content:center; font-size:1.5rem; cursor:pointer; box-shadow:0 10px 20px rgba(0,0,0,0.3); z-index:9999; transition:all 0.3s ease;">
        🤖
      </div>
      
      <div id="ai-chat-window" class="glass-card" style="position:fixed; bottom:6rem; right:2rem; width:350px; height:500px; display:none; flex-direction:column; z-index:9998; overflow:hidden; border:1px solid rgba(255,255,255,0.1); box-shadow:0 15px 30px rgba(0,0,0,0.5);">
        <div style="background:var(--primary); color:#000; padding:1rem; display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-family:var(--font-display); font-size:1.1rem;">A² ReVamp Copilot</h3>
          <button id="ai-chat-close" style="background:transparent; border:none; color:#000; font-size:1.2rem; cursor:pointer;">&times;</button>
        </div>
        
        <div id="ai-chat-messages" style="flex:1; padding:1rem; overflow-y:auto; display:flex; flex-direction:column; gap:1rem; background:rgba(0,0,0,0.4);">
          <div style="align-self:flex-start; background:rgba(255,255,255,0.1); padding:0.8rem 1rem; border-radius:12px; max-width:85%; font-size:0.9rem;">
            Hi there! I'm your AI Fitness Copilot. Ask me about workouts, diets, or gym details!
          </div>
        </div>

        <div style="padding:1rem; border-top:1px solid rgba(255,255,255,0.1); background:var(--bg-secondary); display:flex; gap:0.5rem;">
          <input type="text" id="ai-chat-input" class="form-control" placeholder="Ask something..." style="flex:1; padding:0.6rem; font-size:0.9rem;" />
          <button id="ai-chat-send" class="btn btn-primary" style="padding:0 1rem; font-size:0.9rem;">Send</button>
        </div>
      </div>
    `;
  }

  attachEvents() {
    const toggle = document.getElementById('ai-chat-toggle');
    const close = document.getElementById('ai-chat-close');
    const windowEl = document.getElementById('ai-chat-window');
    const sendBtn = document.getElementById('ai-chat-send');
    const inputEl = document.getElementById('ai-chat-input');

    toggle.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      windowEl.style.display = this.isOpen ? 'flex' : 'none';
      if (this.isOpen) inputEl.focus();
    });

    close.addEventListener('click', () => {
      this.isOpen = false;
      windowEl.style.display = 'none';
    });

    const handleSend = async () => {
      const text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = '';

      this.addMessage(text, 'user');
      this.showTypingIndicator();

      try {
        const res = await safeFetchApi('/ai/chat', {
          method: 'POST',
          body: JSON.stringify({ message: text })
        });
        this.removeTypingIndicator();
        this.addMessage(res.data.text, 'ai');
      } catch (err) {
        this.removeTypingIndicator();
        this.addMessage('Sorry, I encountered an error answering that.', 'ai');
      }
    };

    sendBtn.addEventListener('click', handleSend);
    inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  addMessage(text, sender) {
    const msgsContainer = document.getElementById('ai-chat-messages');
    const div = document.createElement('div');
    
    // Basic markdown bold/italic support (we can expand this later)
    const formattedText = text.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>').replace(/\\*(.*?)\\*/g, '<em>$1</em>').replace(/\\n/g, '<br/>');

    if (sender === 'user') {
      div.style.cssText = `align-self:flex-end; background:var(--accent-cyan); color:#000; padding:0.8rem 1rem; border-radius:12px; max-width:85%; font-size:0.9rem;`;
    } else {
      div.style.cssText = `align-self:flex-start; background:rgba(255,255,255,0.1); padding:0.8rem 1rem; border-radius:12px; max-width:85%; font-size:0.9rem;`;
    }
    
    div.innerHTML = formattedText;
    msgsContainer.appendChild(div);
    msgsContainer.scrollTop = msgsContainer.scrollHeight;
  }

  showTypingIndicator() {
    const msgsContainer = document.getElementById('ai-chat-messages');
    const div = document.createElement('div');
    div.id = 'ai-typing-indicator';
    div.style.cssText = `align-self:flex-start; background:rgba(255,255,255,0.1); padding:0.8rem 1rem; border-radius:12px; max-width:85%; font-size:0.9rem; font-style:italic; color:var(--text-secondary);`;
    div.textContent = 'Typing...';
    msgsContainer.appendChild(div);
    msgsContainer.scrollTop = msgsContainer.scrollHeight;
  }

  removeTypingIndicator() {
    const indicator = document.getElementById('ai-typing-indicator');
    if (indicator) indicator.remove();
  }
}
