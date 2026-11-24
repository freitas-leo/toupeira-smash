import type { Metadata } from "next";
import "./globals.css";
import "./prototipo.css";

export const metadata: Metadata = {
  title: { default: "Toupeira Smash", template: "%s | Toupeira Smash" },
  description: "Um jogo de reflexos e matemática em um jardim de nove posições.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>
        <div aria-hidden="true" className="ambient a" />
        <div aria-hidden="true" className="ambient b" />
        {children}
      </body>
    </html>
  );
}
