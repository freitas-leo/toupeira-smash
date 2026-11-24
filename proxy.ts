import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO, FORMATO_TOKEN } from "@/lib/sessao";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_SESSAO)?.value;
  if (token && FORMATO_TOKEN.test(token)) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ erro: "Sessão inválida." }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/jogo/:path*", "/api/partidas/:path*", "/api/auth/me"],
};
