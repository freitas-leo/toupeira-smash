import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ErroApi } from "@/lib/http";

const resultado = {
  id: true,
  nivelId: true,
  totalAparicoes: true,
  totalAcertos: true,
  totalErros: true,
  maiorCombo: true,
  pontuacaoBase: true,
  pontuacaoBonus: true,
  pontuacaoTotal: true,
  duracaoSegundos: true,
  registradoEm: true,
} satisfies Prisma.HistoricoSelect;

export function listarNiveis() {
  return prisma.nivel.findMany({ orderBy: { id: "asc" } });
}

export function listarLideres() {
  return prisma.placar.findMany({
    where: { usuario: { ativo: true } },
    orderBy: [{ maiorPontuacao: "desc" }, { maiorComboGeral: "desc" }, { id: "asc" }],
    take: 50,
    select: {
      maiorPontuacao: true,
      maiorComboGeral: true,
      totalPartidasJogadas: true,
      totalAcertosGeral: true,
      usuario: { select: { nome: true } },
      historico: { select: { registradoEm: true } },
    },
  });
}

export function listarPartidas(usuarioId: number) {
  return prisma.historico.findMany({
    where: { usuarioId },
    orderBy: [{ registradoEm: "desc" }, { id: "desc" }],
    take: 50,
    select: resultado,
  });
}

export function listarMelhoresPartidas(usuarioId: number) {
  return prisma.historico.findMany({
    where: { usuarioId },
    orderBy: [{ pontuacaoTotal: "desc" }, { maiorCombo: "desc" }, { registradoEm: "desc" }, { id: "desc" }],
    take: 20,
    select: { ...resultado, nivel: { select: { nome: true } } },
  });
}

type NovaPartida = Prisma.HistoricoUncheckedCreateInput & { envioId: string };

export function gravarPartida(dados: NovaPartida) {
  return prisma.$transaction(async (tx) => {
    const { usuarioId, nivelId, envioId } = dados;
    // Serializa gravações do mesmo jogador antes de consultar o histórico e o placar.
    const usuarios = await tx.$queryRaw<{ ID: number }[]>`
      SELECT ID FROM usuario WHERE ID = ${usuarioId} AND ativo = TRUE FOR UPDATE
    `;
    if (!usuarios.length) throw new ErroApi(401, "Sessão inválida.");

    const existente = await tx.historico.findUnique({
      where: { usuarioId_envioId: { usuarioId, envioId } },
      select: resultado,
    });
    if (existente) {
      const campos = [
        "nivelId", "totalAparicoes", "totalAcertos", "totalErros", "maiorCombo", "duracaoSegundos",
      ] as const;
      if (campos.some((campo) => existente[campo] !== dados[campo])) {
        throw new ErroApi(409, "Identificador de envio já usado em outra partida.");
      }
      return { partida: existente, criada: false };
    }

    if (!(await tx.nivel.findUnique({ where: { id: nivelId }, select: { id: true } }))) {
      throw new ErroApi(404, "Nível não encontrado.");
    }
    const partida = await tx.historico.create({ data: dados, select: resultado });
    const placar = await tx.placar.findUnique({ where: { usuarioId } });

    if (!placar) {
      await tx.placar.create({
        data: {
          usuarioId,
          historicoId: partida.id,
          maiorPontuacao: partida.pontuacaoTotal,
          maiorComboGeral: partida.maiorCombo,
          totalPartidasJogadas: 1,
          totalAcertosGeral: partida.totalAcertos,
        },
      });
    } else {
      const melhorPontuacao = partida.pontuacaoTotal > placar.maiorPontuacao;
      await tx.placar.update({
        where: { usuarioId },
        data: {
          historicoId: melhorPontuacao ? partida.id : placar.historicoId,
          maiorPontuacao: Math.max(partida.pontuacaoTotal, placar.maiorPontuacao),
          maiorComboGeral: Math.max(partida.maiorCombo, placar.maiorComboGeral),
          totalPartidasJogadas: { increment: 1 },
          totalAcertosGeral: { increment: partida.totalAcertos },
        },
      });
    }
    return { partida, criada: true };
  });
}
