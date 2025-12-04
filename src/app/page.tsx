"use client";

import React, { useEffect, useState } from "react";
import { useBible } from "@/context/BibleContext";

export default function HomePage() {
  const {
    selectedBook,
    selectedChapter,
    selectedVerse,
    setSelectedVerse,
    gotoNextVerse,
    gotoPrevVerse,
  } = useBible();

  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    if (!selectedBook) return;
    const id = `verse-${selectedChapter}-${selectedVerse}`;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedBook, selectedChapter, selectedVerse]);

  // mostrar botão ↑ topo quando rolar a página
  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!selectedBook) {
    return (
      <main className="flex flex-col items-center justify-center h-60 gap-4">
        <p className="text-2xl text-primary">Escolha:</p>
        <p className="text-2xl text-primary">a versão, um tema</p>
        <p className="text-2xl text-primary">um livro e versículo</p>
        <p className="text-2xl text-primary">Deus o ilumine e boa leitura 🙏</p>
      </main>
    );
  }

  const chapterVerses =
    selectedBook.chapters[selectedChapter - 1] || [];

  return (
    <main>
      {/* header do capítulo */}
      <div className="sticky top-16 z-40 pt-4 pb-4 mb-4 border-b border-border bg-surface/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-2 flex items-center justify-between gap-4">
          <div className="text-lg font-semibold">
            {selectedBook.name} {selectedChapter}:{selectedVerse}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={gotoPrevVerse}
              className="px-3 py-1 border border-border rounded bg-surface hover:bg-surface-highlight"
            >
              ←Anterior
            </button>

            <select
              value={selectedVerse}
              onChange={(e) => setSelectedVerse(Number(e.target.value))}
              className="px-2 py-1 border border-border rounded bg-surface"
            >
              {chapterVerses.map((_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>

            <button
              onClick={gotoNextVerse}
              className="px-3 py-1 border border-border rounded bg-surface hover:bg-surface-highlight"
            >
              Próximo→
            </button>
          </div>
        </div>
      </div>

      {/* Versículos */}
      <div className="max-w-5xl mx-auto">
        <div className="space-y-3">
          {chapterVerses.map((text, idx) => {
            const verseNum = idx + 1;
            const isActive = verseNum === selectedVerse;

            return (
              <p
                id={`verse-${selectedChapter}-${verseNum}`}
                key={idx}
                onClick={() => setSelectedVerse(verseNum)}
                className={`cursor-pointer leading-relaxed p-2 rounded border-border ${isActive
                    ? "text-2xl bg-surface-highlight border-l-4 border-orange-500"
                    : ""
                  }`}
              >
                <span className="font-semibold mr-2">{verseNum}.</span>
                {text}
              </p>
            );
          })}
        </div>
      </div>

      {/* Botão ↑ Topo */}
      {showTopButton && (
        <button
  onClick={scrollToTop}
  className="
    fixed bottom-6 right-6 p-3 rounded-full 
    bg-surface/70 text-foreground backdrop-blur-md
    border border-border
    shadow-md hover:bg-surface/90 transition
    flex items-center justify-center
  "
>
  {/* Seta para cima estilizada */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
</button>
      )}
    </main>
  );
}
