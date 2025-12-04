"use client";

import React, { useEffect, useState } from "react";
import { useBible } from "@/context/BibleContext";
import Search from "@/components/Search";

export default function HomePage() {
  const {
    selectedBook,
    selectedChapter,
    selectedVerse,
    setSelectedVerse,
    gotoNextVerse,
    gotoPrevVerse,
    version,
  } = useBible();

  const [multiSelect, setMultiSelect] = useState<number[]>([]);
  const [showSheet, setShowSheet] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    if (!selectedBook) return;
    const id = `verse-${selectedChapter}-${selectedVerse}`;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedBook, selectedChapter, selectedVerse]);

  useEffect(() => {
    const handleScroll = () => setShowTopButton(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!selectedBook) {
    return (
      <main className="flex flex-col items-center justify-center h-60 gap-4">
        <p className="text-2xl text-primary">Abra o menu e escolha:</p>
        <p className="text-2xl text-primary">Versão, Tema, Livro e Versículo</p>
        <p className="text-2xl text-primary">Deus o ilumine e boa leitura 🙏</p>
      </main>
    );
  }

  const chapterVerses = selectedBook.chapters[selectedChapter - 1] || [];

  // toggleVerse: se sheet não ativo -> seleciona normal; se sheet ativo -> multiseleção
  function toggleVerse(num: number) {
    if (!showSheet) {
      setSelectedVerse(num);
      return;
    }

    setMultiSelect((prev) => {
      if (prev.includes(num)) {
        const updated = prev.filter((v) => v !== num);
        if (updated.length === 0) setShowSheet(false);
        return updated;
      }
      return [...prev, num].sort((a, b) => a - b);
    });
  }

  // Inicia o modo de compartilhamento (sheet) com o versículo atual
  function startShareMode(initial: number) {
    setMultiSelect([initial]);
    setShowSheet(true);
  }

  function cancelSelection() {
    setMultiSelect([]);
    setShowSheet(false);
  }

  // cria o texto para compartilhar (com cabeçalho e rodapé)
  function createShareText(linesOnly = false) {
    const versionLabel = version === "nvi" ? "NVI" : version === "acf" ? "ACF" : "AA";
    const versesText = multiSelect
      .map((v) => `"${chapterVerses[v - 1]}" (${selectedChapter}:${v})`)
      .join("\n\n");
    const header = `${selectedBook?.name}`;
    const footer = `(${versionLabel}) • https://bibliaon.vercel.app/ • Bíblia On`;

    if (linesOnly) return versesText;
    return `${header}\n\n${versesText}\n\n${footer}`;
  }

  // Gera imagem (template inteligente: 1 => quadrado 1080x1080 | 2+ => vertical 1080x1920)
  async function generateImageBlob(): Promise<Blob> {
    setIsGeneratingImage(true);
    try {
      const verses = multiSelect.map((v) => chapterVerses[v - 1]);
      const isSingle = verses.length === 1;

      const width = 1080;
      const height = isSingle ? 1080 : 1920;
      const padding = 80;
      // Fonte base (original app usa ~28px). Aqui multiplicamos por 3 => 84px base.
      const baseFontPx = 60;
      const refFontPx = Math.round(baseFontPx * 0.5); // smaller for reference/footer
      const titleFontPx = Math.round(baseFontPx * 1.5); // larger for title

      // prepare text
      const versionLabel = version === "nvi" ? "NVI" : version === "acf" ? "ACF" : "AA";
      const ref = `${selectedBook?.name} ${selectedChapter}:${isSingle ? multiSelect[0] : `${multiSelect[0]}-${multiSelect[multiSelect.length - 1]}`}`;
      const fullText = verses.join("\n\n");

      // create canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas não suportado");

      // gradient background (harmonioso)
      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, "#f6d365");
      g.addColorStop(1, "#fda085");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      // subtle texture overlay
      ctx.globalAlpha = 0.04;
      ctx.fillStyle = "#000";
      for (let i = 0; i < 400; i++) {
        const rx = Math.random() * width;
        const ry = Math.random() * height;
        const r = Math.random() * 2;
        ctx.beginPath();
        ctx.arc(rx, ry, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // semi-transparent card to improve contrast
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      const cardX = padding / 2;
      const cardY = 140;
      const cardW = width - padding;
      const cardH = height - padding - cardY;
      ctx.fillRect(cardX, cardY, cardW, cardH);

      // Title (book name) near top
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.98)";
      ctx.font = `700 ${titleFontPx}px Inter, system-ui, -apple-system, 'Segoe UI', Roboto`;
      ctx.fillText(selectedBook?.name || "", width / 2, 80);

      // Prepare wrapped text for verses
      ctx.fillStyle = "rgba(255,255,255,0.98)";
      ctx.font = `600 ${baseFontPx}px Inter, system-ui, -apple-system, 'Segoe UI', Roboto`;

      const maxTextWidth = cardW - 120;
      const words = fullText.split(/\s+/);
      const lines: string[] = [];
      let line = "";

      // Break into lines respecting maxTextWidth
      for (let i = 0; i < words.length; i++) {
        const testLine = line ? line + " " + words[i] : words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth) {
          if (line) {
            lines.push(line);
            line = words[i];
          } else {
            // single very long word
            lines.push(testLine);
            line = "";
          }
        } else {
          line = testLine;
        }
      }
      if (line) lines.push(line);

      // If font too large (too many lines), shrink font iteratively
      let currentFont = baseFontPx;
      let currentLines = lines.slice();
      while (currentLines.length * (currentFont * 0.6) > cardH - 240 && currentFont > 28) {
        currentFont = Math.round(currentFont * 0.92);
        ctx.font = `600 ${currentFont}px Inter, system-ui, -apple-system, 'Segoe UI', Roboto`;
        // recompute wrapping with reduced font
        const tempLines: string[] = [];
        let tempLine = "";
        for (let i = 0; i < words.length; i++) {
          const testLine = tempLine ? tempLine + " " + words[i] : words[i];
          if (ctx.measureText(testLine).width > maxTextWidth) {
            if (tempLine) {
              tempLines.push(tempLine);
              tempLine = words[i];
            } else {
              tempLines.push(testLine);
              tempLine = "";
            }
          } else {
            tempLine = testLine;
          }
        }
        if (tempLine) tempLines.push(tempLine);
        currentLines = tempLines;
      }

      // draw lines centered vertically within card area
      const lineHeight = Math.round(currentFont * 1.05);
      const totalTextHeight = currentLines.length * lineHeight;
      let currentY = cardY + cardH / 2 - totalTextHeight / 2 + (currentFont * 0.35);

      ctx.font = `600 ${currentFont}px Inter, system-ui, -apple-system, 'Segoe UI', Roboto`;
      ctx.fillStyle = "rgba(255,255,255,0.98)";
      currentLines.forEach((l) => {
        ctx.fillText(l, width / 2, currentY);
        currentY += lineHeight;
      });

      // Reference + version + link
      ctx.font = `600 ${refFontPx}px Inter, system-ui, -apple-system, 'Segoe UI', Roboto`;
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.textAlign = "left";

      // Draw logo at footer left (height = 120px)
      const logoImg = new Image();
      logoImg.src = "/bibliaonlogo.png";
      await new Promise<void>((res, rej) => {
        logoImg.onload = () => res();
        logoImg.onerror = () => res(); // continue even if logo fails
      });

      const logoHeight = 240;
      const logoScale = (logoImg.width && logoImg.height) ? logoHeight / logoImg.height : 1;
      const logoWidth = logoImg.width ? Math.round(logoImg.width * logoScale) : Math.round(logoHeight);
      const footerY = height - 160;
      const footerPaddingLeft = cardX + 20;

      if (logoImg.width && logoImg.height) {
        ctx.drawImage(logoImg, footerPaddingLeft, footerY - (logoHeight / 2), logoWidth, logoHeight);
      }

      // Draw brand text "Bíblia On" to the right of logo
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = `700 ${Math.round(refFontPx * 1.05)}px Inter, system-ui, -apple-system, 'Segoe UI', Roboto`;
      const brandX = footerPaddingLeft + (logoWidth ? logoWidth + 20 : 0);
      ctx.fillText("Bíblia On", brandX, footerY + 12);

      // Draw reference and version/link right-aligned
      ctx.textAlign = "right";
      ctx.font = `600 ${refFontPx}px Inter, system-ui, -apple-system, 'Segoe UI', Roboto`;
      ctx.fillText(ref, width - cardX - 20, height - 120);
      ctx.font = `500 ${Math.round(refFontPx * 0.9)}px Inter, system-ui, -apple-system, 'Segoe UI', Roboto`;
      ctx.fillText(`(${versionLabel}) • https://bibliaon.vercel.app/`, width - cardX - 20, height - 88);

      // export blob
      const blob: Blob | null = await new Promise((res) => canvas.toBlob((b) => res(b), "image/png", 0.95));
      if (!blob) throw new Error("Falha ao gerar imagem");
      return blob;
    } finally {
      setIsGeneratingImage(false);
    }
  }

  // Compartilhar imagem via Web Share API (com arquivo) ou baixar
  async function shareImageOrDownload() {
    try {
      setIsGeneratingImage(true);
      const blob = await generateImageBlob();
      const file = new File([blob], "versiculo.png", { type: "image/png" });

      // navigator.canShare may exist in some environments
      const anyNav: any = navigator as any;
      if (anyNav.canShare && anyNav.canShare({ files: [file] })) {
        await anyNav.share({
          files: [file],
          title: `${selectedBook?.name} ${selectedChapter}`,
          text: createShareText(true),
        });
      } else {
        // fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "versiculo.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        alert("Imagem baixada. Abra o Instagram/WhatsApp e poste a imagem manualmente.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar/compartilhar a imagem.");
    } finally {
      setIsGeneratingImage(false);
    }
  }

  // WhatsApp share via URL
  function shareViaWhatsApp() {
    const text = encodeURIComponent(createShareText());
    const url = `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  }

  // Instagram: generate image and download (user posts manually)
  async function shareToInstagram() {
    await shareImageOrDownload();
    alert("Imagem pronta. No celular, abra o Instagram e poste a imagem baixada.");
  }

  // Copy text to clipboard
  async function copyText() {
    const text = createShareText();
    try {
      await navigator.clipboard.writeText(text);
      alert("Texto copiado para a área de transferência.");
    } catch {
      alert("Não foi possível copiar o texto.");
    }
  }

  // generic share (text)
  async function shareGeneric() {
    const text = createShareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: selectedBook?.name, text });
      } catch {
        // cancelado
      }
    } else {
      await copyText();
    }
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <main>
      {/* Header */}
      <div className="sticky top-16 z-40 pb-4 mb-4 border-b border-border  backdrop-blur">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="text-lg font-semibold text-yellow-500 hover:text-yellow-400">
            {selectedBook.name} {selectedChapter}:{selectedVerse}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={gotoPrevVerse}
              className="px-3 py-1 border border-border rounded text-yellow-500 hover:text-yellow-400"
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
              className="px-3 py-1 border border-border rounded text-yellow-500 hover:text-yellow-400"
            >
              Próximo→
            </button>
          </div>
        </div>
      </div>

      {/* Versículos */}
      <div className="max-w-5xl mx-auto space-y-3">
        {chapterVerses.map((text, idx) => {
          const num = idx + 1;
          const isSelected = multiSelect.includes(num);
          const isActive = num === selectedVerse;

          return (
            <div key={idx} className="relative">
              <p
                id={`verse-${selectedChapter}-${num}`}
                onClick={() => toggleVerse(num)}
                className={`cursor-pointer leading-relaxed p-3 rounded border-border transition
                  ${isActive ? "text-2xl bg-surface-highlight border-l-4 border-orange-500" : ""}
                  ${isSelected ? "bg-orange-500/50 text-foreground border-l-4 border-orange-500 shadow-md transform scale-[1.01]" : ""}
                `}
              >
                <span className="font-semibold mr-3">{num}.</span>
                {text}
              </p>

              {/* share icon moved to right and below the verse box */}
              {isActive && !showSheet && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startShareMode(num);
                  }}
                  className="absolute right-1 -bottom-6 opacity-80 hover:opacity-100 transition bg-yellow-500/40 border border-border rounded px-2 py-1 shadow-sm"
                  title="Compartilhar"
                ><span className="text-sm font-medium">Compartilhar</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="inline-block"
                    
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/>
                    <line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom sheet modal for sharing */}
      {showSheet && (
        <div className="fixed inset-x-0 bottom-0 z-50">
          <div className="bg-surface text-yellow-500 border-t border-border px-4 py-3 shadow-xl flex items-center justify-between gap-3">
            <div className="flex gap-3 items-center">
              {/* <button
                onClick={shareViaWhatsApp}
                className="flex flex-col items-center text-sm px-2 py-1"
                title="WhatsApp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-1.5 4.7l.1.2-1 3-3-.9a8.5 8.5 0 1 1 5.4-7z"/>
                  <path d="M19 15c-.3-.2-1.8-1-2-1.1-.2-.1-.4-.1-.6.1l-.6.6c-.1.2-.3.2-.5.1-.5-.2-1.6-1-2.6-2-1-.9-1.3-1.6-1.5-1.8-.1-.2 0-.4.1-.6l.6-.6c.2-.2.2-.4.1-.6C9.8 6.8 9 6 8.9 5.9 8.7 5.7 8.6 5.7 8.4 5.9 7.6 6.6 7 7.6 7 8.6c0 1.2.4 2.4 1.3 3.5 1 1.1 2 1.9 3 2.4.9.5 1.6.6 2 .7.3.1.8.1 1 .1.6 0 1 .3 1.3.6.2.2.2.4.1.6z"/>
                </svg>
                <span className="text-xs mt-1">WhatsApp</span>
              </button> */}

              <button
                onClick={shareToInstagram}
                className="flex flex-col items-center text-sm px-2 py-1"
                title="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8"></path>
                </svg>
                <span className="text-xs mt-1">Instagram</span>
              </button>

              <button
                onClick={copyText}
                className="flex flex-col items-center text-sm px-2 py-1"
                title="Copiar Texto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span className="text-xs mt-1">Copiar</span>
              </button>

              <button
                onClick={shareImageOrDownload}
                className="flex flex-col items-center text-sm px-2 py-1"
                title="Gerar imagem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <path d="M21 15l-5-5L5 21"></path>
                </svg>
                <span className="text-xs mt-1">Imagem</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={shareGeneric}
                className="px-3 py-1 rounded border border-border hover:bg-surface-highlight"
              >
                texto
              </button>

              <button
                onClick={cancelSelection}
                className="px-3 py-1 rounded border border-border hover:bg-surface-highlight"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top button */}
      {showTopButton && (
        <button
          onClick={scrollToTop}
          className="
            fixed bottom-6 right-6 p-3 rounded-full
            bg-surface/70 text-foreground backdrop-blur-md border border-border
            shadow-md hover:bg-surface/90 transition flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M5 15l7-7 7 7"/>
          </svg>
        </button>
      )}
    </main>
  );
}
