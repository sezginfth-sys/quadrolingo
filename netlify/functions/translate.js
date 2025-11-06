const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
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

        let result = "";
        
        for (const lang of langs) {
            const langCode = getLanguageCode(lang);
            const translation = await translateWithAPI(word, langCode);
            result += `${lang}: ${translation}\n`;
        }

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

// MyMemory Translation API (Ücretsiz)
async function translateWithAPI(text, targetLang) {
    try {
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
        );
        const data = await response.json();
        
        if (data.responseStatus === 200) {
            return data.responseData.translatedText;
        } else {
            return "Çeviri bulunamadı";
        }
    } catch (error) {
        return "Çeviri hatası";
    }
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
        'Portekizce': 'pt'
    };
    
    return languageMap[langName] || 'en';
}
