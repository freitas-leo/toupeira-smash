import Link from "next/link";
import { Suspense } from "react";
import { Toupeira } from "@/app/_components/jardim";
import { LoginParaVisitante } from "@/app/_components/menu-usuario";
import { PaginaJardim } from "@/app/_components/pagina-jardim";

export default function Home() {
  return (
    <PaginaJardim inicio>
      <div className="jardim-card max-w-xl text-center">
        <div className="board home-board" aria-hidden="true">
          {Array.from({ length: 9 }, (_, posicao) => (
            <div key={posicao} className="hole" data-ativa={posicao === 4}>
              <Toupeira ativa={posicao === 4} />
            </div>
          ))}
        </div>
        <nav aria-label="Menu principal" className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/jogo" prefetch={false} className="button-primary">▶ Jogar</Link>
          <Suspense fallback={null}><LoginParaVisitante /></Suspense>
          <Link href="/placar" className="button-secondary">Placar de líderes</Link>
        </nav>
      </div>
    </PaginaJardim>
  );
}
