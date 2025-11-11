import { useState } from "react";
import "./style.css";

export default function App() {
  const [input, setInput] = useState("");
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Google Script URL (seninki)
  const API_URL =
    "https://script.google.com/macros/s/AKfycbxpCJ3wPivoCi0i7MuQsUZpA5QhPQnVIagBz2cjPlALID-Cdwo4VIFwG0iymLMzsn6aaw/exec";

  const languages = [
    { code: "tr", name: "Türkçe" },
    { code: "en", name: "İngilizce" },
    { code: "ru", name: "Rusça" },
    { code: "de", name: "Almanca" },
    { code: "fr", name: "Fransızca" },
  ];

  const [selected, setSelected] = useState(["en", "ru", "de", "fr"]);

  const handleTranslate = async () => {
    if (!input) {
      setError("Lütfen bir kelime girin.");
      return;
    }
    setError("");
    setLoading(true);
    setTranslations({});

    try {
      const responses = await Promise.all(
        selected.map(async (lang) => {
          const res = await fetch(`${API_URL}?q=${encodeURIComponent(input)}&target=${lang}`);
          if (!res.ok) throw new Error("Network");
          const data = await res.json();
          return { lang, text: data.translatedText || "Çevrilemedi" };
        })
      );

      const result = {};
      responses.forEach((r) => (result[r.lang] = r.text));
      setTranslations(result);
    } catch (err) {
      setError("Çeviri hatası: Failed to fetch. Google Script erişimi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <img src="/logo.png" alt="Quadrolingo" className="logo" />

        <h1 className="title">Quadrolingo</h1>
        <p className="subtitle">Bir kelimeyi 4 dilde anında çevirin</p>

        <input
          type="text"
          placeholder="Çevirmek istediğiniz kelimeyi yazın..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input"
        />

        <div className="selectors">
          {selected.map((lang, i) => (
            <select
              key={i}
              value={lang}
              onChange={(e) => {
                const newSelected = [...selected];
                newSelected[i] = e.target.value;
                setSelected(newSelected);
              }}
              className="select"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          ))}
        </div>

        <button className="btn" onClick={handleTranslate} disabled={loading}>
          🌐 {loading ? "Çeviriliyor..." : "Çevir"}
        </button>

        <div className="output">
          {error && <p className="error">{error}</p>}

          {!error && Object.keys(translations).length === 0 && !loading && (
            <div className="welcome">
              🚀 Quadrolingo'ya hoş geldiniz!
              <ul>
                <li>Bir kelime yazın</li>
                <li>4 dil seçin</li>
                <li>Çevir butonuna tıklayın</li>
                <li>Çevirileri görün</li>
              </ul>
            </div>
          )}

          {Object.entries(translations).map(([lang, text]) => (
            <p key={lang}>
              <strong>{languages.find((l) => l.code === lang)?.name}:</strong> {text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

