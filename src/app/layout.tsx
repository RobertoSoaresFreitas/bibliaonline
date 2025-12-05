// src/app/layout.tsx
"use client";

import React, { useEffect, useState } from "react";
import "@/styles/globals.css";
import { BibleProvider } from "@/context/BibleContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Sidebar from "@/components/Sidebar";
import Search from "@/components/Search";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = prev;
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <html lang="pt-br">
      <body className="min-h-screen bg-surface text-primary">
        <ThemeProvider>

          <BibleProvider>
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-[999] border-b border-border bg-surface/90 backdrop-blur">
              <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                <strong className="text-lg text-primary">

                  {/* Botão para celulares / telas pequenas */}
                  <button
                    className="block md:hidden cursor-pointer  ml-4 hover:text-zinc-600 transition"
                    onClick={() => setOpen(true)}
                  >
                    Bíblia Sagrada
                  </button>

                  {/* Botão para telas médias e maiores */}
                  <button
                    className="hidden md:block cursor-pointer  ml-4 hover:text-zinc-600 transition"
                  >
                    Bíblia Sagrada
                  </button>
                </strong>

                {/* hamburger */}
                <button
                  className="md:hidden cursor-pointer px-3 py-1 border border-border rounded z-[1000] text-yellow-500 hover:text-yellow-400 ml-4 "
                  onClick={() => setOpen(true)}
                >
                  ☰
                </button>
              </div>
            </header>

            <div className="pt-16 flex">

              {/* SIDEBAR DESKTOP */}
              <div className="hidden md:block w-72">
                <Sidebar open={true} setOpen={() => { }} />
              </div>

              {/* SIDEBAR MOBILE */}
              {open && (
                <>
                  <div
                    className="fixed inset-0 bg-black/40 z-[995]"
                    onClick={() => setOpen(false)}
                  />
                  <div className="fixed top-0 left-0 bottom-0 w-72 z-[1000]">
                    <Sidebar open={open} setOpen={setOpen} />
                  </div>
                </>
              )}

              <div className="flex-1 px-2 py-0 max-w-5xl mx-auto">
                <Search />
              <main className="flex-1 px-2 py-2 max-w-5xl mx-auto">
               
                {children}
              </main>
              </div>
            </div>
          </BibleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
