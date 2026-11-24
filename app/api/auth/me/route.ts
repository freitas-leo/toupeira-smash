import type { NextRequest } from "next/server";
import { responder } from "@/lib/http";
import { COOKIE_SESSAO } from "@/lib/sessao";
import { usuarioAutenticado } from "@/services/auth";

export function GET(request: NextRequest) {
  return responder(async () => {
    const usuario = await usuarioAutenticado(request.cookies.get(COOKIE_SESSAO)?.value);
    return Response.json({ usuario }, { headers: { "Cache-Control": "no-store" } });
  });
}
