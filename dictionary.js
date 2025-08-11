const list = document.getElementById("dictList");
const q = document.getElementById("q");
const cat = document.getElementById("cat");

let DICT = [];

async function loadDict() {
  const res = await fetch("dictionary.json");
  DICT = await res.json();
  render();
}

function render() {
  const text = q.value.trim().toLowerCase();
  const c = cat.value;

  const items = DICT.filter(it =>
    (c === "all" || it.category === c) &&
    (
      it.en.toLowerCase().includes(text) ||
      (it.ru || "").toLowerCase().includes(text)
    )
  );

  list.innerHTML = items.map(it => `
    <li class="dict-item">
      <span class="en">${it.en}</span>
      <span class="ipa">${it.ipa || ""}</span>
      <span class="ru">${it.ru || ""}</span>
      <button class="speak" data-word="${it.en}">🔊</button>
      <span class="tag">${it.category.toUpperCase()}</span>
    </li>
  `).join("");

  list.querySelectorAll(".speak").forEach(b=>{
    b.onclick = () => typeof speak === "function" && speak(b.dataset.word);
  });
}

q.oninput = render;
cat.onchange = render;

loadDict().catch(console.error);
