"use client";

import { useState } from "react";

export function BotaoSair({ menu = false }: { menu?: boolean }) {
  const [saindo, setSaindo] = useState(false);
  const [erro, setErro] = useState("");

  async function sair() {
    setSaindo(true);
    setErro("");
    try {
      const resposta = await fetch("/api/auth/logout", { method: "POST" });
      if (!resposta.ok) throw new Error();
      window.location.replace("/");
    } catch {
      setErro("Não foi possível sair. Tente novamente.");
      setSaindo(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={sair}
        disabled={saindo}
        className={menu
          ? "w-full rounded-xl px-3 py-2 text-left font-bold text-[#9b473b] hover:bg-[#fff1ed] disabled:opacity-60"
          : "button-secondary h-12 py-0 text-[#9b473b] hover:bg-[#fff1ed] disabled:opacity-60"}
      >
        {saindo ? "Saindo…" : "Sair"}
      </button>
      {erro && <p role="alert" className="mt-2 max-w-52 px-2 text-sm text-red-800">{erro}</p>}
    </div>
  );
}
