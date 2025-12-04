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
  version: "aa" | "acf" | "nvi";
  setVersion: (v: "aa" | "acf" | "nvi") => void;
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
  const [version, setVersion] = useState<"aa" | "acf" | "nvi">("aa");
  const [books, setBooks] = useState<Book[]>(nvi as Book[]);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectedVerse, setSelectedVerse] = useState<number>(1);

  const versionData: Record<"aa" | "acf" | "nvi", Book[]> = {
    aa: aa as Book[],
    acf: acf as Book[],
    nvi: nvi as Book[],
  };

  const changeVersion = (newVersion: "aa" | "acf" | "nvi") => {
    const newBooks = versionData[newVersion];
    setVersion(newVersion);
    setBooks(newBooks);

    if (!selectedBook) {
      setSelectedBook(null);
      setSelectedChapter(1);
      setSelectedVerse(1);
      return;
    }

    const bookInNewVersion = newBooks.find((b) => b.name === selectedBook.name);

    if (bookInNewVersion) {
      setSelectedBook(bookInNewVersion);

      const chapter =
        selectedChapter <= bookInNewVersion.chapters.length
          ? selectedChapter
          : 1;
      setSelectedChapter(chapter);

      const verse =
        selectedVerse <= bookInNewVersion.chapters[chapter - 1].length
          ? selectedVerse
          : 1;
      setSelectedVerse(verse);
    } else {
      setSelectedBook(null);
      setSelectedChapter(1);
      setSelectedVerse(1);
    }
  };

  const findBookIndex = (book: Book | null) => {
    if (!book) return -1;
    return books.findIndex((b) => b.name === book.name);
  };

  function selectBook(book: Book) {
    setSelectedBook(book);
    setSelectedChapter(1);
    setSelectedVerse(1);
  }

  // CORRIGIDO → não resetamos selectedVerse
  function selectChapter(book: Book, chapterNumber: number) {
    const maxCh = Math.max(1, book.chapters.length);
    const cap = Math.min(Math.max(1, chapterNumber), maxCh);
    setSelectedBook(book);
    setSelectedChapter(cap);
  }

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
    setVersion: changeVersion,
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
