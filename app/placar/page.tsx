import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { listarLideres } from "@/services/jogo";
import { PaginaJardim } from "@/app/_components/pagina-jardim";
import { formatarDataPartida } from "@/lib/data-partida";

export const metadata: Metadata = { title: "Placar de líderes" };

async function TabelaDeLideres() {
  await connection();
  const lideres = await listarLideres();
  if (!lideres.length) return <p className="mt-5 text-moss">Ainda não há partidas registradas.</p>;

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full text-left text-sm sm:text-base">
        <thead className="bg-leaf">
          <tr>
            <th scope="col" className="p-2 sm:p-3">Posição</th>
            <th scope="col" className="p-2 sm:p-3">Jogador</th>
            <th scope="col" className="p-2 text-right sm:p-3">Pontos</th>
            <th scope="col" className="p-2 text-right sm:p-3">Combo</th>
            <th scope="col" className="p-2 text-right sm:p-3">Data</th>
          </tr>
        </thead>
        <tbody>
          {lideres.map((lider, indice) => (
            <tr key={indice} className="border-b border-pine/10">
              <td className="p-2 sm:p-3">{indice + 1}</td>
              <td className="p-2 break-all sm:p-3">{lider.usuario.nome}</td>
              <td className="p-2 text-right font-bold sm:p-3">{lider.maiorPontuacao}</td>
              <td className="p-2 text-right sm:p-3">{lider.maiorComboGeral}</td>
              <td className="p-2 text-right whitespace-nowrap sm:p-3">
                <time dateTime={lider.historico.registradoEm.toISOString()}>
                  {formatarDataPartida.format(lider.historico.registradoEm)}
                </time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PlacarPage() {
  return (
    <PaginaJardim>
      <section className="jardim-card max-w-3xl">
        <h2 className="text-3xl font-black tracking-tight">Placar de líderes</h2>
        <Suspense fallback={<p className="mt-5 text-moss">Carregando placar…</p>}>
          <TabelaDeLideres />
        </Suspense>
        <Link href="/" className="button-secondary mt-5">Voltar ao menu principal</Link>
      </section>
    </PaginaJardim>
  );
}
