import { createHash, randomBytes } from "node:crypto";
import { connection } from "next/server";
import { compare, hash } from "bcryptjs";
import type { CadastroType, LoginType, UsuarioType } from "@/types/auth";
import { Prisma } from "@/generated/prisma/client";
import { ErroApi } from "@/lib/http";
import { DURACAO_SESSAO, FORMATO_TOKEN } from "@/lib/sessao";
import * as repository from "@/repositories/auth";

const CUSTO_BCRYPT = 12;
const hashDeReferencia = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6Ttx6Wf7eVfFjoSZy139JeY98r5C.";

function lerEmail(valor: unknown) {
  const email = typeof valor === "string" ? valor.trim().toLowerCase() : "";
  if (email.length > 191 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ErroApi(400, "Informe um e-mail válido.");
  }
  return email;
}

function lerSenha(senha: unknown) {
  if (typeof senha !== "string" || !senha.length || Buffer.byteLength(senha, "utf8") > 72) {
    throw new ErroApi(400, "A senha deve ter entre 1 e 72 bytes.");
  }
  return senha;
}

function lerNome(valor: unknown) {
  const nome = typeof valor === "string" ? valor.trim() : "";
  if (!nome || nome.length > 45) throw new ErroApi(400, "O nome deve ter de 1 a 45 caracteres.");
  return nome;
}

function lerCredenciais(dados: Record<string, unknown>): LoginType {
  return { email: lerEmail(dados.email), senha: lerSenha(dados.senha) };
}

export async function cadastrar(dados: Record<string, unknown>): Promise<UsuarioType> {
  const credenciais = lerCredenciais(dados);
  const nome = lerNome(dados.nome);
  if (credenciais.senha.length < 8) throw new ErroApi(400, "Use pelo menos 8 caracteres na senha.");

  const cadastro: CadastroType = { nome, ...credenciais };
  const senhaHash = await hash(cadastro.senha, CUSTO_BCRYPT);
  try {
    return await repository.criarUsuario({ nome: cadastro.nome, email: cadastro.email, senhaHash });
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
      throw new ErroApi(409, "Já existe uma conta com esse e-mail.");
    }
    throw erro;
  }
}

export async function atualizarPerfil(usuario: UsuarioType, dados: Record<string, unknown>): Promise<UsuarioType> {
  const nome = lerNome(dados.nome);
  const email = lerEmail(dados.email);
  if (email !== usuario.email) {
    const senha = lerSenha(dados.senhaAtual);
    const conta = await repository.buscarCredenciais(usuario.email);
    if (!conta?.ativo || conta.id !== usuario.id || !(await compare(senha, conta.senhaHash))) {
      throw new ErroApi(403, "Senha atual incorreta.");
    }
  }

  try {
    return await repository.atualizarPerfil(usuario.id, { nome, ...(email !== usuario.email && { email }) });
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
      throw new ErroApi(409, "Já existe uma conta com esse e-mail.");
    }
    throw erro;
  }
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function login(dados: Record<string, unknown>, tokenAnterior?: string) {
  const { email, senha } = lerCredenciais(dados);
  const conta = await repository.buscarCredenciais(email);
  const senhaValida = await compare(senha, conta?.senhaHash ?? hashDeReferencia);
  if (!conta?.ativo || !senhaValida) throw new ErroApi(401, "E-mail ou senha inválidos.");

  const token = randomBytes(32).toString("hex");
  const expiraEm = new Date(Date.now() + DURACAO_SESSAO * 1000);
  const hashAnterior = tokenAnterior && FORMATO_TOKEN.test(tokenAnterior)
    ? hashToken(tokenAnterior)
    : undefined;
  await repository.criarSessao(conta.id, hashToken(token), expiraEm, hashAnterior);
  const usuario: UsuarioType = { id: conta.id, nome: conta.nome, email: conta.email, role: conta.role };
  return { usuario, token };
}

export async function consultarSessao(token?: string): Promise<UsuarioType | undefined> {
  if (!token || !FORMATO_TOKEN.test(token)) return undefined;
  await connection();
  return repository.buscarUsuarioDaSessao(hashToken(token));
}

export async function usuarioAutenticado(token?: string): Promise<UsuarioType> {
  const usuario = await consultarSessao(token);
  if (!usuario) throw new ErroApi(401, "Sessão inválida.");
  return usuario;
}

export async function logout(token?: string) {
  if (token && FORMATO_TOKEN.test(token)) await repository.apagarSessao(hashToken(token));
}
