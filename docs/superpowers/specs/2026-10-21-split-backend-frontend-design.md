# Spec — Separação do portfólio em `back-end/` e `front-end/`

**Data:** 2026-10-21
**Status:** aprovado para implementação
**Escopo:** reorganização de pastas, sem alteração de comportamento

---

## 1. Objetivo

Separar o repositório `PORTFOLIO; JOSE.JS` em duas pastas de primeira classe — `back-end/` e
`front-end/` — deixando o projeto **funcional**: mesma URL pública no Render, mesmo fluxo de
login/cadastro, mesmas atividades, mesmo visual.

O problema que resolve: hoje tudo vive achatado na raiz do repositório (HTML, CSS, JS, imagens,
SQL, servidor). Não há fronteira entre o que roda no servidor e o que roda no navegador, e o
`server.js` serve a raiz inteira do repo como site estático.

## 2. Decisões (tomadas com o usuário)

| # | Decisão | Escolha |
|---|---------|---------|
| D1 | Como o front-end fala com o back-end | **Só reorganizar pastas.** O front-end continua falando direto com o Supabase pelo navegador. Nenhum fluxo de dados muda. |
| D2 | Organização interna do `front-end/` | **`.html` na raiz + `css/` + `js/` + `assets/`** |
| D3 | Local do `package.json` | **Raiz do repositório** (com `main`/`start` apontando para `back-end/server.js`) |

Decisões derivadas (sem pergunta, por serem consequência direta de D1–D3):

- **D4** — O Express continua servendo o front-end. O Render hospeda só o serviço Node; sem isso
  a URL pública quebraria. O deploy continua sendo de URL única.
- **D5** — Os arquivos `.sql` vão para `back-end/database/`. São artefatos de schema, executados
  por uma pessoa (dashboard do Supabase / cliente MySQL), não pelo front-end.
- **D6** — Os `.html` ficam na raiz do `front-end/` (não em `pages/`) para que os links entre
  páginas (`./ling.html`, `./c.nut.html`, …) e o `location.href = "indexx.html"` do `scri.js`
  continuem funcionando sem ajuste.

## 3. Estado atual (referência)

Raiz do repositório:

```
.gitignore  .nojekyll  .vscode/
package.json  package-lock.json  render.yaml
server.js
index.html  indexx.html  ling.html  c.hum.html  c.nut.html  mate.html  senai.html
anex.html  responsivo.html
sty.css  style.css  estilo.css
scri.js  script.js  atividades.js  supabase-config.js
login2.sql  supabase.sql
img/  img.index/  ling/  hum/  mate/  nut/
```

`back-end/` e `front-end/` **já existem e estão vazias**.

### Mapa de responsabilidades atual

