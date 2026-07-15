# Internet Banking Whitelabel — Frontend

Frontend em React + TypeScript do internet banking whitelabel (protótipo original criado no Claude Design). Por enquanto todos os dados são **mockados**; a camada de services já espelha a futura API Laravel.

## Rodando

```bash
cd frontend
npm install
npm run dev
```

Acesse http://localhost:5173.

- **Login**: qualquer CPF e senha preenchidos entram (mock).
- **Admin (Gerenciador Whitelabel)**: acesse `/admin` ou pelo link "admin" no rodapé da landing. Marcas ficam persistidas no `localStorage`.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS v4 (tema whitelabel via CSS variables `--p`, `--s`, `--psoft`)
- React Router v6

## Estrutura

```
src/
  types/        Tipos de domínio (espelham os recursos da API Laravel)
  mocks/        Dados mockados (marcas, usuário, extrato, FAQs...)
  services/     Camada de serviço — hoje mock, depois axios/fetch para o Laravel
  contexts/     BrandContext (tema whitelabel) e AuthContext (sessão)
  components/   Icon, BrandLogo, TransactionRow
  layouts/      AppLayout (sidebar + header do banking)
  pages/        Landing, Login, admin/Admin, app/{Home,Pix,Ted,Extrato,Dados,Ajuda}
```

## Rotas

| Rota           | Tela                                        |
| -------------- | ------------------------------------------- |
| `/`            | Landing (site institucional da marca ativa) |
| `/login`       | Login (CPF + senha)                         |
| `/app`         | Home do internet banking (protegida)        |
| `/app/pix`     | Pix — wizard em 4 passos                    |
| `/app/ted`     | TED — formulário, confirmação, comprovante  |
| `/app/extrato` | Extrato com filtros                         |
| `/app/dados`   | Dados pessoais                              |
| `/app/ajuda`   | FAQ + chat                                  |
| `/admin`       | Gerenciador de Whitelabel (CRUD de marcas)  |

## Conectando ao Laravel (próxima etapa)

Cada função em `src/services/*` tem no comentário o endpoint REST sugerido
(ex.: `POST /api/pix/transfers`). Para conectar:

1. Configurar axios em `src/services/api.ts` (baseURL, interceptor de token).
2. Substituir o corpo de cada service por chamadas HTTP — as assinaturas e os
   tipos de `src/types` não mudam, então páginas e contexts ficam intactos.
3. Trocar a persistência de marcas do `localStorage` pelos endpoints `/api/brands`.
