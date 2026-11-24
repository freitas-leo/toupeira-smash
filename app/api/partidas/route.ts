import { connection, type NextRequest } from "next/server";
import { lerJson, responder } from "@/lib/http";
import { COOKIE_SESSAO } from "@/lib/sessao";
import { usuarioAutenticado } from "@/services/auth";
import { listarPartidas, registrarPartida } from "@/services/jogo";

export async function GET(request: NextRequest) {
  await connection();
  return responder(async () => {
    const usuario = await usuarioAutenticado(request.cookies.get(COOKIE_SESSAO)?.value);
    const partidas = await listarPartidas(usuario.id);
    return Response.json({ partidas }, { headers: { "Cache-Control": "no-store" } });
  });
}

export function POST(request: NextRequest) {
  return responder(async () => {
    const usuario = await usuarioAutenticado(request.cookies.get(COOKIE_SESSAO)?.value);
    const { partida, criada } = await registrarPartida(usuario.id, await lerJson(request));
    return Response.json({ partida }, { status: criada ? 201 : 200 });
  });
}
