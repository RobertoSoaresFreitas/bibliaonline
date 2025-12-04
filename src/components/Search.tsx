"use client";

import React, { useState } from "react";
import { useBible } from "@/context/BibleContext";

function normalize(str: string) {
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export default function Search() {
  const { books, selectedBook, selectedChapter, setSelectedVerse, selectChapter } =
    useBible();

  const [query, setQuery] = useState("");
  const [scope, setScope] =
    useState<"chapter" | "book" | "bible">("chapter");
  const [results, setResults] = useState<any[]>([]);

  function handleSearch() {
    if (!query.trim()) return;

    const normalizedQuery = normalize(query);
    const found: any[] = [];

    const searchBooks =
      scope === "bible"
        ? books
        : scope === "book" && selectedBook
        ? [selectedBook]
        : scope === "chapter" && selectedBook
        ? [
            {
              ...selectedBook,
              chapters: [
                selectedBook.chapters[selectedChapter - 1] || [],
              ],
            },
          ]
        : [];

    searchBooks.forEach((book) => {
      book.chapters.forEach(
        (chapter: string[], chapIndex: number) => {
          chapter.forEach((verse: string, verseIndex: number) => {
            const normalizedVerse = normalize(verse);

            if (normalizedVerse.includes(normalizedQuery)) {
              found.push({
                book: book.name,
                chapter: chapIndex + 1,
                verse: verseIndex + 1,
                text: verse,
                normalizedVerse,
                normalizedQuery,
              });
            }
          });
        }
      );
    });

    setResults(found);
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
  }

  function handleGoTo(r: any) {
    const bookObj = books.find((b) => b.name === r.book);
    if (!bookObj) return;

    // 1) Seleciona o versículo primeiro
    setSelectedVerse(r.verse);

    // 2) Seleciona o capítulo correto
    selectChapter(bookObj, r.chapter);

    // 3) Após re-render, scroll para o versículo
    requestAnimationFrame(() => {
      setTimeout(() => {
        const verseElement = document.getElementById(
          `verse-${r.chapter}-${r.verse}`
        );

        if (verseElement) {
          verseElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 120);
    });
  }

  return (
    <div className="my-4 p-3 border border-border rounded bg-surface/50">
      <input
        type="text"
        placeholder="Buscar palavra..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-3 py-2 mb-2 rounded bg-surface text-foreground border border-border"
      />

      <div className="flex gap-2 mb-2 text-sm">
        <label>
          <input
            type="radio"
            name="scope"
            value="chapter"
            checked={scope === "chapter"}
            onChange={() => setScope("chapter")}
          /> Capítulo
        </label>

        <label>
          <input
            type="radio"
            name="scope"
            value="book"
            checked={scope === "book"}
            onChange={() => setScope("book")}
          /> Livro
        </label>

        <label>
          <input
            type="radio"
            name="scope"
            value="bible"
            checked={scope === "bible"}
            onChange={() => setScope("bible")}
          /> Bíblia
        </label>
      </div>

      <div className="flex gap-3 items-center mb-3">
        <button
          onClick={handleSearch}
          className="px-3 py-1 border border-border rounded bg-surface hover:bg-surface-highlight cursor-pointer"
        >
          Filtrar
        </button>

        <button
          onClick={clearSearch}
          className="px-3 py-1 border border-border rounded bg-surface hover:bg-surface-highlight cursor-pointer"
        >
          Limpar
        </button>

        {results.length > 0 && (
          <span className="text-sm opacity-70">
            {results.length} resultados
          </span>
        )}
      </div>

      {results.length > 0 && (
        <div className="max-h-64 overflow-y-auto space-y-2">
          {results.map((r, idx) => {
            const parts: string[] = [];
            let lastIndex = 0;

            const q = r.normalizedQuery;
            let pos = r.normalizedVerse.indexOf(q);

            while (pos !== -1) {
              parts.push(r.text.slice(lastIndex, pos));
              const match = r.text.slice(pos, pos + q.length);
              parts.push(
                `<strong class='text-orange-500'>${match}</strong>`
              );

              lastIndex = pos + q.length;
              pos = r.normalizedVerse.indexOf(q, lastIndex);
            }

            parts.push(r.text.slice(lastIndex));

            return (
              <div
                key={idx}
                onClick={() => handleGoTo(r)}
                className="p-2 border-b border-border text-sm cursor-pointer hover:bg-surface-highlight"
              >
                <span
                  className="block"
                  dangerouslySetInnerHTML={{ __html: parts.join("") }}
                />
                <small className="opacity-75">
                  {r.book} {r.chapter}:{r.verse}
                </small>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
