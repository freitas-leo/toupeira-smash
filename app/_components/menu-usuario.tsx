import Link from "next/link";
import { cookies } from "next/headers";
import { cache } from "react";
import { COOKIE_SESSAO } from "@/lib/sessao";
import { consultarSessao } from "@/services/auth";
import { BotaoSair } from "./botao-sair";

const consultarSessaoAtual = cache(async () =>
  consultarSessao((await cookies()).get(COOKIE_SESSAO)?.value),
);

export async function MenuDaSessao() {
  const usuario = await consultarSessaoAtual();
  return usuario ? <MenuUsuario nome={usuario.nome} /> : null;
}

export async function LoginParaVisitante() {
  const usuario = await consultarSessaoAtual();
  return usuario ? null : <Link href="/login" className="button-secondary">Login</Link>;
}

export function MenuUsuario({ nome }: { nome: string }) {
  return (
    <details className="group relative z-10 max-w-full">
      <summary className="mole-outline flex cursor-pointer list-none items-center gap-2 font-extrabold [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true">👤</span>
        <span className="max-w-44 truncate" title={nome}>{nome}</span>
        <span aria-hidden="true" className="inline-block transition-transform duration-200 ease-out group-open:rotate-180 motion-reduce:transition-none">▾</span>
      </summary>
      <nav aria-label="Menu da conta" className="absolute start-0 top-full mt-2 min-w-44 rounded-2xl border border-[#d7ebe3] bg-white p-2 shadow-lg sm:start-auto sm:end-0">
        <Link href="/perfil" className="block rounded-xl px-3 py-2 font-bold hover:bg-leaf">Meu perfil</Link>
        <BotaoSair menu />
      </nav>
    </details>
  );
}
