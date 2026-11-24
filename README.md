This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Banco de dados local

O projeto usa Prisma 7 com MariaDB. Inicie o serviço **MySQL** no painel do XAMPP. No phpMyAdmin, crie o banco `toupeira_smash` com a collation `utf8mb4_unicode_ci`. Depois, no PowerShell, rode os comandos abaixo na raiz do projeto.

```powershell
npm.cmd ci
Copy-Item .env.example .env # Execute apenas se o arquivo .env ainda não existir
npx.cmd prisma migrate deploy
npx.cmd prisma generate
```

O exemplo de conexão usa `root` sem senha em `127.0.0.1:3306`, no banco `toupeira_smash`. Ajuste o `.env` se a configuração do XAMPP for diferente. Codifique caracteres reservados da senha na URL (por exemplo, `@` vira `%40`).

O SQL do Workbench forneceu o modelo inicial. Para uma instalação nova, use as migrações do Prisma, que criam as tabelas com as restrições atuais. Uma eventual transferência de dados de `mydb` exige uma migração de dados específica.

## API REST

Execute `npm.cmd run dev` depois de aplicar as migrações e gerar o Prisma Client. A API recebe JSON e retorna falhas no formato `{ "erro": "mensagem" }`.

| Método e rota | Corpo da requisição | Resultado |
| --- | --- | --- |
| `POST /api/auth/cadastro` | `nome`, `email`, `senha` | Cria a conta e retorna `{ usuario }` |
| `POST /api/auth/login` | `email`, `senha` | Define o cookie de sessão e retorna `{ usuario }` |
| `GET /api/auth/me` | — | Retorna `{ usuario }` da sessão |
| `POST /api/auth/logout` | — | Revoga a sessão e retorna `204` |
| `GET /api/niveis` | — | Retorna `{ niveis }` com os tempos de exposição em milissegundos |
| `GET /api/placar` | — | Retorna `{ lideres }` com até 50 jogadores, ordenados por pontuação e combo |
| `GET /api/partidas` | — | Retorna `{ partidas }` com até 50 resultados recentes do jogador autenticado |
| `POST /api/partidas` | Campos abaixo | Retorna `{ partida }` e atualiza o placar na mesma transação |

Para registrar uma partida, gere `envioId` com `crypto.randomUUID()` e envie `nivelId`, `totalAparicoes`, `totalAcertos`, `totalErros`, `maiorCombo` e `duracaoSegundos` (30 no modo atual). Use o mesmo UUID ao reenviar a mesma partida. As contagens vêm do jogo no navegador e o servidor calcula `max(0, 10 × acertos − 5 × erros)`, com bônus desativado.

O cookie de sessão dura sete dias. O proxy redireciona de `/jogo` para `/login` quando o cookie está ausente ou tem formato inválido. Na adaptação do frontend, a página protegida pode usar `usuarioAutenticado` de `services/auth.ts` no servidor para validar a sessão, como as rotas privadas da API já fazem.
