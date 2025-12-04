"use client";

import React, { useEffect } from "react";
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

  useEffect(() => {
    if (!selectedBook) return;
    const id = `verse-${selectedChapter}-${selectedVerse}`;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedBook, selectedChapter, selectedVerse]);

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
                className={`cursor-pointer leading-relaxed p-2 rounded border-border ${
                  isActive
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
    </main>
  );
}
