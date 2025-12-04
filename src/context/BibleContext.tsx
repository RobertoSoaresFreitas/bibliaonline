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

  // load version
  useEffect(() => {
    if (version === "nvi") setBooks(nvi as Book[]);
    if (version === "acf") setBooks(acf as Book[]);
    if (version === "aa") setBooks(aa as Book[]);
    // reset selection on version change
    setSelectedBook(null);
    setSelectedChapter(1);
    setSelectedVerse(1);
  }, [version]);

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
    // bounds check
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

    // next verse in same chapter
    if (selectedVerse < lastVerse) {
      setSelectedVerse((v) => v + 1);
      return;
    }

    // next chapter in same book
    if (selectedChapter < selectedBook.chapters.length) {
      setSelectedChapter((c) => c + 1);
      setSelectedVerse(1);
      return;
    }

    // next book (first chapter, verse 1)
    const idx = findBookIndex(selectedBook);
    const next = books[idx + 1];
    if (next) {
      setSelectedBook(next);
      setSelectedChapter(1);
      setSelectedVerse(1);
      return;
    }

    // if was last book → wrap to first book
    if (books.length > 0) {
      setSelectedBook(books[0]);
      setSelectedChapter(1);
      setSelectedVerse(1);
    }
  }

  // goto previous verse with wrap to prev chapter/book
  function gotoPrevVerse() {
    if (!selectedBook) return;

    // previous verse in same chapter
    if (selectedVerse > 1) {
      setSelectedVerse((v) => v - 1);
      return;
    }

    // go to last verse of previous chapter (same book)
    if (selectedChapter > 1) {
      const prevChapterIndex = selectedChapter - 2; // zero-based
      const prevChapterVerses = selectedBook.chapters[prevChapterIndex] || [];
      const lastVerse = prevChapterVerses.length || 1;
      setSelectedChapter((c) => c - 1);
      setSelectedVerse(lastVerse);
      return;
    }

    // go to previous book (last chapter, last verse)
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

    // if was first book => wrap to last book
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
    setVersion,
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
