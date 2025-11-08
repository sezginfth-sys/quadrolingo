// Çoklu dil desteği
const translations = {
    tr: {
        title: "QuadroLingo - 4 Dil Çeviri",
        inputLabel: "Çevrilecek Metin",
        inputPlaceholder: "Metninizi buraya yazın...",
        characters: "karakter",
        clear: "Temizle",
        translate: "Çevir",
        results: "Çeviri Sonuçları",
        turkish: "Türkçe",
        russian: "Rusça",
        english: "İngilizce",
        german: "Almanca",
        waitingTranslation: "Çeviri bekleniyor...",
        translating: "Çevriliyor...",
        footer: "Google Apps Script ile güçlendirilmiştir",
        copySuccess: "Panoya kopyalandı!",
        noTextError: "Lütfen çevrilecek metni girin",
        translationError: "Çeviri başarısız. Lütfen tekrar deneyin."
    },
    ru: {
        title: "QuadroLingo - Перевод на 4 языка",
        inputLabel: "Текст для перевода",
        inputPlaceholder: "Введите ваш текст здесь...",
        characters: "символов",
        clear: "Очистить",
        translate: "Перевести",
        results: "Результаты перевода",
        turkish: "Турецкий",
        russian: "Русский",
        english: "Английский",
        german: "Немецкий",
        waitingTranslation: "Ожидание перевода...",
        translating: "Переводится...",
        footer: "Работает на Google Apps Script",
        copySuccess: "Скопировано в буфер!",
        noTextError: "Пожалуйста, введите текст для перевода",
        translationError: "Ошибка перевода. Пожалуйста, попробуйте снова."
    },
    en: {
        title: "QuadroLingo - 4 Language Translator",
        inputLabel: "Text to Translate",
        inputPlaceholder: "Enter your text here...",
        characters: "characters",
        clear: "Clear",
        translate: "Translate",
        results: "Translation Results",
        turkish: "Turkish",
        russian: "Russian",
        english: "English",
        german: "German",
        waitingTranslation: "Waiting for translation...",
        translating: "Translating...",
        footer: "Powered by Google Apps Script",
        copySuccess: "Copied to clipboard!",
        noTextError: "Please enter text to translate",
        translationError: "Translation failed. Please try again."
    },
    de: {
        title: "QuadroLingo - 4-Sprachen-Übersetzer",
        inputLabel: "Zu übersetzender Text",
        inputPlaceholder: "Geben Sie Ihren Text hier ein...",
        characters: "Zeichen",
        clear: "Löschen",
        translate: "Übersetzen",
        results: "Übersetzungsergebnisse",
        turkish: "Türkisch",
        russian: "Russisch",
        english: "Englisch",
        german: "Deutsch",
        waitingTranslation: "Warte auf Übersetzung...",
        translating: "Wird übersetzt...",
        footer: "Unterstützt von Google Apps Script",
        copySuccess: "In die Zwischenablage kopiert!",
        noTextError: "Bitte geben Sie einen Text zum Übersetzen ein",
        translationError: "Übersetzung fehlgeschlagen. Bitte versuchen Sie es erneut."
    }
};

// Mevcut Google Apps Script URL'niz
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwz5JAghBXtB6QZ2nx-k5Ta8fBlW2ZKytRYlZl6PTjUiWpHZur-c2X7S8zwPu7BdNU/exec';

let currentLang = 'tr';

// DOM yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Dil değiştirme butonları
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            changeLanguage(this.dataset.lang);
        });
    });

    // Çevir butonu
    document.getElementById('translateBtn').addEventListener('click', translateText);
    
    // Temizle butonu
    document.getElementById('clearBtn').addEventListener('click', clearText);
    
    // Kopyala butonları
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            copyToClipboard(this.dataset.target);
        });
    });

    // Karakter sayacı
    document.getElementById('inputText').addEventListener('input', updateCharCount);
    
    // Enter tuşu ile çeviri (Ctrl+Enter)
    document.getElementById('inputText').addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            translateText();
        }
    });

    updateUI();
    updateCharCount();
}

function changeLanguage(lang) {
    currentLang = lang;
    
    // Aktif butonu güncelle
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });
    
    updateUI();
}

function updateUI() {
    const t = translations[currentLang];
    
    // Başlık ve metinleri güncelle
    document.title = t.title;
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (t[key]) {
            element.textContent = t[key];
        }
    });
    
    // Placeholder'ları güncelle
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (t[key]) {
            element.setAttribute('placeholder', t[key]);
        }
    });
}

function updateCharCount() {
    const text = document.getElementById('inputText').value;
    document.getElementById('charCount').textContent = text.length;
}

function clearText() {
    document.getElementById('inputText').value = '';
    updateCharCount();
    
    // Sonuçları sıfırla
    document.querySelectorAll('.translation-text').forEach(element => {
        element.innerHTML = `<span class="placeholder">${translations[currentLang].waitingTranslation}</span>`;
    });
}

async function translateText() {
    const inputText = document.getElementById('inputText').value.trim();
    
    if (!inputText) {
        showToast(translations[currentLang].noTextError, 'error');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: inputText,
                targets: ['tr', 'ru', 'en', 'de']
            })
        });

        const data = await response.json();
        
        if (data.translations) {
            // Sonuçları göster
            data.translations.forEach(translation => {
                const element = document.getElementById(`result-${translation.target}`);
                if (element) {
                    element.innerHTML = translation.text || 
                        `<span class="placeholder">${translations[currentLang].translationError}</span>`;
                }
            });
            showToast('✓ Çeviri tamamlandı!', 'success');
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Çeviri hatası:', error);
        showToast(translations[currentLang].translationError, 'error');
        
        // Hata durumunda tüm sonuçları sıfırla
        document.querySelectorAll('.translation-text').forEach(element => {
            element.innerHTML = `<span class="placeholder">${translations[currentLang].translationError}</span>`;
        });
    } finally {
        showLoading(false);
    }
}

function copyToClipboard(targetLang) {
    const text = document.getElementById(`result-${targetLang}`).textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast(translations[currentLang].copySuccess, 'success');
    }).catch(err => {
        console.error('Kopyalama hatası:', err);
        showToast('Kopyalama başarısız', 'error');
    });
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
