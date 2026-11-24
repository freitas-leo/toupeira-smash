import { lerJson, responder } from "@/lib/http";
import { cadastrar } from "@/services/auth";

export function POST(request: Request) {
  return responder(async () => {
    const usuario = await cadastrar(await lerJson(request));
    return Response.json({ usuario }, { status: 201 });
  });
}
