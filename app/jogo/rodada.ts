import { DURACAO_PARTIDA } from "@/lib/regras-jogo";
import type { NivelType, PartidaType } from "@/types/jogo";

const intervalos: Record<string, number> = { "1": 1050, "2": 800, "3": 570 };

export const resumoInicial = {
  aparicoes: 0,
  acertos: 0,
  erros: 0,
  maiorCombo: 0,
  combo: 0,
  ativa: null as number | null,
  segundos: DURACAO_PARTIDA,
  mensagem: "Escolha o nível e prepare seu reflexo!",
};

export function criarRodada(nivel: NivelType, agora: number, envioId: string) {
  return {
    ...resumoInicial,
    nivelId: nivel.id,
    envioId,
    fim: agora + DURACAO_PARTIDA * 1000,
    proxima: agora,
    expira: agora,
    ultimoErro: -Infinity,
    exposicao: nivel.tempoExposicaoMs,
    intervalo: Math.max(nivel.tempoExposicaoMs, intervalos[nivel.numeroNivel] ?? nivel.tempoExposicaoMs + 100),
    mensagem: "Boa sorte! Acerte as toupeiras!",
  };
}

export type Rodada = ReturnType<typeof criarRodada>;

function atualizarTempo(rodada: Rodada, agora: number) {
  rodada.segundos = Math.max(0, Math.ceil((rodada.fim - agora) / 1000));
  if (rodada.ativa !== null && (agora >= rodada.expira || !rodada.segundos)) {
    rodada.ativa = null;
    rodada.combo = 0;
  }
}

export function atualizarRodada(rodada: Rodada, agora: number, sortear: () => number) {
  atualizarTempo(rodada, agora);
  if (rodada.segundos && agora >= rodada.proxima) {
    rodada.ativa = sortear();
    rodada.aparicoes++;
    rodada.expira = agora + rodada.exposicao;
    rodada.proxima = agora + rodada.intervalo;
  }
}

export function tentarAcerto(rodada: Rodada, posicao: number, agora: number) {
  atualizarTempo(rodada, agora);
  if (!rodada.segundos) return;
  if (rodada.ativa === posicao) {
    rodada.ativa = null;
    rodada.acertos++;
    rodada.combo++;
    rodada.maiorCombo = Math.max(rodada.maiorCombo, rodada.combo);
    rodada.mensagem = "✨ Acertou! +10 pontos";
  } else if (agora - rodada.ultimoErro >= 220) {
    rodada.ultimoErro = agora;
    rodada.erros++;
    rodada.combo = 0;
    rodada.mensagem = "Ops! −5 pontos";
  }
}

export function resultadoDaRodada(rodada: Rodada): PartidaType {
  return {
    envioId: rodada.envioId,
    nivelId: rodada.nivelId,
    totalAparicoes: rodada.aparicoes,
    totalAcertos: rodada.acertos,
    totalErros: rodada.erros,
    maiorCombo: rodada.maiorCombo,
    duracaoSegundos: DURACAO_PARTIDA,
  };
}
