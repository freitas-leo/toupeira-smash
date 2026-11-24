import { connection, type NextRequest } from "next/server";
import { lerJson, responder } from "@/lib/http";
import { COOKIE_SESSAO } from "@/lib/sessao";
import { atualizarPerfil, usuarioAutenticado } from "@/services/auth";

export async function GET(request: NextRequest) {
  await connection();
  return responder(async () => {
    const usuario = await usuarioAutenticado(request.cookies.get(COOKIE_SESSAO)?.value);
    return Response.json({ usuario }, { headers: { "Cache-Control": "no-store" } });
  });
}

export function PATCH(request: NextRequest) {
  return responder(async () => {
    const usuario = await usuarioAutenticado(request.cookies.get(COOKIE_SESSAO)?.value);
    const atualizado = await atualizarPerfil(usuario, await lerJson(request));
    return Response.json({ usuario: atualizado }, { headers: { "Cache-Control": "no-store" } });
  });
}
