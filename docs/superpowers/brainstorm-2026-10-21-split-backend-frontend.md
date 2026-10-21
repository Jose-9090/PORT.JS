# Checklist — Separação Back-end / Front-end (2026-10-21)

Caminho escolhido: **Arquitetural** (reorganiza como as partes se encaixam + muda deploy e a
fronteira back↔front).

## Estado da exploração (feito)
- [x] Estrutura atual mapeada (raiz flat: HTML/CSS/JS + pastas de imagens)
- [x] `server.js` lido (Express + MySQL, `/api/login`, `/api/cadastro`, `/api/status`, static na raiz)
- [x] Páginas lidas: `index.html` (login), `indexx.html` (principal), `ling/c.hum/c.nut/mate/senai.html`
- [x] JS lidos: `scri.js`, `script.js`, `atividades.js`, `supabase-config.js`
- [x] SQL lidos: `login2.sql` (MySQL), `supabase.sql` (Postgres/Supabase)
- [x] `render.yaml` e `package.json` lidos
- [x] Bug pré-existente encontrado: `anex.html` aponta para `./anexos.css` (arquivo não existe)

## Perguntas (uma por vez)
- [ ] Q1 — O front-end deve passar a consumir a API Express, ou continua falando direto com o Supabase?
- [ ] Q2 — Profundidade da divisão dentro de `front-end/` (css/js/assets em subpastas?)
- [ ] Q3 — Deploy no Render: continuar servindo o front-end pelo Express (URL única)?
- [ ] Q4 — `package.json` na raiz (monorepo) ou dentro de `back-end/`?

## Abordagens
- [ ] Propor 2-3 abordagens com trade-offs
- [ ] Apresentar design por seções

## Artefatos
- [ ] Spec em `docs/superpowers/specs/2026-10-21-split-backend-frontend-design.md`
- [ ] Self-review do spec
- [ ] Revisão do spec pelo usuário
- [ ] `writing-plans` → plano de implementação
