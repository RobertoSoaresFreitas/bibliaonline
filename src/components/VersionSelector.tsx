"use client";

import React from "react";
import { useBible } from "@/context/BibleContext";

type Version = "nvi" | "acf" | "aa";

export default function VersionSelector() {
  const { version, setVersion } = useBible();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // cast controlado: asserta que o value é um dos valores permitidos
    setVersion(e.target.value as Version);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm mb-1 text-foreground">Versão</label>

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
        <option value="nvi">NVI - Nova Versão Internacional</option>
        <option value="acf">ACF - Almeida Corrigida Fiel</option>
        <option value="aa">AA - Almeida Atualizada</option>
      </select>
    </div>
  );
}
