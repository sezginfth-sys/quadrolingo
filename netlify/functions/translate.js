const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { word, langs } = JSON.parse(event.body);

        if (!word || !langs) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Kelime ve diller gereklidir' 
                })
            };
        }

        // TÜM ÇEVİRİLERİ AYNI ANDA YAP - DOĞRU KAYNAK DİLLE
        const translationPromises = langs.map(async (lang) => {
            const langCode = getLanguageCode(lang);
            try {
                // İngilizce'den hedef dile çevir
                const translation = await translateWithAPI(word, 'en', langCode);
                return `${lang}: ${translation}`;
            } catch (error) {
                console.error(`Çeviri hatası (${lang}):`, error);
                return `${lang}: Çeviri hatası`;
            }
        });

        const translations = await Promise.all(translationPromises);
        const result = translations.join('\n');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: result
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Çeviri hatası: ' + error.message
            })
        };
    }
};

// GELİŞMİŞ ÇEVİRİ API'Sİ
async function translateWithAPI(text, sourceLang, targetLang) {
    // 1. LibreTranslate API (Daha güvenilir)
    try {
        const response = await fetch('https://libretranslate.de/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: sourceLang,
                target: targetLang,
                format: 'text'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.translatedText) {
                return data.translatedText;
            }
        }
    } catch (error) {
        console.log('LibreTranslate hatası:', error);
    }

    // 2. MyMemory API (Yedek)
    try {
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
        );
        const data = await response.json();
        
        if (data.responseStatus === 200 && data.responseData.translatedText) {
            return data.responseData.translatedText;
        }
    } catch (error) {
        console.log('MyMemory API hatası:', error);
    }

    throw new Error('Çeviri yapılamadı');
}

function getLanguageCode(langName) {
    const languageMap = {
        'Türkçe': 'tr', 
        'İngilizce': 'en', 
        'Rusça': 'ru', 
        'İtalyanca': 'it',
        'Arapça': 'ar', 
        'Çince': 'zh', 
        'Almanca': 'de', 
        'Fransızca': 'fr',
        'İspanyolca': 'es', 
        'Japonca': 'ja', 
        'Korece': 'ko', 
        'Portekizce': 'pt',
        'Lehçe': 'pl',
        'Hollandaca': 'nl',
        'İsveççe': 'sv',
        'Norveççe': 'no',
        'Danca': 'da',
        'Fince': 'fi'
    };
    
    return languageMap[langName] || 'en';
}
