// === элементы страницы ===
const tabs      = document.querySelectorAll('.tab');
const edHtml    = document.getElementById('edHtml');
const edCss     = document.getElementById('edCss');
const edJs      = document.getElementById('edJs');
const runBtn    = document.getElementById('runCode');
const frame     = document.getElementById('resultFrame');

const dictList  = document.getElementById('dictList');
const dictSearch= document.getElementById('dictSearch');
const dictTpl   = document.getElementById('dictItemTpl');

let currentTopic = 'html';

// === стартовые примеры для песочницы по темам ===
const SAMPLES = {
  html: {
    html: `<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><title>Учусь HTML</title></head>
<body>
  <header>Это шапка</header>
  <main>
    <h1>Hello</h1>
    <p>Это абзац текста.</p>
  </main>
  <footer>Это подвал</footer>
</body></html>`,
    css:  `body{font-family:Arial;padding:16px}
header,footer{background:#eef;border-radius:8px;padding:8px}
h1{color:#2a7}`,
    js:   ``,
  },
  css: {
    html: `<div class="card">Карточка</div>`,
    css:  `.card{margin:16px;padding:12px;background:#fff;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,.08)}`,
    js:   ``,
  },
  js: {
    html: `<button id="b">Нажми</button><div id="out"></div>`,
    css:  `#out{margin-top:8px;font-family:Arial}`,
    js:   `function greet(name){return \`Hello, \${name}!\`}
document.getElementById('b').onclick=()=>{
  document.getElementById('out').textContent=greet('World')
}`,
  }
};

// === мини-словарь по темам ===
const DICTS = {
  html: [
    { en:'markup',   ipa:'/ˈmɑːkʌp/',    ru:'разметка',     tag:'HTML' },
    { en:'element',  ipa:'/ˈelɪmənt/',   ru:'элемент',      tag:'HTML' },
    { en:'attribute',ipa:'/ˈætrɪbjuːt/', ru:'атрибут',      tag:'HTML' },
    { en:'header',   ipa:'/ˈhedə(r)/',   ru:'шапка',        tag:'layout' },
    { en:'main',     ipa:'/meɪn/',       ru:'основная часть',tag:'layout' },
    { en:'footer',   ipa:'/ˈfʊtə(r)/',   ru:'подвал',       tag:'layout' }
  ],
  css: [
    { en:'selector', ipa:'/sɪˈlektə/',   ru:'селектор',     tag:'CSS' },
    { en:'margin',   ipa:'/ˈmɑːdʒɪn/',   ru:'внешний отступ',tag:'CSS' },
    { en:'padding',  ipa:'/ˈpædɪŋ/',     ru:'внутренний отступ', tag:'CSS' },
    { en:'flexbox',  ipa:'/ˈfleksbɒks/', ru:'флексбокс',    tag:'CSS' }
  ],
  js: [
    { en:'function', ipa:'/ˈfʌŋkʃn/',    ru:'функция',      tag:'JS' },
    { en:'array',    ipa:'/əˈreɪ/',      ru:'массив',       tag:'JS' },
    { en:'loop',     ipa:'/luːp/',       ru:'цикл',         tag:'JS' }
  ]
};

// === рендер словаря ===
function renderDict(list){
  if (!dictList || !dictTpl) return;
  dictList.innerHTML = '';
  list.forEach(item => {
    const node = dictTpl.content.cloneNode(true);
    node.querySelector('.en').textContent  = item.en;
    node.querySelector('.ipa').textContent = item.ipa || '';
    node.querySelector('.ru').textContent  = item.ru  || '';
    node.querySelector('.tag').textContent = item.tag || '';

    // озвучка — используем speak из app.js
    node.querySelector('.speak').addEventListener('click', () => {
      if (typeof speak === 'function') speak(item.en);
    });

    dictList.appendChild(node);
  });
}
function filterDict(topic, q){
  q = (q||'').trim().toLowerCase();
  const base = DICTS[topic] || [];
  if (!q) return base;
  return base.filter(it =>
    it.en.toLowerCase().includes(q) ||
    (it.ru||'').toLowerCase().includes(q) ||
    (it.tag||'').toLowerCase().includes(q)
  );
}

// === подстановка примеров в редакторы и рендер словаря ===
function applyTopic(topic){
  currentTopic = topic;
  // активная вкладка
  document.querySelectorAll('.tab').forEach(b=>{
    b.classList.toggle('active', b.dataset.topic === topic);
  });
  // редакторы
  const s = SAMPLES[topic];
  if (edHtml) edHtml.value = s.html || '';
  if (edCss)  edCss.value  = s.css  || '';
  if (edJs)   edJs.value   = s.js   || '';
  // словарь
  renderDict(filterDict(topic, dictSearch?.value));
  // автозапуск предпросмотра
  runPreview();
}

// === запуск кода в iframe ===
function runPreview(){
  if (!frame) return;
  const css  = `<style>${edCss?.value || ''}</style>`;
  const js   = `<script>(function(){try{${edJs?.value || ''}}catch(e){console.error(e)}})();<\/script>`;
  const html = `${edHtml?.value || ''}\n${css}\n${js}`;
  const doc = frame.contentDocument || frame.contentWindow?.document;
  doc.open(); doc.write(html); doc.close();
}

// обработчики
tabs.forEach(btn=>{
  btn.addEventListener('click', () => applyTopic(btn.dataset.topic));
});
if (runBtn) runBtn.addEventListener('click', runPreview);
if (dictSearch){
  dictSearch.addEventListener('input', () => {
    renderDict(filterDict(currentTopic, dictSearch.value));
  });
}

// старт
applyTopic(currentTopic);
