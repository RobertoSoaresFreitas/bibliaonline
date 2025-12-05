"use client";

import React, { useState } from "react";
import VersionSelector from "@/components/VersionSelector";
import ThemeSelector from "@/components/ThemeSelector";
import { useBible, Book } from "@/context/BibleContext";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
}

export default function Sidebar({ open, setOpen }: Props) {
  const { books, selectedBook, selectedChapter, selectChapter } = useBible();

  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  function toggleBook(bookName: string) {
    setExpandedBook((prev) => (prev === bookName ? null : bookName));
  }

  return (
    <>
      {/* Backdrop mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-72
          border-r border-border
          bg-surface text-foreground
          transform transition-all duration-300 ease-out
          md:static md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-4 h-full flex flex-col">

          {/* header do sidebar */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <strong className="text-lg text-primary">Menu</strong>

            <button
              className="md:hidden px-2 py-1 border border-border rounded bg-surface text-foreground"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Selectores */}
          <VersionSelector />
          <ThemeSelector />

          {/* Livros */}
          <strong className="text-lg text-primary mb-2">Livros</strong>

          <div className="overflow-y-auto pr-2 space-y-2">
            {books.map((b: Book, idx: number) => {
              const isSelectedBook = selectedBook?.name === b.name;
              const isExpanded = expandedBook === b.name;

              return (
                <div key={idx}>
                  {/* livro */}
                  <button
                    onClick={() => toggleBook(b.name)}
                    className={`
                      w-full text-left px-2 py-2 border border-border rounded
                      ${isSelectedBook ? "bg-orange-500 text-black" : "hover:bg-surface-highlight bg-surface text-foreground"}
                    `}
                  >
                    {b.name}
                  </button>

                  {/* capítulos */}
                  {isExpanded && (
                    <div className="mt-1 ml-2 grid grid-cols-5 gap-2">
                      {b.chapters.map((_, chapIndex) => {
                        const cap = chapIndex + 1;

                        // verifica se este capítulo é o selecionado (mesmo livro + mesmo cap)
                        const isActiveChapter =
                          selectedBook?.name === b.name && selectedChapter === cap;

                        return (
                          <button
                            key={chapIndex}
                            onClick={() => {
                              selectChapter(b, cap);
                              setExpandedBook(null);
                              setOpen(false);
                            }}
                            className={`
                              px-2 py-1 border rounded text-sm
                              ${isActiveChapter
                                ? "bg-orange-500 text-black border-border"
                                : "bg-surface text-foreground border-border hover:bg-surface-highlight"}
                            `}
                          >
                            {cap}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
