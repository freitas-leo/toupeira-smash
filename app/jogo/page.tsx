import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErroApi } from "@/lib/http";
import { COOKIE_SESSAO } from "@/lib/sessao";
import { usuarioAutenticado } from "@/services/auth";
import { listarNiveis } from "@/services/jogo";
import { Tabuleiro } from "./tabuleiro";
import { MenuUsuario } from "@/app/_components/menu-usuario";

export const metadata: Metadata = { title: "Jogo" };

async function EntradaDoJogo() {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  const usuario = await usuarioAutenticado(token).catch((erro: unknown) => {
    if (erro instanceof ErroApi && erro.status === 401) redirect("/login");
    throw erro;
  });

  const niveis = await listarNiveis();
  return niveis.length ? (
    <Tabuleiro niveis={niveis} menuUsuario={<MenuUsuario nome={usuario.nome} />} />
  ) : <p>Nenhum nível disponível.</p>;
}

export default function JogoPage() {
  return (
    <main className="shell">
      <Suspense fallback={<p>Carregando o jogo…</p>}>
        <EntradaDoJogo />
      </Suspense>
    </main>
  );
}
