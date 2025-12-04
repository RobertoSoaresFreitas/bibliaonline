// src/context/BibleContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import nvi from "../data/nvi.json";
import acf from "../data/acf.json";
import aa from "../data/aa.json";

export interface Book {
  name: string;
  abbrev?: string;
  chapters: string[][];
}

export interface BibleContextValue {
  version: "nvi" | "acf" | "aa";
  setVersion: (v: "nvi" | "acf" | "aa") => void;
  books: Book[];
  selectedBook: Book | null;
  selectedChapter: number;
  selectedVerse: number;
  setSelectedVerse: (v: number) => void;
  selectBook: (book: Book) => void;
  selectChapter: (book: Book, chapter: number) => void;
  gotoNextVerse: () => void;
  gotoPrevVerse: () => void;
}

const BibleContext = createContext<BibleContextValue | undefined>(undefined);

export const BibleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [version, setVersion] = useState<"nvi" | "acf" | "aa">("nvi");
  const [books, setBooks] = useState<Book[]>(nvi as Book[]);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectedVerse, setSelectedVerse] = useState<number>(1);

  // Map version string to data
  const versionData: Record<"nvi" | "acf" | "aa", Book[]> = {
  nvi: nvi as Book[],
  acf: acf as Book[],
  aa: aa as Book[],
};

  // change version while trying to preserve selection
  const changeVersion = (newVersion: "nvi" | "acf" | "aa") => {
    const newBooks = versionData[newVersion];
    setVersion(newVersion);
    setBooks(newBooks);

    if (!selectedBook) {
      setSelectedBook(null);
      setSelectedChapter(1);
      setSelectedVerse(1);
      return;
    }

    // find same book in new version
    const bookInNewVersion = newBooks.find((b) => b.name === selectedBook.name);

    if (bookInNewVersion) {
      setSelectedBook(bookInNewVersion);

      // adjust chapter if new book has fewer chapters
      const chapter =
        selectedChapter <= bookInNewVersion.chapters.length
          ? selectedChapter
          : 1;
      setSelectedChapter(chapter);

      // adjust verse if new chapter has fewer verses
      const verse =
        selectedVerse <= bookInNewVersion.chapters[chapter - 1].length
          ? selectedVerse
          : 1;
      setSelectedVerse(verse);
    } else {
      // if book doesn't exist in new version, reset
      setSelectedBook(null);
      setSelectedChapter(1);
      setSelectedVerse(1);
    }
  };

  // helpers to find index
  const findBookIndex = (book: Book | null) => {
    if (!book) return -1;
    return books.findIndex((b) => b.name === book.name);
  };

  // select a book (resets chapter & verse)
  function selectBook(book: Book) {
    setSelectedBook(book);
    setSelectedChapter(1);
    setSelectedVerse(1);
  }

  // select a chapter in a given book
  function selectChapter(book: Book, chapterNumber: number) {
    const maxCh = Math.max(1, book.chapters.length);
    const cap = Math.min(Math.max(1, chapterNumber), maxCh);
    setSelectedBook(book);
    setSelectedChapter(cap);
    setSelectedVerse(1);
  }

  // goto next verse with wrap to next chapter/book
  function gotoNextVerse() {
    if (!selectedBook) return;

    const chapterVerses = selectedBook.chapters[selectedChapter - 1] || [];
    const lastVerse = chapterVerses.length;

    if (selectedVerse < lastVerse) {
      setSelectedVerse((v) => v + 1);
      return;
    }

    if (selectedChapter < selectedBook.chapters.length) {
      setSelectedChapter((c) => c + 1);
      setSelectedVerse(1);
      return;
    }

    const idx = findBookIndex(selectedBook);
    const next = books[idx + 1];
    if (next) {
      setSelectedBook(next);
      setSelectedChapter(1);
      setSelectedVerse(1);
      return;
    }

    if (books.length > 0) {
      setSelectedBook(books[0]);
      setSelectedChapter(1);
      setSelectedVerse(1);
    }
  }

  // goto previous verse with wrap to prev chapter/book
  function gotoPrevVerse() {
    if (!selectedBook) return;

    if (selectedVerse > 1) {
      setSelectedVerse((v) => v - 1);
      return;
    }

    if (selectedChapter > 1) {
      const prevChapterIndex = selectedChapter - 2;
      const prevChapterVerses = selectedBook.chapters[prevChapterIndex] || [];
      const lastVerse = prevChapterVerses.length || 1;
      setSelectedChapter((c) => c - 1);
      setSelectedVerse(lastVerse);
      return;
    }

    const idx = findBookIndex(selectedBook);
    const prevBook = books[idx - 1];
    if (prevBook) {
      const lastChapterIndex = prevBook.chapters.length - 1;
      const lastVerse = prevBook.chapters[lastChapterIndex].length || 1;
      setSelectedBook(prevBook);
      setSelectedChapter(lastChapterIndex + 1);
      setSelectedVerse(lastVerse);
      return;
    }

    if (books.length > 0) {
      const lastBook = books[books.length - 1];
      const lastChapterIndex = lastBook.chapters.length - 1;
      const lastVerse = lastBook.chapters[lastChapterIndex].length || 1;
      setSelectedBook(lastBook);
      setSelectedChapter(lastChapterIndex + 1);
      setSelectedVerse(lastVerse);
    }
  }

  const value: BibleContextValue = {
    version,
    setVersion: changeVersion, // aqui usamos a função que preserva a posição
    books,
    selectedBook,
    selectedChapter,
    selectedVerse,
    setSelectedVerse,
    selectBook,
    selectChapter,
    gotoNextVerse,
    gotoPrevVerse,
  };

  return <BibleContext.Provider value={value}>{children}</BibleContext.Provider>;
};

export function useBible(): BibleContextValue {
  const ctx = useContext(BibleContext);
  if (!ctx) throw new Error("useBible must be used within BibleProvider");
  return ctx;
}
