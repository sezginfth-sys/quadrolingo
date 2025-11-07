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

        // BASIT ÇEVIRI SÖZLÜĞÜ - TEST İÇİN
        const simpleDictionary = {
            'hello': {
                'tr': 'merhaba',
                'en': 'hello', 
                'de': 'hallo',
                'fr': 'bonjour',
                'es': 'hola',
                'it': 'ciao'
            },
            'thank you': {
                'tr': 'teşekkür ederim',
                'en': 'thank you',
                'de': 'danke',
                'fr': 'merci', 
                'es': 'gracias',
                'it': 'grazie'
            },
            'goodbye': {
                'tr': 'güle güle',
                'en': 'goodbye',
                'de': 'auf wiedersehen',
                'fr': 'au revoir',
                'es': 'adiós',
                'it': 'arrivederci'
            },
            'yes': {
                'tr': 'evet',
                'en': 'yes',
                'de': 'ja',
                'fr': 'oui',
                'es': 'sí',
                'it': 'sì'
            },
            'no': {
                'tr': 'hayır',
                'en': 'no',
                'de': 'nein',
                'fr': 'non',
                'es': 'no',
                'it': 'no'
            }
        };

        let result = "";
        
        for (const lang of langs) {
            const langCode = getLanguageCode(lang);
            const wordLower = word.toLowerCase();
            
            if (simpleDictionary[wordLower] && simpleDictionary[wordLower][langCode]) {
                result += `${lang}: ${simpleDictionary[wordLower][langCode]}\n`;
            } else {
                result += `${lang}: Çeviri bulunamadı\n`;
            }
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

function getLanguageCode(langName) {
    const languageMap = {
        'Türkçe': 'tr', 
        'İngilizce': 'en', 
        'Almanca': 'de', 
        'Fransızca': 'fr',
        'İspanyolca': 'es', 
        'İtalyanca': 'it',
        'Rusça': 'ru', 
        'Çince': 'zh', 
        'Japonca': 'ja', 
        'Korece': 'ko'
    };
    
    return languageMap[langName] || 'en';
}
