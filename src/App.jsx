import React, { useState } from "react";
import "./style.css";

const API_URL = "https://script.google.com/macros/s/AKfycbwz5JAghBXtB6QZ2nx-k5Ta8fBlW2ZKytRYlZl6PTjUiWpHZur-c2X7S8zwPu7BdNU/exec";

const LANGS = [
  { code: "tr", name: "Türkçe" },
  { code: "ru", name: "Русский" },
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
];

export default function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({});
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError("Lütfen bir metin girin.");
      return;
    }
    setError("");
    setLoading(true);
    setResult({});

    try {
      const translations = {};
      await Promise.all(
        LANGS.map(async (lang) => {
          const res = await fetch(`${API_URL}?text=${encodeURIComponent(text)}&lang=${lang.code}`);
          const data = await res.text();
          translations[lang.code] = data;
        })
      );
      setResult(translations);
    } catch (err) {
      setError("Çeviri hatası: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>🌍 Quadrolingo — Çok Dilli Çeviri</h1>

      <textarea
        placeholder="Çevrilecek metni yaz..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={handleTranslate} disabled={loading}>
        {loading ? "Çeviriliyor..." : "Çevir"}
      </button>

      {error && <p className="error">{error}</p>}

      <div className="results">
        {LANGS.map((l) => (
          <div key={l.code} className="card">
            <h3>{l.name}</h3>
            <p>{result[l.code] || "Henüz çevrilmedi"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
