import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/app/_components/auth-form";
import { PaginaJardim } from "@/app/_components/pagina-jardim";

export const metadata: Metadata = { title: "Login" };

async function ConfirmacaoCadastro({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  if ((await searchParams).cadastro !== "ok") return null;
  return <p role="status" className="mt-4 rounded-xl bg-leaf p-3 text-sm">Conta criada. Entre com seu e-mail e senha.</p>;
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <PaginaJardim>
      <section className="jardim-card max-w-md">
        <h2 className="text-3xl font-black tracking-tight">Entrar</h2>
        <Suspense fallback={null}>
          <ConfirmacaoCadastro searchParams={searchParams} />
        </Suspense>
        <AuthForm modo="login" />
      </section>
    </PaginaJardim>
  );
}
