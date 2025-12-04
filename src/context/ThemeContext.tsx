// src/context/ThemeContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "claro" | "dark" | "homem" | "mulher";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "claro",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("claro");

  // aplica a classe no <html>
  function applyClass(t: ThemeMode) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    // remover classes anteriores
    root.classList.remove("theme-claro", "dark", "theme-homem", "theme-mulher");
    // adicionar a classe correspondente
    if (t === "claro") root.classList.add("theme-claro");
    else if (t === "dark") root.classList.add("dark");
    else if (t === "homem") root.classList.add("theme-homem");
    else if (t === "mulher") root.classList.add("theme-mulher");
  }

  // inicializa a partir do localStorage (se existir)
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved === "dark" || saved === "homem" || saved === "mulher" || saved === "claro") {
      setThemeState(saved as ThemeMode);
      applyClass(saved as ThemeMode);
    } else {
      // padrão: claro
      setThemeState("claro");
      applyClass("claro");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // wrapper que atualiza estado + localStorage + aplica classe
  function setTheme(t: ThemeMode) {
    setThemeState(t);
    applyClass(t);
    if (typeof window !== "undefined") localStorage.setItem("theme", t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