| Peça | Onde roda | Responsabilidade |
|------|-----------|------------------|
| `server.js` | servidor | Express: pool MySQL, `/api/login`, `/api/cadastro`, `/api/status`, auto-cria tabela `usuarios`, serve estático |
| `scri.js` | navegador | login/cadastro — **direto no Supabase**, com fallback para `localStorage` + migração |
| `atividades.js` | navegador | atividades por página — **direto no Supabase** (tabela + Storage), com fallback `localStorage` |
| `script.js` | navegador | interações do portfólio (terminal, cortina, assistente, nav, modo Plan/Build) |
| `supabase-config.js` | navegador | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_BUCKET`, `EMAIL_ADMIN` |

**Observação de escopo:** a API MySQL do Express **não é consumida por ninguém** hoje — o front-end
usa o Supabase diretamente. Ela continua existindo, agora dentro de `back-end/`, sem uso, exatamente
como está. Ligar o front-end à API do Express é um trabalho futuro, fora deste spec.

### Referências entre arquivos (o que precisa continuar valendo)

- **Entre páginas:** `indexx.html` → `./ling.html`, `./c.hum.html`, `./c.nut.html`, `./mate.html`,
  `./senai.html`, `./anex.html`; `scri.js` → `indexx.html`.
- **CSS → assets:** nenhum. Os três CSS só fazem `@import` de fontes externas
  (`fonts.googleapis.com`, `fonts.cdnfonts.com`). Nenhum `url()` local.
- **HTML → assets:** `./img.index/…`, `./img/…`, `./ling/…`, `./hum/…`, `./mate/…`, `./nut/…`.
- **HTML → CSS/JS:** `./sty.css`, `./style.css`, `./estilo.css`, `./scri.js`, `./script.js`,
  `./atividades.js?v=3`, `./supabase-config.js?v=3`.
- **`<script>` externo:** `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2` (não é local).
- **Live Server:** `.vscode/settings.json` fixa a porta 5501; a raiz servida passa a ser
  `front-end/`.

## 4. Estrutura alvo

```
PORTFOLIO; JOSE.JS/
├── back-end/
│   ├── server.js
│   └── database/
│       ├── login2.sql
│       └── supabase.sql
│
├── front-end/
│   ├── index.html
│   ├── indexx.html
│   ├── ling.html
│   ├── c.hum.html
│   ├── c.nut.html
│   ├── mate.html
│   ├── senai.html
│   ├── anex.html
│   ├── responsivo.html
│   ├── css/
│   │   ├── sty.css
│   │   ├── style.css
│   │   └── estilo.css
│   ├── js/
│   │   ├── scri.js
│   │   ├── script.js
│   │   ├── atividades.js
│   │   └── supabase-config.js
│   └── assets/
│       ├── img/
│       ├── img.index/
│       ├── ling/
│       ├── hum/
│       ├── mate/
│       └── nut/
│
├── package.json
├── package-lock.json
├── render.yaml
├── README.md
├── .gitignore
├── .nojekyll
└── .vscode/settings.json
```

## 5. Especificação das mudanças

### 5.1 `back-end/server.js`

Uma única constante nova no topo, e três usos dela:

```js
const FRONT_END = path.join(__dirname, '..', 'front-end');
```

| Local | Antes | Depois |
|-------|-------|--------|
| `app.get('/')` | `path.join(__dirname, 'index.html')` | `path.join(FRONT_END, 'index.html')` |
| `app.use(express.static(...))` | `path.join(__dirname)` | `FRONT_END` |
| `BLOQUEADOS` | `['/node_modules', '/server.js', '/package.json', '/package-lock.json', '/login2.sql', '/.git', '/.env']` | manter a lista (comentário atualizado: agora é redundante, pois a raiz estática é `front-end/`, mas continua como rede de segurança) |

**Inalterado:** pool MySQL (`mysql2.createPool`), `CRIA_TABELA`, verificação de conexão,
`/api/login`, `/api/cadastro`, `/api/status`, `PORT`/listen.

O caminho é resolvido a partir de `__dirname`, e não de `process.cwd()`, para que o servidor
funcione independente do diretório de onde foi iniciado.

### 5.2 Referências nos HTML

Todos os caminhos de `href`/`src` locais passam a incluir `css/`, `js/` ou `assets/`.
O query string de cache (`?v=3`) é preservado.

| Arquivo | Mudanças |
|---------|----------|
| `index.html` | `./sty.css` → `./css/sty.css`; `./supabase-config.js?v=3` → `./js/supabase-config.js?v=3`; `./scri.js?v=3` → `./js/scri.js?v=3` |
| `indexx.html` | `./style.css` → `./css/style.css`; `./script.js` → `./js/script.js`; `./img.index/image.png` → `./assets/img.index/image.png`; `./img.index/Captura_de_tela_2026-03-31_132304-removebg-preview.png` → `./assets/img.index/…`; `./img.index/gogo.jpg` → `./assets/img.index/gogo.jpg` (favicon) |
| `ling.html` | `./estilo.css` → `./css/estilo.css`; `./img/…` → `./assets/img/…`; `./ling/…` → `./assets/ling/…`; `./supabase-config.js?v=3` → `./js/supabase-config.js?v=3`; `./atividades.js?v=3` → `./js/atividades.js?v=3` |
| `c.hum.html` | idem, com `./hum/…` → `./assets/hum/…` |
| `c.nut.html` | idem, com `./nut/…` → `./assets/nut/…` |
| `mate.html` | idem, com `./mate/…` → `./assets/mate/…` |
| `senai.html` | idem, com `./img/…` → `./assets/img/…` |
| `anex.html` | ver 5.3 |
| `responsivo.html` | sem referências locais a ajustar (arquivo praticamente vazio) |

Nenhum outro atributo, texto ou estrutura de HTML é tocado.

### 5.3 `anex.html` — correção de bug pré-existente

Hoje `anex.html` referencia `./anexos.css`, **arquivo que não existe no repositório** — a página é
servida sem nenhum estilo. Como parte do movimento:

- `href="./anexos.css"` → `href="./css/style.css"` (é `style.css` que contém `.navbar` e
  `.nav-links`, usados por essa página).
- A classe `.na` do `<h4>` (título "JOSE: Js Developer") não existe em nenhum CSS do projeto —
  em `indexx.html` o equivalente é `.nome`. Em `front-end/css/style.css`:
  1. criar a regra `.navbar .na` copiando a regra `.navbar .nome` que já existe na linha 198
     (fonte, `font-size: 18px`, peso, cor, `text-decoration: none`);
  2. incluir `.navbar .na` no seletor agrupado da linha 1292 (tipografia `SquareDance00`),
     para o título renderizar igual ao da página principal.

### 5.4 `package.json` (raiz)

```json
{
  "name": "portfolio-jose",
  "version": "1.0.0",
  "description": "Portfólio do José com servidor Express + MySQL",
  "main": "back-end/server.js",
  "scripts": {
    "start": "node back-end/server.js",
    "dev": "nodemon back-end/server.js"
  },
  "dependencies": { /* inalteradas: body-parser, cors, express, mysql2 */ },
  "devDependencies": { /* inalterada: nodemon */ }
}
```

Dependências e versões inalteradas. `package-lock.json` permanece na raiz, sem alteração.

### 5.5 `render.yaml`

```yaml
buildCommand: npm install
startCommand: node back-end/server.js
healthCheckPath: /
```

`buildCommand` e `healthCheckPath` inalterados — `npm install` roda na raiz, onde está o
`package.json`; `healthCheckPath: /` continua respondendo com a página de login.
As variáveis `DB_*` permanecem exatamente como estão.

### 5.6 `README.md` (novo)

Documenta: a estrutura de pastas, o que é back-end e o que é front-end, como rodar localmente
(`npm install` na raiz, `npm start` → `http://localhost:3000`; Live Server em `front-end/` na
porta 5501), como configurar o MySQL (variáveis `DB_*`) e onde ficam os schemas SQL.

