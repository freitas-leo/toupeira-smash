import { responder } from "@/lib/http";
import { listarNiveis } from "@/services/jogo";

export function GET() {
  return responder(async () => Response.json({ niveis: await listarNiveis() }));
}
