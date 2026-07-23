// Generic frontend logic

const INTRO_TEXT = "Welcome. Ask me anything about this candidate's experience, work, or career goals.";

let conversationHistory = [];
let isTyping = false;
let candidateProfile = null;

// --- Typewriter intro on load ---
function typewriterIntro(text, el, speed = 28) {
  let i = 0;
  el.innerHTML = '';
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  el.appendChild(cursor);
  const interval = setInterval(() => {
    if (i < text.length) {
      el.insertBefore(document.createTextNode(text[i]), cursor);
      i++;
    } else {
      clearInterval(interval);
      cursor.remove();
    }
  }, speed);
}

window.addEventListener('DOMContentLoaded', () => {
  const introEl = document.getElementById('intro-text');
  setTimeout(() => typewriterIntro(INTRO_TEXT, introEl), 400);

  setupIntakeForm();
  setChatEnabled(false);

  // FIX 1: Use event listener on input directly - no closure capture
  document.getElementById('user-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});

function setupIntakeForm() {
  const form = document.getElementById('intake-form');
  const status = document.getElementById('intake-status');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('candidate-name').value.trim();
    const email = document.getElementById('candidate-email').value.trim();
    const phone = document.getElementById('candidate-phone').value.trim();
    const resume = document.getElementById('candidate-resume').value.trim();

    if (!name || !email || !resume) {
      status.textContent = 'Please provide name, email, and resume before continuing.';
      return;
    }

    candidateProfile = { name, email, phone, resume };
    status.textContent = 'Saved. You can start the conversation now.';
    setChatEnabled(true);

    const intakePanel = document.getElementById('intake-panel');
    intakePanel.style.display = 'none';

    appendAssistantMessage('Profile received. I am ready to discuss your background.');
  });
}

function setChatEnabled(enabled) {
  document.getElementById('user-input').disabled = !enabled;
  document.getElementById('send-btn').disabled = !enabled;
  document.getElementById('jd-toggle').disabled = !enabled;
  document.getElementById('analyze-btn').disabled = !enabled;
  document.getElementById('prompt-chips').style.display = enabled ? 'flex' : 'none';
  document.getElementById('user-input').placeholder = enabled ? 'Ask me anything...' : 'Complete the questionnaire to begin';
}

// --- Chip buttons ---
// FIX 1: sendChip always reads fresh from DOM, then calls sendMessage
function sendChip(btn) {
  const text = btn.textContent.trim();
  const input = document.getElementById('user-input');
  input.value = text;
  input.dispatchEvent(new Event('input'));
  sendMessage();
}
// --- JD panel toggle ---
function toggleJD() {
  const panel = document.getElementById('jd-panel');
  const toggle = document.getElementById('jd-toggle');
  panel.classList.toggle('hidden');
  toggle.style.color = panel.classList.contains('hidden') ? '' : '#4a9eff';
  toggle.style.borderColor = panel.classList.contains('hidden') ? '' : '#4a9eff44';
}

function switchTab(tab) {
  const pasteContent = document.getElementById('jd-paste-content');
  const urlContent = document.getElementById('jd-url-content');
  const tabPaste = document.getElementById('tab-paste');
  const tabUrl = document.getElementById('tab-url');
  if (tab === 'paste') {
    pasteContent.style.display = '';
    urlContent.style.display = 'none';
    tabPaste.classList.add('active');
    tabUrl.classList.remove('active');
  } else {
    pasteContent.style.display = 'none';
    urlContent.style.display = '';
    tabPaste.classList.remove('active');
    tabUrl.classList.add('active');
  }
}

// --- JD Analyzer ---
async function analyzeJD() {
  if (!candidateProfile) return;

  const textarea = document.getElementById('jd-textarea');
  const urlInput = document.getElementById('jd-url-input');
  const pasteVisible = document.getElementById('jd-paste-content').style.display !== 'none';
  let jdContent = pasteVisible ? textarea.value.trim() : urlInput.value.trim();
  if (!jdContent) return;

  // FIX 3: Detect LinkedIn URLs and block - LinkedIn prevents server-side scraping
  if (!pasteVisible && /linkedin\.com/i.test(jdContent)) {
    appendAssistantMessage('LinkedIn blocks automated access to job postings. To analyze this role, copy the job description text and paste it into the "Paste JD" tab instead.');
    return;
  }

  toggleJD();
  const userMsg = pasteVisible
    ? 'Analyze how my experience fits this job description:\n\n' + jdContent
    : 'Analyze how my experience fits the job at: ' + jdContent;
  appendUserMessage('Analyzing job description fit...');
  const thinkingEl = appendThinking();
  setSendDisabled(true);
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jdContent, isUrl: !pasteVisible, profile: candidateProfile })
    });
    const data = await res.json();
    thinkingEl.remove();
    if (data.reply) {
      appendAssistantMessage(data.reply);
      conversationHistory.push({ role: 'user', text: userMsg });
      conversationHistory.push({ role: 'assistant', text: data.reply });
    } else {
      appendAssistantMessage('Something went wrong analyzing that JD. Try pasting the text directly.');
    }
  } catch (err) {
    thinkingEl.remove();
    appendAssistantMessage('Had trouble reaching the server. Try again in a moment.');
  }
  setSendDisabled(false);
  textarea.value = '';
  urlInput.value = '';
}

