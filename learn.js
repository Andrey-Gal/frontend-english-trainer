// Мини-база уроков: по 2 примера на раздел (добавим больше позже)
const LESSONS = {
  html: [
    {
      title: "Базовая разметка",
      term: { en: "element", ipa: "/ˈelɪmənt/", ru: "элемент" },
      html: "<h1>Hello</h1><p>Это HTML element.</p>",
      css:  "body{font-family:Arial}",
      js:   "",
      explain: "Элемент (element) — базовый строительный блок HTML. Заголовки, абзацы, div — всё элементы."
    },
    {
      title: "Атрибуты",
      term: { en: "attribute", ipa: "/ˈætrɪbjuːt/", ru: "атрибут" },
      html: '<img src="https://picsum.photos/200" alt="random" width="200">',
      css:  "img{border-radius:12px}",
      js:   "",
      explain: "Атрибут (attribute) уточняет элемент: src, alt, width и т.д."
    },
  ],
  css: [
    {
      title: "Отступы",
      term: { en: "margin", ipa: "/ˈmɑːdʒɪn/", ru: "внешний отступ" },
      html: '<div class="card">Карточка</div>',
      css:  ".card{margin:16px;padding:12px;background:#fff;border-radius:10px}",
      js:   "",
      explain: "Margin — внешний отступ снаружи элемента."
    },
    {
      title: "Флекс-контейнер",
      term: { en: "flexbox", ipa: "/ˈfleksbɒks/", ru: "флексбокс" },
      html: '<div class="row"><div>1</div><div>2</div><div>3</div></div>',
      css:  ".row{display:flex;gap:12px} .row>div{background:#eef;padding:10px;border-radius:8px}",
      js:   "",
      explain: "Flexbox — способ раскладки элементов в строку/колонку."
    },
  ],
  js: [
    {
      title: "Функция",
      term: { en: "function", ipa: "/ˈfʌŋkʃn/", ru: "функция" },
      html: '<button id="b">Нажми</button><div id="out"></div>',
      css:  "#out{margin-top:8px}",
      js:   "function greet(name){return `Hello, ${name}!`}\n" +
            "document.getElementById('b').onclick=()=>{\n" +
            "  document.getElementById('out').textContent=greet('World')\n" +
            "}",
      explain: "Function — переиспользуемый блок кода, который можно вызывать."
    },
    {
      title: "Массив",
      term: { en: "array", ipa: "/əˈreɪ/", ru: "массив" },
      html: '<div id="list"></div>',
      css:  "#list{display:flex;gap:8px}",
      js:   "const arr=[1,2,3];\n" +
            "document.getElementById('list').textContent=arr.join(' - ')",
      explain: "Array — упорядоченная коллекция значений."
    },
  ]
};

// Элементы UI
const lessonList = document.getElementById("lessonList");
const edHtml = document.getElementById("edHtml");
const edCss  = document.getElementById("edCss");
const edJs   = document.getElementById("edJs");
const runBtn = document.getElementById("runBtn");
const preview = document.getElementById("preview");
const speakTermBtn = document.getElementById("speakTermBtn");

const termEn = document.getElementById("termEn");
const termIpa = document.getElementById("termIpa");
const termRu = document.getElementById("termRu");
const explainText = document.getElementById("explainText");

let currentCat = "html";
let currentIdx = 0;

function renderLessonList() {
  lessonList.innerHTML = "";
  LESSONS[currentCat].forEach((l, i) => {
    const li = document.createElement("li");
    li.textContent = l.title;
    li.className = i === currentIdx ? "active" : "";
    li.onclick = () => { currentIdx = i; renderLessonList(); loadLesson(); };
    lessonList.appendChild(li);
  });
}

function loadLesson() {
  const l = LESSONS[currentCat][currentIdx];
  edHtml.value = l.html;
  edCss.value  = l.css;
  edJs.value   = l.js;
  termEn.textContent = l.term.en;
  termIpa.textContent = l.term.ipa || "";
  termRu.textContent  = l.term.ru || "";
  explainText.textContent = l.explain || "";
  runPreview();
}

function runPreview() {
  const html = `
<!doctype html>
<html><head>
<meta charset="utf-8">
<style>${edCss.value}</style>
</head><body>
${edHtml.value}
<script>
${edJs.value}
</script>
</body></html>`;
  preview.srcdoc = html;
}

// Переключение вкладок HTML/CSS/JS
document.querySelectorAll(".tab-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    currentCat = btn.dataset.cat;
    currentIdx = 0;
    renderLessonList();
    loadLesson();
  });
});

// Кнопки
runBtn.addEventListener("click", runPreview);
speakTermBtn.addEventListener("click", ()=>{
  if (typeof speak === "function") speak(termEn.textContent.trim());
});

// Старт
renderLessonList();
loadLesson();
