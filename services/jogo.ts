import type { LiderType, NivelType, PartidaType, ResultadoType } from "@/types/jogo";
import { ErroApi } from "@/lib/http";
import * as repository from "@/repositories/jogo";

export async function listarNiveis(): Promise<NivelType[]> {
  const niveis = await repository.listarNiveis();
  return niveis.map((nivel) => ({ ...nivel, fatorDificuldade: nivel.fatorDificuldade.toString() }));
}

export function listarLideres(): Promise<LiderType[]> {
  return repository.listarLideres();
}

export function listarPartidas(usuarioId: number): Promise<ResultadoType[]> {
  return repository.listarPartidas(usuarioId);
}

function lerInteiro(dados: Record<string, unknown>, campo: string, minimo: number, maximo: number) {
  const valor = dados[campo];
  if (typeof valor !== "number" || !Number.isInteger(valor) || valor < minimo || valor > maximo) {
    throw new ErroApi(400, `${campo} deve ser um inteiro entre ${minimo} e ${maximo}.`);
  }
  return valor;
}

export function registrarPartida(usuarioId: number, dados: Record<string, unknown>) {
  const envioId = dados.envioId;
  if (typeof envioId !== "string" || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(envioId)) {
    throw new ErroApi(400, "Informe um envioId no formato UUID v4.");
  }
  const totalAparicoes = lerInteiro(dados, "totalAparicoes", 1, 1000);
  const totalAcertos = lerInteiro(dados, "totalAcertos", 0, totalAparicoes);
  const partida: PartidaType = {
    envioId: envioId.toLowerCase(),
    nivelId: lerInteiro(dados, "nivelId", 1, 2147483647),
    totalAparicoes,
    totalAcertos,
    totalErros: lerInteiro(dados, "totalErros", 0, 1000),
    maiorCombo: lerInteiro(dados, "maiorCombo", totalAcertos > 0 ? 1 : 0, totalAcertos),
    duracaoSegundos: lerInteiro(dados, "duracaoSegundos", 30, 30),
  };
  const pontuacaoBase = Math.max(0, partida.totalAcertos * 10 - partida.totalErros * 5);
  return repository.gravarPartida({
    ...partida,
    usuarioId,
    pontuacaoBase,
    pontuacaoBonus: 0,
    pontuacaoTotal: pontuacaoBase,
  });
}
