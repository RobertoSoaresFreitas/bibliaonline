"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mb-4">
      <strong className="text-lg text-primary mb-2">Tema</strong>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setTheme("claro")}
          className={`px-3 py-2 rounded border border-border bg-surface hover:bg-surface-highlight text-primary ${theme === "claro" ? "ring-2 ring-offset-1" : ""}`}
        >
          Claro
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={`px-3 py-2 rounded border border-border bg-surface hover:bg-surface-highlight text-primary ${theme === "dark" ? "ring-2 ring-offset-1" : ""}`}
        >
          Escuro
        </button>

        <button
          onClick={() => setTheme("homem")}
          className={`px-3 py-2 rounded border border-border bg-surface hover:bg-surface-highlight text-primary ${theme === "homem" ? "ring-2 ring-offset-1" : ""}`}
        >
          Homem
        </button>

        <button
          onClick={() => setTheme("mulher")}
          className={`px-3 py-2 rounded border border-border bg-surface hover:bg-surface-highlight text-primary ${theme === "mulher" ? "ring-2 ring-offset-1" : ""}`}
        >
          Mulher
        </button>
      </div>
    </div>
  );
}
