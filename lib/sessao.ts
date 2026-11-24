export const COOKIE_SESSAO = "toupeira_sessao";
export const DURACAO_SESSAO = 60 * 60 * 24 * 7;
export const FORMATO_TOKEN = /^[a-f0-9]{64}$/;

export const opcoesCookieSessao = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;
