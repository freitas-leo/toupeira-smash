import { responder } from "@/lib/http";
import { listarLideres } from "@/services/jogo";

export function GET() {
  return responder(async () => Response.json({ lideres: await listarLideres() }));
}
