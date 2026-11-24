export class ErroApi extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export async function responder(acao: () => Promise<Response>) {
  try {
    return await acao();
  } catch (erro) {
    if (erro instanceof ErroApi) {
      return Response.json({ erro: erro.message }, { status: erro.status });
    }

    console.error(erro);
    return Response.json({ erro: "Erro interno do servidor." }, { status: 500 });
  }
}

export function verificarOrigem(request: Request) {
  const origem = request.headers.get("origin");
  const host = request.headers.get("host") ?? new URL(request.url).host;
  if (
    request.headers.get("sec-fetch-site") === "cross-site" ||
    (origem && URL.parse(origem)?.host !== host)
  ) {
    throw new ErroApi(403, "Origem inválida.");
  }
}

export async function lerJson(request: Request): Promise<Record<string, unknown>> {
  verificarOrigem(request);
  const tipo = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (tipo !== "application/json") {
    throw new ErroApi(415, "Envie o corpo como application/json.");
  }

  const dados: unknown = await request.json().catch(() => null);
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    throw new ErroApi(400, "Envie um objeto JSON válido.");
  }
  return dados as Record<string, unknown>;
}
