// === Переключение темы ===
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
  }
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const dark = document.body.classList.contains('dark');
    themeToggle.textContent = dark ? '☀️' : '🌙';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  });
}

// Переход с главной на тренажёр
const startBtn = document.getElementById('startBtn');
if (startBtn) startBtn.addEventListener('click', () => location.href = 'trainer.html');

// ==== ЛОГИКА ТРЕНАЖЁРА ====
// Элементы (будут null на главной — это ок)
const wordEl          = document.getElementById('englishWord');
const transcriptionEl = document.getElementById('transcription');
const translationEl   = document.getElementById('translation');
const newWordBtn      = document.getElementById('newWordBtn');
const speakBtn        = document.getElementById('speakBtn');

let DICT = [];

// грузим словарь из JSON (без кэша)
async function loadDict() {
  if (DICT.length) return DICT;
  const res = await fetch('dictionary.json?ts=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Не удалось загрузить dictionary.json');
  DICT = await res.json();
  return DICT;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function showRandomWord() {
  // если мы не на странице тренажёра — просто выходим
  if (!wordEl || !transcriptionEl || !translationEl) return;
  const dict = await loadDict();
  const item = pickRandom(dict);
  wordEl.textContent          = item.en;
  transcriptionEl.textContent = item.ipa || '';
  translationEl.textContent   = item.ru  || '';
}

// Озвучка (Web Speech API)
let voices = [];
function loadVoices() {
  voices = window.speechSynthesis.getVoices() || [];
}
window.speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

function speak(text) {
  if (!text) return;
  const u = new SpeechSynthesisUtterance(text);
  const enVoice = voices.find(v => v.lang?.toLowerCase().startsWith('en-')) || null;
  if (enVoice) u.voice = enVoice;
  u.lang = enVoice?.lang || 'en-US';
  u.rate = 0.95;
  u.pitch = 1.0;
  u.volume = 1.0;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// обработчики — только если элементы есть (на тренажёре)
if (newWordBtn) newWordBtn.addEventListener('click', showRandomWord);
if (speakBtn)   speakBtn.addEventListener('click', () => speak(wordEl?.textContent?.trim()));

// показать слово при открытии тренажёра
showRandomWord().catch(console.error);
