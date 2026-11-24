import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const perfil = { id: true, nome: true, email: true, role: true } satisfies Prisma.UsuarioSelect;

export function criarUsuario(dados: Pick<Prisma.UsuarioCreateInput, "nome" | "email" | "senhaHash">) {
  return prisma.usuario.create({ data: dados, select: perfil });
}

export function buscarCredenciais(email: string) {
  return prisma.usuario.findUnique({
    where: { email },
    select: { ...perfil, ativo: true, senhaHash: true },
  });
}

export function atualizarPerfil(id: number, dados: Pick<Prisma.UsuarioUpdateInput, "nome" | "email">) {
  return prisma.usuario.update({ where: { id, ativo: true }, data: dados, select: perfil });
}

export async function criarSessao(
  usuarioId: number,
  tokenHash: string,
  expiraEm: Date,
  hashAnterior?: string,
) {
  await prisma.$transaction(async (tx) => {
    if (hashAnterior) await tx.sessao.deleteMany({ where: { tokenHash: hashAnterior } });
    await tx.sessao.create({ data: { usuarioId, tokenHash, expiraEm } });
  });
}

export async function buscarUsuarioDaSessao(tokenHash: string) {
  const sessao = await prisma.sessao.findUnique({
    where: { tokenHash, expiraEm: { gt: new Date() }, usuario: { ativo: true } },
    select: { usuario: { select: perfil } },
  });
  return sessao?.usuario;
}

export async function apagarSessao(tokenHash: string) {
  await prisma.sessao.deleteMany({ where: { tokenHash } });
}
