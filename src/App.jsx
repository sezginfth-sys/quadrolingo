import React, { useState } from "react";

export default function App() {
  const [text, setText] = useState("");
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(false);

  const langs = ["Türkçe", "İngilizce", "Rusça", "Almanca", "Fransızca"];

  const translate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setTranslations([]);
    try {
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbxpCJ3wPivoCi0i7MuQsUZpA5QhPQnVIagBz2cjPlALID-Cdwo4VIFwG0iymLMzsn6aaw/exec?q=" +
          encodeURIComponent(text)
      );
      const data = await res.json();
      setTranslations(data.translations || []);
    } catch (err) {
      alert("Çeviri hatası: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 w-[90%] max-w-lg text-center">
      <img src="/logo.png" alt="Quadrolingo" className="mx-auto w-20 mb-4" />
      <h1 className="text-3xl font-extrabold text-purple-700">Quadrolingo</h1>
      <p className="text-gray-600 mb-4">Bir kelimeyi 4 dilde anında çevirin</p>

      <input
        className="border border-purple-300 rounded-lg px-4 py-2 w-full mb-3 text-center"
        placeholder="Çevirmek istediğiniz kelimeyi yazın..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={translate}
        disabled={loading}
        className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 w-full transition"
      >
        🌍 {loading ? "Çeviriliyor..." : "Çevir"}
      </button>

      <div className="mt-5 text-left bg-purple-50 rounded-xl p-4">
        {translations.length === 0 ? (
          <p className="text-gray-500">
            🚀 Quadrolingo'ya hoş geldiniz!  
            <br />• Bir kelime yazın  
            <br />• Çevir butonuna tıklayın  
            <br />• Çevirileri görün
          </p>
        ) : (
          translations.map((t, i) => (
            <p key={i} className="text-gray-800 mb-1">
              <strong>{langs[i]}:</strong> {t}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
