# Traxii — Frontends (monorepo)

Dois aplicativos React + TypeScript servidos pela mesma API Laravel
(`backend/`, repo separado):

| App | Pasta | O que é | Deploy |
| --- | --- | --- | --- |
| **Gestor** | `apps/gestor` | Percapital (proprietária): Gerenciador de Whitelabel, backoffice de onboarding, usuários/permissões | Hosting da Percapital |
| **Whitelabel** | `apps/whitelabel` | Dist **genérica** por cliente (Traxi, Nexustech...): onboarding + netbank | FTP no servidor do cliente |

`packages/shared` concentra tipos, client HTTP, utilidades e componentes comuns.

## Comandos

```bash
npm install               # na raiz (workspaces)
npm run dev:gestor        # gestor em localhost:5173
npm run dev:whitelabel    # whitelabel em localhost:5173
npm run build             # builda os dois
```

## Conceito-chave: uma dist para todos os whitelabels

A build do `apps/whitelabel` **não contém nada específico de um cliente**:

1. **Tema por domínio**: ao carregar, o app chama
   `GET /api/public/theme?domain=<hostname>` e aplica cores/logo/nome da
   empresa cadastrada no Gestor para aquele domínio.
2. **API por runtime**: a URL da API fica em `dist/config.js`
   (`window.__APP_CONFIG__`), editável por FTP sem rebuild.
3. **SPA em Apache**: a dist inclui `.htaccess` com fallback para
   `index.html` (React Router).

Instalar um novo whitelabel = cadastrar a empresa e o domínio no Gestor +
subir a mesma dist no servidor do cliente.

## Estado da integração

- **Real (API)**: login do Gestor (`/login`, seed `admin@traxiinvest.com`),
  CRUD de empresas com upload de logo, tema público por domínio.
- **Mockado**: login do correntista e todo o netbank (`/app`) no whitelabel.
  Cada service tem o endpoint REST sugerido em comentário.

Roadmap completo em `../ROADMAP.md`.
