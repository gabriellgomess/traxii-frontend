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

## Conexão com a API Laravel

A URL da API fica em `.env` (`VITE_API_URL`). O client HTTP é `src/services/http.ts`
(Bearer token do Sanctum, salvo em `localStorage`).

**Já conectado (Fase 1):**

- Auth do gerenciador: `/admin/login` (e-mail + senha) → `POST /api/auth/login`,
  sessão restaurada via `GET /api/auth/me`, guard `RequireAdmin` no `/admin`.
- Gerenciador Whitelabel: CRUD de empresas via `/api/companies` (somente
  super admin), upload de logo em multipart, tema público da landing via
  `GET /api/public/theme?domain=`.
- Credencial seed: `admin@traxiinvest.com` / `password` (trocar em produção).

**Ainda mockado:** login do correntista (`/login`, qualquer CPF/senha) e todo o
banking `/app` (saldo, Pix, TED, extrato). Cada função em `src/services/*` tem no
comentário o endpoint REST sugerido para as próximas fases.