## 6. O que NÃO muda

- Fluxo de login e cadastro (Supabase direto do navegador, fallback `localStorage` e migração).
- Fluxo de atividades (Supabase + Storage, fallback `localStorage` e migração).
- Regras de permissão (`EMAIL_ADMIN`).
- Conteúdo e texto de todas as páginas.
- Conteúdo e ordem de todas as regras CSS.
- Conteúdo dos 4 arquivos JS.
- Os 61 arquivos de imagem (movidos, não alterados).
- URL pública no Render, plano free, health check.
- `package-lock.json` e as versões das dependências.

## 7. Verificação

### 7.1 Verificação estática

- Nenhum HTML referencia `sty.css`, `style.css`, `estilo.css`, `scri.js`, `script.js`,
  `atividades.js` ou `supabase-config.js` por caminho antigo.
- Nenhum HTML referencia `./img/`, `./img.index/`, `./ling/`, `./hum/`, `./mate/`, `./nut/`.
- Todo arquivo referenciado existe no novo caminho.
- `git status` mostra renomeações detectáveis, não exclusões+criações.

### 7.2 Verificação do servidor

Com `npm start` rodando na raiz:

| Requisição | Esperado |
|------------|----------|
| `GET /` | 200, HTML do login |
| `GET /indexx.html` | 200 |
| `GET /ling.html`, `/c.hum.html`, `/c.nut.html`, `/mate.html`, `/senai.html`, `/anex.html` | 200 |
| `GET /css/sty.css`, `/css/style.css`, `/css/estilo.css` | 200 |
| `GET /js/scri.js`, `/js/script.js`, `/js/atividades.js`, `/js/supabase-config.js` | 200 |
| `GET /assets/img.index/image.png`, `/assets/img/…` | 200 |
| `GET /api/status` | 200, JSON |
| `GET /back-end/server.js` | 404 (não servido) |

### 7.3 Verificação no navegador (Playwright)

1. Abrir `http://localhost:3000/` → tela de login renderiza com estilo (fonte monoespaçada
   carregada, botão "Conectar" visível).
2. Abrir `http://localhost:3000/indexx.html` → cortina/terminal animam; **aba Network sem 404**.
3. Clicar nos 6 botões de disciplina → cada página abre com as figuras e o CSS `estilo.css`
   aplicados; **Network sem 404** em cada uma.
4. Console do navegador **sem erros** em cada página.
5. `anex.html` abre com a navbar estilizada.

## 8. Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Link quebrado entre páginas | HTMLs na mesma raiz do `front-end/` → caminhos relativos intactos (seção 3) |
| Imagem 404 por caminho | Varredura estática de todo `src`/`href` local (7.1) |
| `express.static` servindo a pasta errada | Caminho por `__dirname`, e verificação 7.2 |
| Deploy quebrado no Render | `render.yaml` atualizado e `package.json` na raiz (5.4, 5.5) |
| Diff confuso no git | Usar `git mv` para preservar histórico dos arquivos |
| Loss de项工作 ao mover | Nenhum arquivo é editado, apenas movido; CSS/JS/imagens byte-idênticos |

## 9. Fora de escopo

- Ligar o front-end à API MySQL do Express (hoje sem uso — ver seção 2).
- Hash de senha (hoje a senha é comparada em texto puro, tanto no MySQL quanto no Supabase).
- Token/sessão de login (hoje o "login" do front-end é só `localStorage`).
- Trocar o Supabase por outra coisa.
- Deploy do front-end em hospedagem separada (GitHub Pages etc.) — hoje é URL única via Express.
- Remover `responsivo.html` (vazio) ou a API MySQL não usada.
