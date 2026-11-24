import type { Metadata } from "next";
import { AuthForm } from "@/app/_components/auth-form";
import { PaginaJardim } from "@/app/_components/pagina-jardim";

export const metadata: Metadata = { title: "Cadastro" };

export default function CadastroPage() {
  return (
    <PaginaJardim>
      <section className="jardim-card max-w-md">
        <h2 className="text-3xl font-black tracking-tight">Criar conta</h2>
        <AuthForm modo="cadastro" />
      </section>
    </PaginaJardim>
  );
}
