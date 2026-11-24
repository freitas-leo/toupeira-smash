import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { listarPartidasDoPlacar } from "@/services/jogo";
import { PaginaJardim } from "@/app/_components/pagina-jardim";
import { formatarDataPartida } from "@/lib/data-partida";

export const metadata: Metadata = { title: "Placar de líderes" };

const filtros = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "dificil", rotulo: "Difícil", numeroNivel: "3" },
  { valor: "medio", rotulo: "Médio", numeroNivel: "2" },
  { valor: "facil", rotulo: "Fácil", numeroNivel: "1" },
];

async function PlacarFiltrado({ searchParams }: Pick<PageProps<"/placar">, "searchParams">) {
  const { dificuldade } = await searchParams;
  const selecionado = filtros.find(({ valor }) => valor === dificuldade) ?? filtros[0];
  return (
    <>
      <nav aria-label="Filtrar por dificuldade" className="mt-4 flex flex-wrap gap-2">
        {filtros.map(({ valor, rotulo }) => (
          <Link
            key={valor}
            href={valor === "todos" ? "/placar" : `/placar?dificuldade=${valor}`}
            aria-current={selecionado.valor === valor ? "page" : undefined}
            className="rounded-xl border border-[#d7ebe3] px-3 py-2 text-sm font-extrabold text-pine transition-colors hover:bg-leaf aria-[current=page]:border-pine aria-[current=page]:bg-pine aria-[current=page]:text-white"
          >
            {rotulo}
          </Link>
        ))}
      </nav>
      <TabelaDeLideres numeroNivel={selecionado.numeroNivel} />
    </>
  );
}

async function TabelaDeLideres({ numeroNivel }: { numeroNivel?: string }) {
  await connection();
  const partidas = await listarPartidasDoPlacar(numeroNivel);
  if (!partidas.length) return (
    <p className="mt-5 text-moss">
      {numeroNivel ? "Ainda não há partidas nessa dificuldade." : "Ainda não há partidas registradas."}
    </p>
  );

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full text-left text-sm sm:text-base">
        <thead className="bg-leaf">
          <tr>
            <th scope="col" className="p-2 sm:p-3">Posição</th>
            <th scope="col" className="p-2 sm:p-3">Jogador</th>
            {!numeroNivel && <th scope="col" className="p-2 sm:p-3">Dificuldade</th>}
            <th scope="col" className="p-2 text-right sm:p-3">Pontos</th>
            <th scope="col" className="p-2 text-right sm:p-3">Combo</th>
            <th scope="col" className="p-2 text-right sm:p-3">Data</th>
          </tr>
        </thead>
        <tbody>
          {partidas.map((partida, indice) => (
            <tr key={partida.id} className="border-b border-pine/10">
              <td className="p-2 sm:p-3">{indice + 1}</td>
              <td className="p-2 break-all sm:p-3">{partida.usuario.nome}</td>
              {!numeroNivel && <td className="p-2 sm:p-3">{partida.nivel.nome}</td>}
              <td className="p-2 text-right font-bold sm:p-3">{partida.pontuacaoTotal}</td>
              <td className="p-2 text-right sm:p-3">{partida.maiorCombo}</td>
              <td className="p-2 text-right whitespace-nowrap sm:p-3">
                <time dateTime={partida.registradoEm.toISOString()}>
                  {formatarDataPartida.format(partida.registradoEm)}
                </time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PlacarPage({ searchParams }: PageProps<"/placar">) {
  return (
    <PaginaJardim>
      <section className="jardim-card max-w-3xl">
        <h2 className="text-3xl font-black tracking-tight">Placar de líderes</h2>
        <Suspense fallback={<p className="mt-5 text-moss">Carregando placar…</p>}>
          <PlacarFiltrado searchParams={searchParams} />
        </Suspense>
        <Link href="/" className="button-secondary mt-5">Voltar ao menu principal</Link>
      </section>
    </PaginaJardim>
  );
}
