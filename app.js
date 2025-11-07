// === Тема (светлая/тёмная) ===
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

// === Кнопка со стартовой на тренажёр (если есть) ===
const startBtn = document.getElementById('startBtn');
if (startBtn) startBtn.addEventListener('click', () => (location.href = 'trainer.html'));

// === Общий загрузчик словаря из JSON (без кэша) ===
let DICT_CACHE = [];
async function loadDict() {
  if (DICT_CACHE.length) return DICT_CACHE;
  const res = await fetch('dictionary.json?ts=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Не удалось загрузить dictionary.json');
  DICT_CACHE = await res.json();
  return DICT_CACHE;
}

// === Озвучка (Web Speech) — общая для тренажёра и словаря ===
let voices = [];
function refreshVoices() {
  voices = window.speechSynthesis?.getVoices?.() || [];
}
window.speechSynthesis?.addEventListener?.('voiceschanged', refreshVoices);
refreshVoices();

function speak(text) {
  if (!text || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  const v = voices.find(v => v.lang?.toLowerCase().startsWith('en')) || null;
  if (v) u.voice = v;
  u.lang = v?.lang || 'en-US';
  u.rate = 0.95;
  u.pitch = 1.0;
  u.volume = 1.0;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// === ТРЕНАЖЁР (trainer.html) ===
const wordEl          = document.getElementById('englishWord');
const transcriptionEl = document.getElementById('transcription');
const translationEl   = document.getElementById('translation');
const newWordBtn      = document.getElementById('newWordBtn');
const speakBtn        = document.getElementById('speakBtn');

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function showRandomWord() {
  if (!wordEl || !transcriptionEl || !translationEl) return; // не на странице тренажёра
  const dict = await loadDict();
  const item = pickRandom(dict);
  wordEl.textContent          = item.en || '';
  transcriptionEl.textContent = item.ipa || '';
  translationEl.textContent   = item.ru || '';
}

if (newWordBtn) newWordBtn.addEventListener('click', showRandomWord);
if (speakBtn)   speakBtn.addEventListener('click', () => speak(wordEl?.textContent?.trim()));
showRandomWord().catch(console.error);

// === СЛОВАРЬ В УЧЕБНИКЕ (learn.html) — грузим из dictionary.json ===
(function initLearnDict() {
  const dictPanel = document.querySelector('.panel.dict');
  if (!dictPanel) return; // не на learn.html

  const tabs   = dictPanel.querySelectorAll('.dict-tab'); // кнопки HTML/CSS/JS
  const search = document.getElementById('dictSearch');
  const list   = document.getElementById('dictList');

  let topic = 'html';
  const activeTab = dictPanel.querySelector('.dict-tab.active');
  if (activeTab) topic = (activeTab.dataset.topic || 'html').toLowerCase();

  function match(item, q) {
    const en  = (item.en || '').toLowerCase();
    const ru  = (item.ru || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    return en.includes(q) || ru.includes(q) || cat.includes(q);
  }

  async function render() {
    if (!list) return;
    const all = await loadDict();
    const q = (search?.value || '').trim().toLowerCase();
    const filteredByTopic = all.filter(w => (w.category || '').toLowerCase() === topic);
    const data = q ? filteredByTopic.filter(w => match(w, q)) : filteredByTopic;

    list.innerHTML = data
      .sort((a, b) => a.en.localeCompare(b.en))
      .map(it => `
        <li class="dict-item">
          <div class="word">
            <span class="en">${it.en}</span>
            <span class="ipa">${it.ipa || ''}</span>
            <button class="speak" type="button" data-word="${it.en}" title="Произнести">🔊</button>
          </div>
          <div class="ru">${it.ru || ''}</div>
          <div class="tag">${(it.category || '').toUpperCase()}</div>
        </li>
      `).join('') || `<li class="dict-item">Ничего не найдено</li>`;

    list.querySelectorAll('.speak').forEach(btn => {
      btn.onclick = () => speak(btn.dataset.word);
    });
  }

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      topic = (btn.dataset.topic || 'html').toLowerCase(); // html | css | js
      render().catch(console.error);
    });
  });

  if (search) search.addEventListener('input', () => render().catch(console.error));
  render().catch(console.error);
})();

// === Песочница на learn.html (запуск кода) ===
(function initSandbox() {
  const btn   = document.getElementById('runCode');
  const edHtml= document.getElementById('edHtml');
  const edCss = document.getElementById('edCss');
  const edJs  = document.getElementById('edJs');
  const frame = document.getElementById('resultFrame');
  if (!btn || !edHtml || !edCss || !edJs || !frame) return;

  btn.addEventListener('click', () => {
    const html = edHtml.value || '';
    const css  = `<style>${edCss.value || ''}</style>`;
    const js   = `<script>(function(){try{${edJs.value || ''}}catch(e){console.error(e)}})();<\/script>`;

    const doc = frame.contentDocument || frame.contentWindow.document;
    doc.open();
    doc.write(`${html}\n${css}\n${js}`);
    doc.close();
  });
})();
