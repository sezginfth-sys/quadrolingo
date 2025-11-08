// Dil çevirileri
const translations = {
    tr: {
        title: "QuadroLingo - 4 Dil Çeviri",
        inputPlaceholder: "Çevrilecek metni buraya yazın...",
        translateBtn: "Çevir",
        titles: {
            tr: "Türkçe",
            ru: "Rusça", 
            en: "İngilizce",
            de: "Almanca"
        }
    },
    ru: {
        title: "QuadroLingo - Перевод на 4 языка",
        inputPlaceholder: "Введите текст для перевода...",
        translateBtn: "Перевести",
        titles: {
            tr: "Турецкий",
            ru: "Русский",
            en: "Английский", 
            de: "Немецкий"
        }
    },
    en: {
        title: "QuadroLingo - 4 Language Translator",
        inputPlaceholder: "Enter text to translate here...",
        translateBtn: "Translate",
        titles: {
            tr: "Turkish",
            ru: "Russian",
            en: "English",
            de: "German"
        }
    },
    de: {
        title: "QuadroLingo - 4-Sprachen-Übersetzer",
        inputPlaceholder: "Text hier zum Übersetzen eingeben...",
        translateBtn: "Übersetzen",
        titles: {
            tr: "Türkisch",
            ru: "Russisch",
            en: "Englisch",
            de: "Deutsch"
        }
    }
};

let currentLang = 'tr';

// Google Apps Script URL'niz
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzPnYNlEyfmQk7YJrpd8LQE1iiEwWGlDS9T8K4uE4JOWN8hk_FAS7xk9DZCItnylkE/exec';

function changeLanguage(lang) {
    currentLang = lang;
    updateUI();
}

function updateUI() {
    const t = translations[currentLang];
    document.title = t.title;
    document.getElementById('inputText').placeholder = t.inputPlaceholder;
    document.getElementById('translateBtn').textContent = t.translateBtn;
    
    // Dil başlıklarını güncelle
    Object.keys(t.titles).forEach(lang => {
        document.getElementById(`title-${lang}`).textContent = t.titles[lang];
    });
}

async function translateText() {
    const inputText = document.getElementById('inputText').value.trim();
    
    if (!inputText) {
        alert('Lütfen çevrilecek metni girin');
        return;
    }

    // Loading state
    const results = document.querySelectorAll('.result');
    results.forEach(result => {
        result.classList.add('loading');
        result.textContent = 'Çevriliyor...';
    });

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: inputText,
                source: 'auto',
                targets: ['tr', 'ru', 'en', 'de']
            })
        });

        const data = await response.json();
        
        // Sonuçları göster
        if (data.translations) {
            data.translations.forEach(translation => {
                const element = document.getElementById(`result-${translation.target}`);
                if (element) {
                    element.classList.remove('loading');
                    element.textContent = translation.text;
                }
            });
        }
    } catch (error) {
        console.error('Çeviri hatası:', error);
        results.forEach(result => {
            result.classList.remove('loading');
            result.textContent = 'Çeviri başarısız. Lütfen tekrar deneyin.';
        });
    }
}

// Enter tuşu ile çeviri
document.getElementById('inputText').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        translateText();
    }
});

// Sayfa yüklendiğinde UI'yı güncelle
document.addEventListener('DOMContentLoaded', updateUI);
