import type { Usuario } from "@/generated/prisma/client";

export type CadastroType = Pick<Usuario, "nome" | "email"> & { senha: string };
export type LoginType = Pick<CadastroType, "email" | "senha">;
export type UsuarioType = Pick<Usuario, "id" | "nome" | "email" | "role">;
