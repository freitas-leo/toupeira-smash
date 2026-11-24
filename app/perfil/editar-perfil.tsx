"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import type { UsuarioType } from "@/types/auth";

export function EditarPerfil({ usuario }: { usuario: Pick<UsuarioType, "nome" | "email"> }) {
  const router = useRouter();
  const modal = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState(usuario.email);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);
  const mudouEmail = email.trim().toLowerCase() !== usuario.email;

  function abrir() {
    modal.current?.querySelector("form")?.reset();
    setEmail(usuario.email);
    setErro("");
    setMensagem("");
    modal.current?.showModal();
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (salvando) return;
    setSalvando(true);
    setErro("");
    const dados = Object.fromEntries(new FormData(evento.currentTarget));
    try {
      const resposta = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => null);
        throw new Error(corpo?.erro ?? "Não foi possível atualizar o perfil.");
      }
      modal.current?.close();
      setMensagem("Perfil atualizado.");
      router.refresh();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível atualizar o perfil.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <button type="button" className="button-primary h-12 py-0" onClick={abrir}>Editar perfil</button>
      {mensagem && <p role="status" className="order-last basis-full text-sm font-bold text-moss">{mensagem}</p>}
      <dialog ref={modal} aria-labelledby="titulo-edicao" className="perfil-modal"
        onCancel={(evento) => { if (salvando) evento.preventDefault(); }}>
        <div className="perfil-modal-cabecalho">
          <h3 id="titulo-edicao" className="text-2xl font-black tracking-tight">Editar perfil</h3>
          <button type="button" aria-label="Fechar" className="perfil-modal-fechar" disabled={salvando}
            onClick={() => modal.current?.close()}>×</button>
        </div>
        <form method="post" onSubmit={salvar} className="perfil-modal-form">
          <label className="text-sm font-bold">Nome
            <input name="nome" className="form-input font-normal" defaultValue={usuario.nome} autoComplete="name" maxLength={45} required />
          </label>
          <label className="text-sm font-bold">E-mail
            <input name="email" type="email" className="form-input font-normal" value={email} onChange={(evento) => setEmail(evento.target.value)} autoComplete="email" maxLength={191} required />
          </label>
          {mudouEmail && (
            <label className="text-sm font-bold">Confirme sua senha atual para alterar o e-mail
              <input name="senhaAtual" type="password" className="form-input font-normal" autoComplete="current-password" maxLength={72} required />
            </label>
          )}
          {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{erro}</p>}
          <div className="perfil-modal-acoes">
            <button type="button" className="button-secondary h-12 py-0" disabled={salvando} onClick={() => modal.current?.close()}>Cancelar</button>
            <button type="submit" className="button-primary h-12 py-0" disabled={salvando}>{salvando ? "Salvando…" : "Salvar alterações"}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
