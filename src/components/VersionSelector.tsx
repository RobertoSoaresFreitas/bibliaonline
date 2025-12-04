"use client";

import React from "react";
import { useBible } from "@/context/BibleContext";

type Version = "aa" | "acf" | "nvi";

export default function VersionSelector() {
  const { version, setVersion } = useBible();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // cast controlado: asserta que o value é um dos valores permitidos
    setVersion(e.target.value as Version);
  };

  return (
    <div className="mb-4">
      <strong className="text-lg text-primary mb-2">Versão</strong>

      <select
        value={version}
        onChange={handleChange}
        className="
          w-full px-3 py-2 rounded
          bg-surface text-foreground
          border border-border
          hover:bg-surface/50
          transition
        "
      >
        <option value="aa">AA - Almeida Atualizada</option>
        <option value="acf">ACF - Almeida Corrigida Fiel</option>
        <option value="nvi">NVI - Nova Versão Internacional</option>
      </select>
    </div>
  );
}
