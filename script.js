// Sayfa Değiştirme Fonksiyonu
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById('page-' + pageId).classList.add('active');
    document.getElementById('link-' + pageId).classList.add('active');

    if (pageId === 'list') {
        renderTable();
    }
    if (pageId === 'home') {
        updateStats();
    }
}

// LocalStorage Veri Yönetimi
function getItems() {
    let items = localStorage.getItem('decisionHubItems');
    if (!items) {
        // Varsayılan başlangıç verileri
        items = [
            { id: 1, title: 'Interstellar', category: 'Film / Dizi', status: 'İzlenecek / Çalışılacak' },
            { id: 2, title: 'QuickSort Algoritması', category: 'Kod Cümleciği', status: 'Tamamlandı' }
        ];
        localStorage.setItem('decisionHubItems', JSON.stringify(items));
    } else {
        items = JSON.parse(items);
    }
    return items;
}

function saveItems(items) {
    localStorage.setItem('decisionHubItems', JSON.stringify(items));
}

// Tabloyu Güncelleme
function renderTable() {
    const items = getItems();
    const tbody = document.getElementById('itemTableBody');
    tbody.innerHTML = '';

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Henüz kayıt eklenmemiş.</td></tr>';
        return;
    }

    items.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.title}</td>
            <td>${item.category}</td>
            <td>${item.category === 'Kod Cümleciği' ? 'Kod' : 'Medya'}</td>
            <td>${item.status}</td>
            <td><button class="btn-danger" onclick="deleteItem(${item.id})">Sil</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Öğe Silme (CRUD - Delete)
function deleteItem(id) {
    let items = getItems();
    items = items.filter(i => i.id !== id);
    saveItems(items);
    renderTable();
    updateStats();
}

// Form Gönderme ve Validasyon (CRUD - Create)
function handleFormSubmit(event) {
    event.preventDefault();
    
    const titleInput = document.getElementById('itemTitle');
    const categorySelect = document.getElementById('itemCategory');
    const statusSelect = document.getElementById('itemStatus');
    
    const titleError = document.getElementById('titleError');
    const categoryError = document.getElementById('categoryError');
    
    let isValid = true;

    // JavaScript Validasyon Kuralları
    if (titleInput.value.trim() === '') {
        titleError.style.display = 'block';
        isValid = false;
    } else {
        titleError.style.display = 'none';
    }

    if (categorySelect.value === '') {
        categoryError.style.display = 'block';
        isValid = false;
    } else {
        categoryError.style.display = 'none';
    }

    if (!isValid) return;

    // Yeni öğeyi localStorage'a ekleme
    const items = getItems();
    const newItem = {
        id: Date.now(),
        title: titleInput.value.trim(),
        category: categorySelect.value,
        status: statusSelect.value
    };

    items.push(newItem);
    saveItems(items);

    // Formu temizle ve listeye yönlendir
    titleInput.value = '';
    categorySelect.value = '';
    alert('İçerik başarıyla eklendi!');
    switchPage('list');
}

// Rastgele Seçici (Random Picker)
function pickRandomItem() {
    const items = getItems();
    const resultDisplay = document.getElementById('randomResult');
    
    if (items.length === 0) {
        resultDisplay.textContent = 'Önce listeye öğe eklemelisin!';
        return;
    }

    const randomIndex = Math.floor(Math.random() * items.length);
    resultDisplay.textContent = items[randomIndex].title + ' (' + items[randomIndex].category + ')';
}

// İstatistikleri Güncelle
function updateStats() {
    const items = getItems();
    document.getElementById('statTotal').textContent = items.length;
    const completed = items.filter(i => i.status === 'Tamamlandı').length;
    document.getElementById('statCompleted').textContent = completed;
}

// İletişim Formu
function handleContactSubmit(event) {
    event.preventDefault();
    alert('Mesajınız başarıyla alındı. Teşekkürler!');
    event.target.reset();
}

// Sayfa açıldığında istatistikleri yükle
updateStats();