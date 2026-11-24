"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Ceu, Flores, Marca, Toupeira } from "@/app/_components/jardim";
import { calcularPontuacao } from "@/lib/regras-jogo";
import type { NivelType, PartidaType } from "@/types/jogo";
import {
  atualizarRodada, criarRodada, resultadoDaRodada, resumoInicial, tentarAcerto, type Rodada,
} from "./rodada";

const teclas = "QWEASDZXC";
const numeros = "789456123";
const iconesNivel: Record<string, string> = { "1": "🌱", "2": "🌼", "3": "🔥" };

type Envio = { partida: PartidaType; status: "enviando" | "salva" | "erro"; mensagem?: string };

export function Tabuleiro({ niveis, menuUsuario }: { niveis: NivelType[]; menuUsuario: ReactNode }) {
  const [nivelId, setNivelId] = useState(niveis[0].id);
  const [resumo, setResumo] = useState(resumoInicial);
  const [jogando, setJogando] = useState(false);
  const [envio, setEnvio] = useState<Envio>();
  const [mostrarMatematica, setMostrarMatematica] = useState(false);
  const [efeitos, setEfeitos] = useState<{ id: number; posicao: number }[]>([]);
  const tabuleiro = useRef<HTMLDivElement>(null);
  const rodada = useRef<Rodada | null>(null);
  const enviando = useRef(false);
  const pontos = calcularPontuacao(resumo.acertos, resumo.erros);
  const tentativas = resumo.acertos + resumo.erros;
  const precisao = tentativas ? (100 * resumo.acertos / tentativas).toFixed(1).replace(".", ",") : "0";

  const salvar = useCallback(async (partida: PartidaType) => {
    if (enviando.current) return;
    enviando.current = true;
    setEnvio({ partida, status: "enviando" });
    try {
      const resposta = await fetch("/api/partidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partida),
      });
      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => null);
        throw new Error(dados?.erro ?? "Não foi possível salvar a partida.");
      }
      setEnvio({ partida, status: "salva" });
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : "Não foi possível salvar a partida.";
      setEnvio({ partida, status: "erro", mensagem });
    } finally {
      enviando.current = false;
    }
  }, []);

  function iniciar() {
    const nivel = niveis.find((item) => item.id === nivelId);
    if (!nivel || rodada.current || enviando.current) return;
    const nova = criarRodada(nivel, performance.now(), crypto.randomUUID());
    atualizarRodada(nova, performance.now(), sortearPosicao);
    rodada.current = nova;
    setResumo({ ...nova });
    setEfeitos([]);
    setEnvio(undefined);
    setJogando(true);
  }

  const acertar = useCallback((posicao: number) => {
    const atual = rodada.current;
    if (!atual) return;
    const acertos = atual.acertos;
    tentarAcerto(atual, posicao, performance.now());
    if (atual.acertos > acertos) {
      const id = atual.acertos;
      setEfeitos((anteriores) => [...anteriores, { id, posicao }]);
    }
    if (atual.segundos) setResumo({ ...atual });
  }, []);

  useEffect(() => {
    function pressionar(evento: KeyboardEvent) {
      if (!rodada.current || evento.repeat || evento.ctrlKey || evento.altKey || evento.metaKey) return;
      if (evento.target instanceof HTMLElement &&
        (evento.target.isContentEditable || evento.target.closest("input, select, textarea"))) return;
      const tecla = evento.key;
      if (tecla.length !== 1) return;
      const letra = teclas.indexOf(tecla.toUpperCase());
      const posicao = letra >= 0 ? letra : numeros.indexOf(tecla);
      if (posicao < 0) return;
      evento.preventDefault();
      const casa = tabuleiro.current?.children.item(posicao);
      if (casa instanceof HTMLElement) {
        casa.classList.remove("key-pressed");
        void casa.offsetWidth;
        casa.classList.add("key-pressed");
      }
      acertar(posicao);
    }
    window.addEventListener("keydown", pressionar);
    return () => window.removeEventListener("keydown", pressionar);
  }, [acertar]);

  useEffect(() => {
    if (!jogando) return;
    const relogio = window.setInterval(() => {
      const atual = rodada.current;
      if (!atual) return;
      const { ativa, segundos, aparicoes } = atual;
      atualizarRodada(atual, performance.now(), sortearPosicao);
      if (atual.segundos === 0) {
        rodada.current = null;
        setJogando(false);
        for (const casa of Array.from(tabuleiro.current?.children ?? [])) {
          casa.classList.remove("key-pressed");
        }
        const pontos = calcularPontuacao(atual.acertos, atual.erros);
        setResumo({ ...atual, mensagem: `🏁 Fim de jogo! Você marcou ${pontos} pontos.` });
        void salvar(resultadoDaRodada(atual));
      } else if (ativa !== atual.ativa || segundos !== atual.segundos || aparicoes !== atual.aparicoes) {
        setResumo({ ...atual });
      }
    }, 25);
    return () => window.clearInterval(relogio);
  }, [jogando, salvar]);

  return (
    <>
      <header className="top">
        <Marca />
        <div className="flex flex-wrap items-center gap-2">
          <button className="mole-outline" type="button" aria-expanded={mostrarMatematica}
            aria-controls="painel-matematica" onClick={() => setMostrarMatematica(!mostrarMatematica)}>
            {mostrarMatematica ? "✕ Ocultar Matemática" : "∑ Ver a Matemática"}
          </button>
          {menuUsuario}
        </div>
      </header>
      <section className="dashboard" aria-label="Placar">
        <Estatistica icone="🏆" rotulo="PONTUAÇÃO">{pontos}</Estatistica>
        <Estatistica icone="⏱️" rotulo="TEMPO">{resumo.segundos}<i>s</i></Estatistica>
        <Estatistica icone="🎯" rotulo="ACERTOS">{resumo.acertos}</Estatistica>
        <Estatistica icone="💨" rotulo="ERROS">{resumo.erros}</Estatistica>
      </section>

      <section className="game">
        <Ceu />
        <div className="toolbar">
          <div className="toolbar-title"><span className="live-dot" /> JARDIM DAS TOUPEIRAS</div>
          <div className="controls">
            <label htmlFor="nivel">Nível</label>
            <select id="nivel" value={nivelId} disabled={jogando}
              onChange={(evento) => setNivelId(Number(evento.target.value))}>
              {niveis.map((nivel) => (
                <option key={nivel.id} value={nivel.id}>
                  {iconesNivel[nivel.numeroNivel]} {nivel.nome}
                </option>
              ))}
            </select>
            <button type="button" onClick={iniciar} disabled={jogando || envio?.status === "enviando"}>
              ▶ Jogar agora
            </button>
          </div>
        </div>
        <div className="message" role="status">{resumo.mensagem}</div>
        <div ref={tabuleiro} role="group" aria-label="Tabuleiro de nove posições" className="board">
          {Array.from(teclas, (tecla, posicao) => {
            const ativa = resumo.ativa === posicao;
            return (
              <button key={tecla} type="button" className="hole" data-ativa={ativa}
                onClick={() => acertar(posicao)} aria-disabled={!jogando}
                aria-label={`Posição ${posicao + 1}, tecla ${tecla}${ativa ? ", toupeira ativa" : ""}`}>
                <Toupeira ativa={ativa} />
                <span className="keycap" aria-hidden="true">{tecla}</span>
                {efeitos.filter((efeito) => efeito.posicao === posicao).map(({ id }) => (
                  <span key={id} className="pop" aria-hidden="true"
                    onAnimationEnd={() => setEfeitos((atuais) => atuais.filter((efeito) => efeito.id !== id))}>
                    +10 ✨
                  </span>
                ))}
              </button>
            );
          })}
        </div>
        <Flores />
      </section>

      <section className="below">
        <div className="tip">💡 <b>Dica:</b> acerte a toupeira antes que ela desapareça. Use Q W E / A S D / Z X C ou o teclado numérico (7 8 9 / 4 5 6 / 1 2 3). Cada acerto vale 10 pontos!</div>
        <div className="chip">✦ 9 posições · matriz 3 × 3</div>
      </section>

      {envio && (
        <div className="tip mt-4 flex flex-wrap items-center gap-3">
          <p role="status">{envio.status === "enviando" ? "Salvando partida…" :
            envio.status === "salva" ? "Partida salva." : envio.mensagem}</p>
          {envio.status === "erro" && (
            <button type="button" className="mole-outline" onClick={() => void salvar(envio.partida)}>Tentar salvar novamente</button>
          )}
          {envio.status === "salva" && (
            <>
              <Link className="font-bold underline" href="/">Voltar ao menu principal</Link>
              <Link className="font-bold underline" href="/placar">Ver placar de líderes</Link>
            </>
          )}
        </div>
      )}

      <section id="painel-matematica" className="math-panel" hidden={!mostrarMatematica}>
        <div className="math-head">
          <span className="math-icon" aria-hidden="true">∑</span>
          <div><h2>A matemática em ação</h2><p>Veja a lógica por trás de cada rodada</p></div>
        </div>
        <div className="math-grid">
          <div className="math-tile">
            <h3>Matriz 3 × 3</h3>
            <p>1 = toupeira ativa · 0 = vazio</p>
            <pre>{[0, 1, 2].map((linha) =>
              [0, 1, 2].map((coluna) => Number(resumo.ativa === linha * 3 + coluna)).join("  "),
            ).join("\n")}</pre>
          </div>
          <div className="math-tile">
            <h3>Probabilidade</h3><strong>1/9 ≈ 11,11%</strong>
            <p>Chance de cada posição em um sorteio uniforme.</p>
          </div>
          <div className="math-tile">
            <h3>Pontuação</h3><strong>P = máx(0, 10a − 5e)</strong>
            <p>10 pontos por acerto e penalidade de 5 por erro.</p>
          </div>
          <div className="math-tile">
            <h3>Precisão</h3><strong>{precisao}%</strong>
            <p>Acertos divididos pelo total de cliques válidos.</p>
          </div>
        </div>
      </section>
      <footer>Feito para a A3 · Matemática Computacional Aplicada · Next.js + TypeScript</footer>
    </>
  );
}

function Estatistica({ icone, rotulo, children }: { icone: string; rotulo: string; children: ReactNode }) {
  return (
    <div className="stat">
      <span className="stat-icon" aria-hidden="true">{icone}</span>
      <div><small>{rotulo}</small><strong>{children}</strong></div>
    </div>
  );
}

function sortearPosicao() {
  return Math.floor(Math.random() * 9);
}
