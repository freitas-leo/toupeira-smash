import type { Historico, Nivel, Placar, Usuario } from "@/generated/prisma/client";

export type PartidaType = Pick<
  Historico,
  "nivelId" | "totalAparicoes" | "totalAcertos" | "totalErros" | "maiorCombo" | "duracaoSegundos"
> & { envioId: NonNullable<Historico["envioId"]> };

export type ResultadoType = Omit<Historico, "usuarioId" | "envioId">;

export type NivelType = Omit<Nivel, "fatorDificuldade"> & {
  fatorDificuldade: string;
};

export type LiderType = Pick<
  Placar,
  "maiorPontuacao" | "maiorComboGeral" | "totalPartidasJogadas" | "totalAcertosGeral"
> & { usuario: Pick<Usuario, "nome"> };
