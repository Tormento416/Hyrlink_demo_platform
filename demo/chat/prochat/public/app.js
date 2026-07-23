/* ============================================
   app.js - AI Resume Chatbot Frontend
   Handles UI, conversation memory (last 24 turns),
   and communication with /api/chat
   ============================================ */

(function () {
  const MAX_HISTORY = 24;
  const conversationHistory = [];

  const messagesEl = document.getElementById('chatMessages');
  const inputEl    = document.getElementById('userInput');
  const sendBtn    = document.getElementById('sendBtn');

  function appendMessage(role, text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'message ' + role;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    wrapper.appendChild(bubble);
    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const wrapper = document.createElement('div');
    wrapper.className = 'message bot';
    wrapper.id = 'typingIndicator';
    const bubble = document.createElement('div');
    bubble.className = 'bubble typing-bubble';
    bubble.innerHTML = '<span></span><span></span><span></span>';
    wrapper.appendChild(bubble);
    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  function buildHistoryBlock() {
    if (conversationHistory.length === 0) return '';
    return conversationHistory
      .slice(-MAX_HISTORY)
      .map(function(m) {
        return (m.role === 'user' ? 'User' : 'Assistant') + ': ' + m.text;
      })
      .join('\n');
  }

  function setLoading(isLoading) {
    sendBtn.disabled = isLoading;
    inputEl.disabled = isLoading;
    sendBtn.textContent = isLoading ? '...' : 'Send';
  }

  async function sendMessage() {
    var message = inputEl.value.trim();
    if (!message) return;
    inputEl.value = '';
    appendMessage('user', message);
    conversationHistory.push({ role: 'user', text: message });
    setLoading(true);
    showTyping();
    try {
      var response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message, history: buildHistoryBlock() })
      });
      removeTyping();
      if (!response.ok) {
        appendMessage('bot', 'Sorry, something went wrong. Please try again.');
      } else {
        var data = await response.json();
        var reply = data.reply || 'No response received.';
        appendMessage('bot', reply);
        conversationHistory.push({ role: 'bot', text: reply });
      }
    } catch (err) {
      removeTyping();
      appendMessage('bot', 'Network error. Please check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
      inputEl.focus();
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  inputEl.focus();
})();
