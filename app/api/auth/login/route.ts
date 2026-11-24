import { NextRequest, NextResponse } from "next/server";
import { lerJson, responder } from "@/lib/http";
import { COOKIE_SESSAO, DURACAO_SESSAO, opcoesCookieSessao } from "@/lib/sessao";
import { login } from "@/services/auth";

export function POST(request: NextRequest) {
  return responder(async () => {
    const { usuario, token } = await login(
      await lerJson(request),
      request.cookies.get(COOKIE_SESSAO)?.value,
    );
    const resposta = NextResponse.json({ usuario }, { headers: { "Cache-Control": "no-store" } });
    resposta.cookies.set(COOKIE_SESSAO, token, { ...opcoesCookieSessao, maxAge: DURACAO_SESSAO });
    return resposta;
  });
}
