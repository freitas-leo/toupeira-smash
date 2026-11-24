import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PaginaJardim } from "@/app/_components/pagina-jardim";
import { COOKIE_SESSAO } from "@/lib/sessao";
import { formatarDataPartida } from "@/lib/data-partida";
import { consultarSessao } from "@/services/auth";
import { listarMelhoresPartidas } from "@/services/jogo";
import { EditarPerfil } from "./editar-perfil";
import { BotaoSair } from "@/app/_components/botao-sair";

export const metadata: Metadata = { title: "Meu perfil" };

async function Perfil() {
  const usuario = await consultarSessao((await cookies()).get(COOKIE_SESSAO)?.value);
  if (!usuario) redirect("/login");
  const partidas = await listarMelhoresPartidas(usuario.id);

  return (
    <div className="w-full max-w-3xl space-y-4">
      <section className="jardim-card">
        <h2 className="text-3xl font-black">Meu perfil</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div><dt className="font-bold">Nome</dt><dd className="wrap-anywhere">{usuario.nome}</dd></div>
          <div><dt className="font-bold">E-mail</dt><dd className="wrap-anywhere">{usuario.email}</dd></div>
        </dl>
        <div className="mt-4 flex flex-wrap items-start gap-3">
          <EditarPerfil usuario={{ nome: usuario.nome, email: usuario.email }} />
          <BotaoSair />
        </div>
      </section>
      <section className="jardim-card">
        <h2 className="text-2xl font-black">Minhas 20 melhores partidas</h2>
        {partidas.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-leaf">
                <tr>
                  {["Posição", "Nível", "Pontos", "Acertos", "Erros", "Combo", "Data"].map((coluna) => (
                    <th key={coluna} scope="col" className="p-2">{coluna}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partidas.map((partida, indice) => (
                  <tr key={partida.id} className="border-b border-pine/10">
                    <td className="p-2">{indice + 1}</td>
                    <td className="p-2">{partida.nivel.nome}</td>
                    <td className="p-2 font-bold">{partida.pontuacaoTotal}</td>
                    <td className="p-2">{partida.totalAcertos}</td>
                    <td className="p-2">{partida.totalErros}</td>
                    <td className="p-2">{partida.maiorCombo}</td>
                    <td className="p-2">{formatarDataPartida.format(partida.registradoEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="mt-3 text-moss">Você ainda não tem partidas registradas.</p>}
        <nav aria-label="Navegação do perfil" className="mt-5 flex flex-wrap gap-2">
          <Link href="/" className="button-secondary">Voltar ao menu principal</Link>
          <Link href="/placar" className="button-secondary">Ver placar de líderes</Link>
        </nav>
      </section>
    </div>
  );
}

export default function PerfilPage() {
  return (
    <PaginaJardim>
      <Suspense fallback={<p className="jardim-card max-w-md">Carregando perfil…</p>}>
        <Perfil />
      </Suspense>
    </PaginaJardim>
  );
}
