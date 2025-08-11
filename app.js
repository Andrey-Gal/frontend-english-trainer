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

/* ====== Учебник: словарь для HTML базовой разметки ====== */
const dictionary_html = [
  { en: "markup",        ipa: "/ˈmɑːkʌp/",      ru: "разметка", tag: "HTML" },
  { en: "element",       ipa: "/ˈelɪmənt/",     ru: "элемент", tag: "HTML" },
  { en: "attribute",     ipa: "/ˈætrɪbjuːt/",   ru: "атрибут", tag: "HTML" },
  { en: "header",        ipa: "/ˈhedə(r)/",     ru: "шапка", tag: "layout" },
  { en: "main",          ipa: "/meɪn/",         ru: "основная область", tag: "layout" },
  { en: "footer",        ipa: "/ˈfʊtə(r)/",     ru: "подвал", tag: "layout" },
  { en: "paragraph",     ipa: "/ˈpærəɡrɑːf/",   ru: "абзац", tag: "text" },
  { en: "heading",       ipa: "/ˈhedɪŋ/",       ru: "заголовок", tag: "text" },
  { en: "doctype",       ipa: "/ˈdɒktaɪp/",     ru: "тип документа", tag: "meta" },
  { en: "metadata",      ipa: "/ˈmetəˌdeɪtə/",  ru: "метаданные", tag: "meta" },
  { en: "language",      ipa: "/ˈlæŋɡwɪdʒ/",    ru: "язык", tag: "meta" }
];

/* ====== Рендер словаря и фильтрация ====== */
(function initLearnPage(){
  const dictList = document.getElementById('dictList');
  const dictSearch = document.getElementById('dictSearch');
  const dictTpl = document.getElementById('dictItemTpl');

  if (!dictList || !dictTpl) return; // мы не на learn.html

  let current = dictionary_html.slice();

  function render(list){
    dictList.innerHTML = '';
    list.forEach(item => {
      const clone = dictTpl.content.cloneNode(true);
      clone.querySelector('.en').textContent = item.en;
      clone.querySelector('.ipa').textContent = item.ipa || '';
      clone.querySelector('.ru').textContent = item.ru;
      clone.querySelector('.tag').textContent = item.tag || '';

      // озвучка
      clone.querySelector('.speak').addEventListener('click', () => speak(item.en));
      dictList.appendChild(clone);
    });
  }

  function filterByQuery(q){
    q = q.trim().toLowerCase();
    if (!q) return dictionary_html.slice();
    return dictionary_html.filter(it =>
      it.en.toLowerCase().includes(q) ||
      (it.ru && it.ru.toLowerCase().includes(q)) ||
      (it.tag && it.tag.toLowerCase().includes(q))
    );
  }

  dictSearch.addEventListener('input', () => {
    current = filterByQuery(dictSearch.value);
    render(current);
  });

  render(current);
})();

/* ====== Песочница: запуск кода в iframe ====== */
(function initSandbox(){
  const btn = document.getElementById('runCode');
  const edHtml = document.getElementById('edHtml');
  const edCss  = document.getElementById('edCss');
  const edJs   = document.getElementById('edJs');
  const frame  = document.getElementById('resultFrame');
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

/* ====== Озвучка (используем ту же, что и на тренажёре) ====== */
let __voices = [];
window.speechSynthesis?.addEventListener('voiceschanged', () => {
  __voices = window.speechSynthesis.getVoices() || [];
});
__voices = window.speechSynthesis?.getVoices?.() || [];

function speak(text){
  if (!window.speechSynthesis || !text) return;
  const u = new SpeechSynthesisUtterance(text);
  const v = __voices.find(v => v.lang?.toLowerCase().startsWith('en')) || null;
  if (v) u.voice = v;
  u.lang = v?.lang || 'en-US';
  u.rate = 0.95; u.pitch = 1; u.volume = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

