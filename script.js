const STORAGE_KEY = "decisionhub_watchlist_v1";

// İlk açılışta arşivin boş görünmemesi için örnek veriler
const defaultItems = [
  { id: 1, title: "Interstellar", category: "Film", status: "Bekliyor" },
  { id: 2, title: "Dark", category: "Dizi", status: "Tamamlandı" },
  { id: 3, title: "Clean Code - Robert C. Martin", category: "Kitap", status: "Bekliyor" },
  { id: 4, title: "Multithreaded Socket Server (C)", category: "Kod", status: "Bekliyor" }
];

function getItems() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultItems));
    return defaultItems;
  }
  return JSON.parse(data);
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// Sayfa yüklendiğinde ilgili sayfanın fonksiyonlarını çalıştır
document.addEventListener("DOMContentLoaded", () => {
  updateHomeStats();
  renderArchiveTable();
  renderStatsPage();
  setupAddForm();
  setupContactForm();
});

// --- 1. ANA SAYFA: İSTATİSTİK & RANDOM PICKER ---
function updateHomeStats() {
  const totalEl = document.getElementById("homeTotalCount");
  if (!totalEl) return;

  const items = getItems();
  const pending = items.filter(i => i.status === "Bekliyor").length;
  const done = items.filter(i => i.status === "Tamamlandı").length;

  totalEl.textContent = items.length;
  document.getElementById("homePendingCount").textContent = pending;
  document.getElementById("homeDoneCount").textContent = done;
}

function pickRandomItem() {
  const category = document.getElementById("pickerCategory").value;
  const items = getItems().filter(i => i.status === "Bekliyor");
  const filtered = category === "ALL" ? items : items.filter(i => i.category === category);

  const resultBox = document.getElementById("pickerResult");
  const badge = document.getElementById("pickedCategoryBadge");
  const title = document.getElementById("pickedTitle");

  if (filtered.length === 0) {
    badge.textContent = "Uyarı";
    title.textContent = "Bu kategoride bekleyen öğe bulunamadı!";
    resultBox.style.display = "block";
    return;
  }

  const chosen = filtered[Math.floor(Math.random() * filtered.length)];
  badge.textContent = chosen.category;
  title.textContent = `🎯 ${chosen.title}`;
  resultBox.style.display = "block";
}

// --- 2. ARŞİV SAYFASI (READ, UPDATE, DELETE) ---
function renderArchiveTable() {
  const tbody = document.getElementById("archiveTableBody");
  if (!tbody) return;

  const items = getItems();
  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Henüz kayıtlı içerik yok.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(item => `
    <tr>
      <td><strong>${item.title}</strong></td>
      <td><span class="badge">${item.category}</span></td>
      <td>
        <span class="badge ${item.status === 'Tamamlandı' ? 'badge-done' : 'badge-pending'}">
          ${item.status}
        </span>
      </td>
      <td>
        <button class="btn btn-success btn-sm" onclick="toggleStatus(${item.id})">Durum Değiştir</button>
        <button class="btn btn-danger btn-sm" onclick="deleteItem(${item.id})">Sil</button>
      </td>
    </tr>
  `).join("");
}

function toggleStatus(id) {
  const items = getItems();
  const target = items.find(i => i.id === id);
  if (target) {
    target.status = target.status === "Bekliyor" ? "Tamamlandı" : "Bekliyor";
    saveItems(items);
    renderArchiveTable();
  }
}

function deleteItem(id) {
  const items = getItems().filter(i => i.id !== id);
  saveItems(items);
  renderArchiveTable();
}

// --- 3. ÖĞE EKLEME FORMU & VALIDATION (CREATE) ---
function setupAddForm() {
  const form = document.getElementById("addItemForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("itemTitle").value.trim();
    const category = document.getElementById("itemCategory").value;
    const status = document.getElementById("itemStatus").value;

    let isValid = true;
    document.getElementById("titleError").style.display = title.length < 2 ? "block" : "none";
    if (title.length < 2) isValid = false;

    document.getElementById("categoryError").style.display = category === "" ? "block" : "none";
    if (category === "") isValid = false;

    if (!isValid) return;

    const items = getItems();
    items.unshift({ id: Date.now(), title, category, status });
    saveItems(items);
    window.location.href = "archive.html";
  });
}

// --- 4. İSTATİSTİKLER SAYFASI ---
function renderStatsPage() {
  const grid = document.getElementById("statsGrid");
  if (!grid) return;

  const items = getItems();
  const categories = ["Film", "Dizi", "Kitap", "Kod"];

  grid.innerHTML = categories.map(cat => {
    const catItems = items.filter(i => i.category === cat);
    const done = catItems.filter(i => i.status === "Tamamlandı").length;
    return `
      <div class="card">
        <h3>${cat} Kategorisi</h3>
        <p style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin: 0.5rem 0;">
          Toplam: ${catItems.length} Kayıt
        </p>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Tamamlanan: ${done} | Bekleyen: ${catItems.length - done}
        </p>
      </div>
    `;
  }).join("");
}

// --- 5. İLETİŞİM FORMU & VALIDATION ---
function setupContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("senderName").value.trim();
    const email = document.getElementById("senderEmail").value.trim();
    const message = document.getElementById("senderMessage").value.trim();

    let isValid = true;
    document.getElementById("nameError").style.display = name.length < 2 ? "block" : "none";
    if (name.length < 2) isValid = false;

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    document.getElementById("emailError").style.display = !emailValid ? "block" : "none";
    if (!emailValid) isValid = false;

    document.getElementById("messageError").style.display = message.length < 10 ? "block" : "none";
    if (message.length < 10) isValid = false;

    if (!isValid) return;

    form.reset();
    document.getElementById("contactSuccess").style.display = "block";
  });
}