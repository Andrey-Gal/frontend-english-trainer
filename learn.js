// ---- Теория по разделам (минимум контента — будем расширять) ----
const THEORY = {
  html: `
    <h2>Модуль 1 — HTML: базовая разметка</h2>
    <h3>Что такое HTML?</h3>
    <p><b>HTML</b> — язык разметки. Описывает структуру страницы.</p>

    <h3>Минимальный скелет документа</h3>
<pre class="code"><code>&lt;!doctype html&gt;
&lt;html lang="ru"&gt;
  &lt;head&gt;
    &lt;meta charset="utf-8"&gt;
    &lt;title&gt;Моя страница&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;Контент&lt;/body&gt;
&lt;/html&gt;</code></pre>

    <h3>Шапка, тело, подвал</h3>
    <ul>
      <li><code>&lt;header&gt;</code> — шапка</li>
      <li><code>&lt;main&gt;</code> — основной контент</li>
      <li><code>&lt;footer&gt;</code> — подвал</li>
    </ul>
  `,
  css: `
    <h2>Модуль 2 — CSS: стилизация</h2>
    <h3>Что такое CSS?</h3>
    <p><b>CSS</b> — язык описания внешнего вида: цвета, шрифты, отступы, сетки.</p>

    <h3>Правило CSS</h3>
<pre class="code"><code>селектор { свойство: значение; }</code></pre>

    <h3>Базовые свойства</h3>
    <ul>
      <li><code>color</code> — цвет текста</li>
      <li><code>background</code> — фон</li>
      <li><code>margin / padding</code> — внешние/внутренние отступы</li>
      <li><code>display</code> — block, inline, flex, grid</li>
    </ul>
  `,
  js: `
    <h2>Модуль 3 — JavaScript: логика</h2>
    <h3>Что такое JS?</h3>
    <p><b>JavaScript</b> — добавляет интерактив: события, работа с DOM, запросы.</p>

    <h3>Переменные и функции</h3>
<pre class="code"><code>const name = 'Andrey';
function hi(n){ return 'Hello, ' + n; }
console.log(hi(name));</code></pre>

    <h3>DOM</h3>
    <p><code>document.getElementById</code>, <code>addEventListener</code>, <code>classList</code> — ключевые инструменты.</p>
  `
};

// ---- Переключение вкладок теории + синхронизация словаря ----
const theoryEl   = document.getElementById('theory');
const theoryTabs = document.querySelectorAll('.learn-tabs .tab');
const dictTabs   = document.querySelectorAll('.dict-tabs .dict-tab');

function setTopic(topic){
  // 1) Теория
  if (theoryEl) theoryEl.innerHTML = THEORY[topic] || '';

  // 2) Подсветка табов теории
  theoryTabs.forEach(t => t.classList.toggle('active', t.dataset.topic === topic));

  // 3) Синхронизируем вкладки словаря и запускаем их логику (рендер в app.js)
  dictTabs.forEach(b => {
    const isMatch = b.dataset.topic === topic;
    b.classList.toggle('active', isMatch);
    if (isMatch) b.dispatchEvent(new Event('click', { bubbles:true }));
  });
}

theoryTabs.forEach(t => t.addEventListener('click', () => setTopic(t.dataset.topic)));

// Старт: HTML
setTopic('html');
