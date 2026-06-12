// app/app.js
import { resolveIntent } from './actions.js';

const chatWindow = document.getElementById('chatWindow');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');

function loadHistory() {
  const stored = localStorage.getItem('irisChat');
  if (stored) {
    const messages = JSON.parse(stored);
    messages.forEach(renderMessage);
  }
}

function saveMessage(role, text) {
  const stored = localStorage.getItem('irisChat');
  const messages = stored ? JSON.parse(stored) : [];
  messages.push({ role, text });
  localStorage.setItem('irisChat', JSON.stringify(messages));
}

function renderMessage({ role, text }) {
  const div = document.createElement('div');
  div.className = role === 'user' ? 'msg user' : 'msg bot';
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;
  renderMessage({ role: 'user', text });
  saveMessage('user', text);
  userInput.value = '';
  // Bot response
  const response = await resolveIntent(text);
  renderMessage({ role: 'bot', text: response });
  saveMessage('bot', response);
});

// Theme toggle (optional)
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  });
}

loadHistory();
