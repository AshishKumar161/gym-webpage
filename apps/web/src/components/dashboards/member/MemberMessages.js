import { safeFetchApi, getCurrentUser } from '../../../utils/auth.js';

export async function renderMemberMessages() {
  let contacts = [];
  try {
    const res = await safeFetchApi('/communication/messages/contacts');
    contacts = res.data || [];
  } catch (err) {}

  window.loadConversation = async (contactId, contactName) => {
    const chatBox = document.getElementById('chat-history');
    chatBox.innerHTML = '<div style="text-align:center; padding: 2rem;">Loading...</div>';
    
    document.getElementById('chat-header-name').textContent = contactName;
    document.getElementById('message-form-container').style.display = 'block';
    document.getElementById('chat-form').setAttribute('data-receiver', contactId);

    try {
      const res = await safeFetchApi(`/communication/messages/conversation/${contactId}`);
      const messages = res.data || [];
      const user = getCurrentUser();

      if (messages.length === 0) {
        chatBox.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-secondary);">No messages yet. Say hi!</div>';
        return;
      }

      chatBox.innerHTML = messages.map(m => {
        const isMe = m.senderId === user.id;
        return `
          <div style="display:flex; flex-direction:column; align-items: ${isMe ? 'flex-end' : 'flex-start'}; margin-bottom:1rem;">
            <div style="background: ${isMe ? 'var(--accent-cyan)' : 'var(--bg-surface-2)'}; color: ${isMe ? '#fff' : 'var(--text)'}; padding: 0.8rem 1rem; border-radius: var(--r-md); max-width: 80%; border-bottom-${isMe ? 'right' : 'left'}-radius: 0;">
              ${m.content}
            </div>
            <span style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">${new Date(m.createdAt).toLocaleTimeString()}</span>
          </div>
        `;
      }).join('');
      chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
      chatBox.innerHTML = '<div style="text-align:center; padding: 2rem; color: #ef4444;">Failed to load messages</div>';
    }
  };

  window.sendMessageToContact = async (e) => {
    e.preventDefault();
    const form = e.target;
    const receiverId = form.getAttribute('data-receiver');
    const input = document.getElementById('chat-input');
    const content = input.value.trim();

    if (!receiverId || !content) return;

    input.disabled = true;
    try {
      await safeFetchApi('/communication/messages', {
        method: 'POST',
        body: JSON.stringify({ receiverId, content })
      });
      input.value = '';
      window.loadConversation(receiverId, document.getElementById('chat-header-name').textContent);
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    } finally {
      input.disabled = false;
      input.focus();
    }
  };

  return `
    <h2 class="dash-header-title">Messages</h2>
    <p class="dash-subtitle">Communicate with your trainer and gym admins.</p>

    <div style="display:flex; gap: 1.5rem; margin-top:2rem; height: 600px;">
      
      <!-- Contacts List -->
      <div class="glass-card" style="width: 300px; display:flex; flex-direction:column; overflow:hidden;">
        <div style="padding: 1rem; border-bottom: 1px solid var(--border);">
          <strong style="font-family:var(--font-display);">Contacts</strong>
        </div>
        <div style="flex:1; overflow-y:auto; padding:0.5rem;">
          ${contacts.map(c => `
            <div onclick="window.loadConversation('${c.id}', '${c.name}')" class="notif-item" style="padding:1rem; border-radius:var(--r-sm); cursor:pointer; display:flex; gap:1rem; align-items:center;">
              <div style="width:40px; height:40px; border-radius:50%; background:var(--bg-surface-3); display:flex; align-items:center; justify-content:center; font-weight:800;">
                ${c.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong style="display:block; font-size:0.95rem;">${c.name}</strong>
                <span style="font-size:0.8rem; color:var(--text-secondary); text-transform:capitalize;">${c.role.toLowerCase()}</span>
              </div>
            </div>
          `).join('')}
          ${contacts.length === 0 ? `<div style="padding:2rem; text-align:center; color:var(--text-secondary);">No contacts found.<br><br><small>Admins and Trainers will appear here once they message you, or you are assigned to them.</small></div>` : ''}
        </div>
      </div>

      <!-- Chat Area -->
      <div class="glass-card" style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
        <div style="padding: 1rem; border-bottom: 1px solid var(--border); display:flex; align-items:center; gap:1rem;">
          <strong id="chat-header-name" style="font-family:var(--font-display); font-size:1.1rem;">Select a contact</strong>
        </div>
        
        <div id="chat-history" style="flex:1; padding:1.5rem; overflow-y:auto; display:flex; flex-direction:column;">
          <div style="margin: auto; color: var(--text-secondary); text-align:center;">
            <div style="font-size:3rem; margin-bottom:1rem;">✉️</div>
            Select a contact to start messaging
          </div>
        </div>

        <div id="message-form-container" style="padding: 1rem; border-top: 1px solid var(--border); display:none;">
          <form id="chat-form" onsubmit="window.sendMessageToContact(event)" style="display:flex; gap:0.5rem;">
            <input type="text" id="chat-input" class="form-control" placeholder="Type a message..." required autocomplete="off" style="flex:1;" />
            <button type="submit" class="btn btn-primary">Send</button>
          </form>
        </div>
      </div>
    </div>
  `;
}
