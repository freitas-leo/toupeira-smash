import { NextRequest, NextResponse } from "next/server";
import { responder, verificarOrigem } from "@/lib/http";
import { COOKIE_SESSAO, opcoesCookieSessao } from "@/lib/sessao";
import { logout } from "@/services/auth";

export function POST(request: NextRequest) {
  return responder(async () => {
    verificarOrigem(request);
    await logout(request.cookies.get(COOKIE_SESSAO)?.value);
    const resposta = new NextResponse(null, { status: 204 });
    resposta.cookies.set(COOKIE_SESSAO, "", { ...opcoesCookieSessao, maxAge: 0 });
    return resposta;
  });
}
