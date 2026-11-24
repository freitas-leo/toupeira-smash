import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { MenuDaSessao } from "./menu-usuario";
import { Ceu, Flores, Marca } from "./jardim";

export function PaginaJardim({ children, inicio = false }: { children: ReactNode; inicio?: boolean }) {
  return (
    <main className="shell">
      <header className="top">
        <Marca />
        <div className="flex flex-wrap items-center gap-2">
          {!inicio && <Link href="/" className="mole-outline font-extrabold">Início</Link>}
          <Suspense fallback={null}><MenuDaSessao /></Suspense>
        </div>
      </header>
      <div className="game flex flex-col">
        <Ceu />
        <div className="relative mx-auto flex w-full flex-1 items-center justify-center px-3 py-8 sm:px-8">
          {children}
        </div>
        <Flores />
      </div>
    </main>
  );
}
