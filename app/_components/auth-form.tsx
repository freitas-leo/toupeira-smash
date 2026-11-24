"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

async function enviar(rota: "cadastro" | "login", dados: Record<string, string>) {
  const resposta = await fetch(`/api/auth/${rota}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => null);
    throw new Error(corpo?.erro ?? "Não foi possível concluir. Tente novamente.");
  }
}

export function AuthForm({ modo }: { modo: "cadastro" | "login" }) {
  const cadastro = modo === "cadastro";
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;
    const campos = new FormData(evento.currentTarget);
    const email = String(campos.get("email") ?? "");
    const senha = String(campos.get("senha") ?? "");
    if (new TextEncoder().encode(senha).length > 72) {
      setErro("Use uma senha de até 72 bytes. Letras com acento podem ocupar mais de um byte.");
      return;
    }
    setErro("");
    setEnviando(true);

    try {
      if (cadastro) {
        await enviar("cadastro", { nome: String(campos.get("nome") ?? ""), email, senha });
        window.location.replace("/login?cadastro=ok");
      } else {
        await enviar("login", { email, senha });
        window.location.replace("/jogo");
      }
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível concluir. Tente novamente.");
      setEnviando(false);
    }
  }

  return (
    <>
      <form method="post" action={`/api/auth/${modo}`} onSubmit={enviarFormulario} className="mt-6 grid gap-4">
        {cadastro && (
          <label className="text-sm font-bold">
            Nome
            <input className="form-input font-normal" name="nome" autoComplete="name" maxLength={45} required />
          </label>
        )}
        <label className="text-sm font-bold">
          E-mail
          <input className="form-input font-normal" type="email" name="email" autoComplete="email" maxLength={191} required />
        </label>
        <label className="text-sm font-bold">
          Senha
          <input
            className="form-input font-normal"
            type="password"
            name="senha"
            autoComplete={cadastro ? "new-password" : "current-password"}
            minLength={cadastro ? 8 : undefined}
            maxLength={72}
            aria-describedby={cadastro ? "requisito-senha" : undefined}
            required
          />
          {cadastro && <span id="requisito-senha" className="mt-1.5 block font-normal text-moss">Use pelo menos 8 caracteres.</span>}
        </label>
        {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{erro}</p>}
        <button className="button-primary mt-2" type="submit" disabled={enviando}>
          {enviando ? "Enviando…" : cadastro ? "Criar conta" : "Entrar"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-moss">
        {cadastro ? "Já tem conta? " : "Ainda sem conta? "}
        <Link href={cadastro ? "/login" : "/cadastro"} className="font-bold text-pine underline underline-offset-4">
          {cadastro ? "Entrar" : "Cadastrar"}
        </Link>
      </p>
    </>
  );
}