// --- Main chat send ---
// FIX 1: Always read input fresh from DOM - no stale closure
async function sendMessage() {
  if (!candidateProfile) return;

  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (!message || isTyping) return;
  input.value = '';
  appendUserMessage(message);
  const thinkingEl = appendThinking();
  setSendDisabled(true);
  isTyping = true;
  // Hide chips after first message
  document.getElementById('prompt-chips').style.display = 'none';
  const history = conversationHistory
    .map(m => (m.role === 'user' ? 'User: ' : 'Assistant: ') + m.text)
    .join('\n');
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, profile: candidateProfile })
    });
    const data = await res.json();
    thinkingEl.remove();
    if (data.reply) {
      appendAssistantMessage(data.reply);
      conversationHistory.push({ role: 'user', text: message });
      conversationHistory.push({ role: 'assistant', text: data.reply });
    } else {
      appendAssistantMessage('Something went wrong on my end. Try again.');
    }
  } catch (err) {
    thinkingEl.remove();
    appendAssistantMessage('Had trouble connecting. Try again in a moment.');
  }
  isTyping = false;
  setSendDisabled(false);
}

// --- DOM helpers ---
function appendUserMessage(text) {
  const msgs = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'msg-user';
  div.innerHTML = '<div class="bubble">' + escapeHtml(text) + '</div>';
  msgs.appendChild(div);
  scrollToBottom();
}

// FIX 2: Render markdown from AI responses (bold, headers, bullets)
function renderMarkdown(text) {
  // Escape HTML first to prevent injection
  let safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Convert ### headings
  safe = safe.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  // Convert ## headings
  safe = safe.replace(/^##\s+(.+)$/gm, '<h3>$1</h3>');
  // Convert **bold**
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Convert *italic*
  safe = safe.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Convert - bullet lines into list items
  safe = safe.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
  // Wrap consecutive <li> items in <ul>
  safe = safe.replace(/(<li>.*<\/li>\n?)+/g, (match) => '<ul>' + match + '</ul>');
  // Convert double newlines to paragraph breaks
  const blocks = safe.split(/\n\n+/);
  return blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    // Don't wrap already-tagged blocks
    if (/^<(h[1-6]|ul|ol|li)/.test(block)) return block;
    return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
  }).join('');
}

function appendAssistantMessage(text) {
  const msgs = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'msg-assistant';
  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = 'Assistant';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  // FIX 2: Use markdown renderer instead of plain escapeHtml
  bubble.innerHTML = renderMarkdown(text);
  div.appendChild(label);
  div.appendChild(bubble);
  msgs.appendChild(div);
  scrollToBottom();
}

function appendThinking() {
  const msgs = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'msg-assistant';
  div.innerHTML = '<span class="label">Assistant</span><div class="bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>';
  msgs.appendChild(div);
  scrollToBottom();
  return div;
}

function setSendDisabled(val) {
  document.getElementById('send-btn').disabled = val;
  document.getElementById('analyze-btn').disabled = val;
}

function scrollToBottom() {
  const msgs = document.getElementById('chat-messages');
  msgs.scrollTop = msgs.scrollHeight;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
