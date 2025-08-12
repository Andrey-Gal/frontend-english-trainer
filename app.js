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

/* ====== СЛОВАРИ: HTML / CSS / JS ====== */
const DICT_HTML = [
  { en:"markup",    ipa:"/ˈmɑːkʌp/",     ru:"разметка",           tag:"HTML" },
  { en:"element",   ipa:"/ˈelɪmənt/",    ru:"элемент",            tag:"HTML" },
  { en:"attribute", ipa:"/ˈætrɪbjuːt/",  ru:"атрибут",            tag:"HTML" },
  { en:"header",    ipa:"/ˈhedə(r)/",    ru:"шапка",              tag:"layout" },
  { en:"main",      ipa:"/meɪn/",        ru:"основная область",   tag:"layout" },
  { en:"footer",    ipa:"/ˈfʊtə(r)/",    ru:"подвал",             tag:"layout" },
  { en:"paragraph", ipa:"/ˈpærəɡrɑːf/",  ru:"абзац",              tag:"text" },
  { en:"heading",   ipa:"/ˈhedɪŋ/",      ru:"заголовок",          tag:"text" },
  { en:"doctype",   ipa:"/ˈdɒktaɪp/",    ru:"тип документа",      tag:"meta" },
  { en:"metadata",  ipa:"/ˈmetəˌdeɪtə/", ru:"метаданные",         tag:"meta" },
  { en:"language",  ipa:"/ˈlæŋɡwɪdʒ/",   ru:"язык",               tag:"meta" },
];

const DICT_CSS = [
  { en:"selector",  ipa:"/sɪˈlektə(r)/", ru:"селектор",           tag:"CSS" },
  { en:"property",  ipa:"/ˈprɒpəti/",    ru:"свойство",           tag:"CSS" },
  { en:"value",     ipa:"/ˈvæljuː/",     ru:"значение",           tag:"CSS" },
  { en:"margin",    ipa:"/ˈmɑːdʒɪn/",    ru:"внешний отступ",     tag:"layout" },
  { en:"padding",   ipa:"/ˈpædɪŋ/",      ru:"внутренний отступ",  tag:"layout" },
  { en:"flexbox",   ipa:"/ˈfleksbɒks/",  ru:"флексбокс",          tag:"layout" },
  { en:"grid",      ipa:"/ɡrɪd/",        ru:"грид",               tag:"layout" },
];

const DICT_JS = [
  { en:"variable",  ipa:"/ˈveəriəbl/",   ru:"переменная",         tag:"JS" },
  { en:"function",  ipa:"/ˈfʌŋkʃn/",     ru:"функция",            tag:"JS" },
  { en:"array",     ipa:"/əˈreɪ/",       ru:"массив",             tag:"JS" },
  { en:"object",    ipa:"/ˈɒbdʒɪkt/",    ru:"объект",             tag:"JS" },
  { en:"loop",      ipa:"/luːp/",        ru:"цикл",               tag:"JS" },
  { en:"condition", ipa:"/kənˈdɪʃn/",    ru:"условие",            tag:"JS" },
];

/* ====== Рендер словаря + вкладки внутри блока словаря ====== */
(function initLearnDict(){
  const dictPanel = document.querySelector('.panel.dict');
  if (!dictPanel) return;               // мы не на learn.html

  const tabs   = dictPanel.querySelectorAll('.dict-tab');
  const search = document.getElementById('dictSearch');
  const list   = document.getElementById('dictList');

  const DATA = { html: DICT_HTML, css: DICT_CSS, js: DICT_JS };
  let topic = 'html';

  function match(item, q) {
    const en = (item.en || '').toLowerCase();
    const ru = (item.ru || '').toLowerCase();
    const tg = (item.tag||'').toLowerCase();
    return en.includes(q) || ru.includes(q) || tg.includes(q);
  }

  function render() {
    const q = (search.value || '').trim().toLowerCase();
    const src = DATA[topic] || [];
    const filtered = q ? src.filter(it => match(it, q)) : src;

    list.innerHTML = filtered.map(it => `
      <li class="dict-item">
        <div class="word">
          <span class="en">${it.en}</span>
          <span class="ipa">${it.ipa || ''}</span>
          <button class="speak" type="button" data-word="${it.en}" title="Произнести">🔊</button>
        </div>
        <div class="ru">${it.ru || ''}</div>
        <div class="tag">${(it.tag || '').toUpperCase()}</div>
      </li>
    `).join('') || `<li class="dict-item">Ничего не найдено</li>`;

    // озвучка
    list.querySelectorAll('.speak').forEach(btn=>{
      btn.onclick = () => typeof speak === 'function' && speak(btn.dataset.word);
    });
  }

  // переключение вкладок словаря
  tabs.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      tabs.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      topic = btn.dataset.topic;        // html | css | js
      render();
    });
  });

  search.addEventListener('input', render);
  render();
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

