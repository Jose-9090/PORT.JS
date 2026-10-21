# Separação Back-end / Front-end — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganizar o repositório `PORTFOLIO; JOSE.JS` em `back-end/` e `front-end/` sem alterar
nenhum comportamento observável.

**Architecture:** O front-end (páginas, CSS, JS, imagens) vai para `front-end/` com subpastas
`css/`, `js/` e `assets/`; os `.html` ficam na raiz de `front-end/` para preservar os links entre
páginas. O back-end (Express + MySQL) vai para `back-end/`, com os schemas SQL em
`back-end/database/`. O `package.json` permanece na raiz e passa a apontar para
`back-end/server.js`. O Express continua servindo o front-end — o deploy no Render segue com URL
única.

**Tech Stack:** Node.js 24 (CommonJS), Express 5, mysql2, Supabase JS (CDN), HTML/CSS/JS vanilla.

**Spec:** `docs/superpowers/specs/2026-10-21-split-backend-frontend-design.md`

---

## Global Constraints

- **Nenhum comportamento muda.** Login/cadastro e atividades continuam indo **direto do navegador
  para o Supabase**. Não crie nenhuma chamada HTTP do front-end para o Express — a API MySQL
  continua sem uso, exatamente como está.
- **Nenhum `.html` sai da raiz de `front-end/`.** Os links `./ling.html`, `./c.nut.html`, …
  e o `window.location.href = "indexx.html"` do `scri.js` dependem disso.
- **Nenhum CSS, JS ou imagem é alterado — só movido.** O conteúdo dos 61 arquivos de imagem e dos
  3 CSS e 4 JS é byte-idêntico antes e depois.
- **O caminho do front-end é resolvido a partir de `__dirname`**, nunca de `process.cwd()`, para o
  servidor funcionar independente do diretório de onde foi iniciado.
- **`package.json` e `package-lock.json` permanecem na raiz do repositório.** As dependências e
  suas versões não mudam.
- **Zero dependência nova.** O projeto não tem framework de teste; a verificação é feita com Node
  puro (`node:fs`, `node:path`) e `curl.exe`.
- **Mensagens de commit em português**, no estilo do histórico existente
  (`refactor:`, `fix:`, `docs:`, `chore:`).
- **Referência local quebrada é erro, não warning.** O verificador sai com código 1.

## Review Focus

1. **Query string de cache (`?v=3`)** — `./atividades.js?v=3`, `./supabase-config.js?v=3`,
   `./scri.js?v=3`. O verificador tem que resolver o caminho **sem** a query, senão acusa
   `js/atividades.js?v=3` como inexistente. *Teste:* `verificar-caminhos.js` sai com código 0 no
   layout final.
2. **Link entre páginas em `onclick="window.location.href='./ling.html'"`** — não é `href` nem
   `src`. Um verificador que só varre `href`/`src` deixaria passar um link quebrado. *Teste:* o
   verificador varre `location.href` e reporta o arquivo que o referencia.
3. **Nomes de arquivo com acento e espaço** — `img/caça~palavra.png`,
   `img/Captura de tela 2026-04-06 165842.png`. A reescrita de caminhos tem que ser
   **substituição de prefixo**, nunca reabrir e salvar o arquivo à mão, senão o acento se perde e
   a imagem dá 404. *Teste:* o verificador confirma que os 61 arquivos de imagem continuam
   referenciados e resolvendo.
4. **`anex.html` aponta para `./anexos.css`, que não existe no repositório** — referência
   quebrada pré-existente. O verificador tem que **acusar** (falha), não silenciar. *Teste:* rodar
   o verificador antes da Task 4 acusa `anex.html`.
5. **`responsivo.html` é órfão** — nenhuma página linka para ele, e ele não linka para lugar
   nenhum. O verificador **não** pode falhar por falta de referência de entrada; órfão é warning.
   *Teste:* rodar o verificador no layout final sai com código 0 e reporta `responsivo.html` como
   órfão.

---

## Mapa de arquivos

**Criados:**
- `scripts/verificar-caminhos.js` — verificador de referências locais (sem dependências)
- `README.md` — documenta a estrutura nova

**Movidos:**
- `server.js` → `back-end/server.js`
- `login2.sql` → `back-end/database/login2.sql`
- `supabase.sql` → `back-end/database/supabase.sql`
- 9 `.html` → `front-end/`
- `sty.css`, `style.css`, `estilo.css` → `front-end/css/`
- `scri.js`, `script.js`, `atividades.js`, `supabase-config.js` → `front-end/js/`
- `img/`, `img.index/`, `ling/`, `hum/`, `mate/`, `nut/` → `front-end/assets/`

**Modificados:**
- `server.js` (→ `back-end/server.js`): raiz estática e rota `/`
- 9 `.html` em `front-end/`: apenas caminhos de `href`/`src`
- `front-end/css/style.css`: regras `.navbar .na`
- `front-end/anex.html`: `href` do CSS
- `package.json`: `main`, `scripts.start`, `scripts.dev`, `scripts.verificar`
- `render.yaml`: `startCommand`

**Referência de caminhos — tabela completa de substituição.** Substituir **prefixos**,
nomes de arquivo intactos. Aplicar em todos os `.html` de `front-end/`:

| Antes | Depois | Ocorrências |
|-------|--------|-------------|
| `href="./sty.css"` | `href="./css/sty.css"` | 1 (index.html) |
| `href="./style.css"` | `href="./css/style.css"` | 1 (indexx.html) |
| `href="./estilo.css"` | `href="./css/estilo.css"` | 4 (ling, c.nut, mate, senai) |
| `href="estilo.css"` | `href="./css/estilo.css"` | 1 (c.hum — sem `./`) |
| `src="./scri.js` | `src="./js/scri.js` | 1 (index.html) |
| `src="./script.js` | `src="./js/script.js` | 1 (indexx.html) |
| `src="./atividades.js` | `src="./js/atividades.js` | 5 |
| `src="./supabase-config.js` | `src="./js/supabase-config.js` | 6 |
| `src="./img/` | `src="./assets/img/` | 29 |
| `src="./img.index/` | `src="./assets/img.index/` | 2 |
| `href="./img.index/` | `href="./assets/img.index/` | 1 (favicon) |
| `src="./ling/` | `src="./assets/ling/` | 5 |
| `src="./hum/` | `src="./assets/hum/` | 4 |
| `src="./mate/` | `src="./assets/mate/` | 2 |
| `src="./nut/` | `src="./assets/nut/` | 4 |

**Sem alteração** (permanecem válidos): `./anex.html`, `./c.hum.html`, `./c.nut.html`,
`./ling.html`, `./mate.html`, `./senai.html` (links entre páginas), `indexx.html` (em `scri.js`),
e os `href="#âncora"`.

---

### Task 1: Verificador de referências locais

**Files:**
- Create: `scripts/verificar-caminhos.js`
- Modify: `package.json` (adiciona `scripts.verificar`)

**Interfaces:**
- Consumes: nada (primeira tarefa)
- Produces: `node scripts/verificar-caminhos.js` — sai com **0** se toda referência local
  resolve, **1** se alguma não resolve. Nome do script npm: `npm run verificar`.

- [ ] **Step 1: Escrever `scripts/verificar-caminhos.js`**

  Sem dependências; só `node:fs` e `node:path`. Comportamento:

  1. **Raiz alvo:** se `front-end/` existir ao lado do script, varre `front-end/`; senão varre a
     raiz do repositório. Isso permite rodar o script **antes e depois** da reorganização.
     (`path.join(__dirname, '..', 'front-end')` com fallback para `path.join(__dirname, '..')`.)
  2. **Arquivos varridos:** todo `.html` e todo `.js` abaixo da raiz alvo, recursivamente.
  3. **Padrão de extração de referência** — **um** regex combinado, para que cada ocorrência seja
     contada uma vez só:
     ```js
     /\b(?:src|href)\s*=\s*["']([^"']+)["']|location\.href\s*=\s*["']([^"']+)["']/g
     ```
     O grupo capturado é `m[1]` se definido, senão `m[2]`. Usar **dois** regex separados
     (um para `src|href`, outro para `location.href`) contaria a mesma referência duas vezes —
     `location.href = "…"` também casa com `href = "…"`.
  4. **Filtro de ignorados:** referências que casem com
     `/^(https?:|data:|\/\/|#|mailto:|tel:|javascript:)/` são puladas.
  5. **Limpeza:** remover query string e hash (`ref.split('?')[0].split('#')[0]`).
  6. **Base de resolução:**
     - arquivo `.html` → o diretório onde ele está;
     - arquivo `.js` → a **raiz alvo** (as páginas moram na raiz alvo, não em `js/`).
  7. **Resultado:** para cada referência resolvida, verificar `fs.existsSync` do caminho
     resolvido contra a base. Ausente → erro.
  8. **Órfãos:** um `.html` que nenhuma outra referência aponta é **warning**, nunca erro.
  9. **Saída:** uma linha por referência ausente, no formato
     `AUSENTE  <arquivo que referencia>  ->  <referência>`; resumo no fim com o total de
     referências verificadas; `process.exit(1)` se houver ao menos uma ausente, `process.exit(0)`
     caso contrário.
  10. **Cabeçalho do arquivo:** comentário explicando as regras 5, 6 e 8 (query string ignorada,
      base dos `.js`, órfão não falha) — são as três decisões que não são óbvias.

- [ ] **Step 2: Adicionar o script ao `package.json`**

  Em `scripts`, acrescentar `"verificar": "node scripts/verificar-caminhos.js"`.

- [ ] **Step 3: Rodar o verificador no layout atual (baseline)**

  Run: `node scripts/verificar-caminhos.js`
  Expected: sai com código **1** e acusa exatamente **uma** referência ausente —
  `anex.html  ->  ./anexos.css` (bug pré-existente, corrigido na Task 4).
  O resumo deve informar **76 ocorrências** verificadas, das quais **63 são referências
  distintas**, sendo **8** varridas pelo padrão `location.href` (os 6 links entre páginas de
  `indexx.html` + os 2 de `scri.js`). O total de 76 é o que prova que o padrão
  `location.href` está sendo varrido — sem ele, o total seria 68.

- [ ] **Step 4: Provar que o verificador detecta quebra (teste negativo)**

  Criar temporariamente `_teste-quebra.html` na raiz com
  `<img src="./arquivo-que-nao-existe.png">`.
  Run: `node scripts/verificar-caminhos.js`
  Expected: sai com código **1** e a saída contém `_teste-quebra.html  ->  ./arquivo-que-nao-existe.png`.
  Apagar `_teste-quebra.html`.

- [ ] **Step 5: Confirmar que só o bug pré-existente é reportado**

  Run: `node scripts/verificar-caminhos.js`
  Expected: sai com código **1** e reporta **apenas** `anex.html  ->  ./anexos.css`.

- [ ] **Step 6: Commit**

  ```bash
  git add scripts/verificar-caminhos.js package.json
  git commit -m "chore: adiciona verificador de referencias locais"
  ```

---

### Task 2: Mover o front-end para `front-end/` e religar o servidor

> **Passo atômico.** O site é servido como uma unidade só: enquanto os `.html` estiverem
> movidos e o `server.js` ainda apontar para a raiz, o site fica fora do ar. **Não commitar no
> meio.** Faça todos os passos abaixo e commite uma vez, no final.

**Files:**
- Move: 9 `.html` → `front-end/`
- Move: `sty.css`, `style.css`, `estilo.css` → `front-end/css/`
- Move: `scri.js`, `script.js`, `atividades.js`, `supabase-config.js` → `front-end/js/`
- Move: `img/`, `img.index/`, `ling/`, `hum/`, `mate/`, `nut/` → `front-end/assets/`
- Move: `login2.sql`, `supabase.sql` → `back-end/database/`
- Modify: `server.js` (raiz estática + rota `/`)
- Modify: os 9 `.html` movidos (caminhos de `href`/`src`)

**Interfaces:**
- Consumes: `node scripts/verificar-caminhos.js` da Task 1.
- Produces: layout `front-end/` completo; `server.js` (ainda na raiz) servindo
  `front-end/`. A Task 3 move o `server.js` para `back-end/`.

- [ ] **Step 1: Criar as pastas e mover os arquivos com `git mv`**

  ```bash
  mkdir -p front-end/css front-end/js front-end/assets back-end/database
  git mv index.html indexx.html ling.html c.hum.html c.nut.html mate.html senai.html anex.html responsivo.html front-end/
  git mv sty.css style.css estilo.css front-end/css/
  git mv scri.js script.js atividades.js supabase-config.js front-end/js/
  git mv img img.index ling hum mate nut front-end/assets/
  git mv login2.sql supabase.sql back-end/database/
  ```

  `git mv` (e não `mv`) para o histórico git registrar renomeação, não exclusão+criação.

- [ ] **Step 2: Reescrever os caminhos nos 9 HTML (substituição de prefixo, em bytes)**

  Escrever um script **descartável** fora do repositório — por exemplo em
  `C:\Users\SENAI\AppData\Local\Temp\opencode\reescrever-caminhos.js` — e rodá-lo sobre os
  arquivos de `front-end/`. Ele deve:

  - ler cada `.html` como `utf8`, aplicar as substituições da tabela do Mapa de arquivos
    (a tabela é a lista exata de pares `antes` → `depois`), e gravar de volta como `utf8`;
  - **substituir apenas prefixos** — o nome do arquivo depois da barra nunca é reescrito, para
    não corromper `caça~palavra.png` e `Captura de tela ….png`;
  - conferir que a contagem de substituições por par bate com a coluna "Ocorrências" da tabela, e
    imprimir o resultado. Total esperado: **67 substituições** (63 referências distintas, das
    quais `./anexos.css` fica de fora — ela é corrigida na Task 4).

  Run: `node C:\Users\SENAI\AppData\Local\Temp\opencode\reescrever-caminhos.js`
  Expected: imprime o total de substituições por par, batendo com a tabela.

- [ ] **Step 3: Confirmar que nenhum caminho antigo sobrou**

  Run: `grep -rn -E '\./(sty|style|estilo)\.css|\./(scri|script|atividades|supabase-config)\.js|\./(img|img\.index|ling|hum|mate|nut)/' front-end/ --include=*.html`
  Expected: **nenhuma** saída.

  Run: `node scripts/verificar-caminhos.js`
  Expected: sai com código **1**, reportando **apenas** `anex.html  ->  ./anexos.css`.

- [ ] **Step 4: Religar o `server.js` (que continua na raiz)**

  Em `server.js`:

  - adicionar, logo abaixo de `const path = require('path');`:
    ```js
    // Pasta do front-end, resolvida a partir do próprio arquivo para o servidor
    // funcionar independente de onde foi iniciado.
    const FRONT_END = path.join(__dirname, 'front-end');
    ```
  - na rota `/`: `res.sendFile(path.join(FRONT_END, 'index.html'));`
  - no static: `app.use(express.static(FRONT_END));`
  - atualizar o comentário do `BLOQUEADOS` para dizer que a lista agora é redundante (a raiz
    estática é `front-end/`) mas continua como rede de segurança.

  **Não** alterar o pool MySQL, o `CRIA_TABELA`, `/api/login`, `/api/cadastro` nem `/api/status`.

- [ ] **Step 5: Subir o servidor e checar as rotas**

  Run: `node server.js` (em background)
  Expected: `Servidor rodando em http://localhost:3000`

  ```bash
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/                    # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/indexx.html         # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/css/sty.css         # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/css/style.css       # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/css/estilo.css      # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/js/script.js        # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/js/atividades.js    # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/js/supabase-config.js  # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/assets/img.index/image.png  # 200
  curl.exe -s -o NUL -w "%{http_code}" "http://localhost:3000/assets/img/Captura%20de%20tela%202026-04-06%20165842.png"  # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/api/status          # 200
  ```

  O último curl com `%20` prova que o arquivo **com espaço no nome** é servido corretamente
  (Review Focus #3).

  Expected em todos: `200`.

- [ ] **Step 6: Conferir que o servidor não expõe arquivos da raiz do repositório**

  ```bash
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/server.js   # 403
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/package.json # 403
  ```

  Expected: `403` nos dois — a lista `BLOQUEADOS` responde **403** ("Acesso negado") antes do
  `express.static`, e esses caminhos nem existem mais sob a raiz estática `front-end/`.

- [ ] **Step 7: Parar o servidor e commitar (único commit da tarefa)**

  ```bash
  git add -A
  git commit -m "refactor: move o front-end para a pasta front-end/"
  ```

---

### Task 3: Mover o back-end para `back-end/` e ajustar o deploy

**Files:**
- Move: `server.js` → `back-end/server.js`
- Modify: `back-end/server.js` (o caminho de `FRONT_END`)
- Modify: `package.json`
- Modify: `render.yaml`

**Interfaces:**
- Consumes: layout da Task 2.
- Produces: `npm start` e `npm run dev` rodando `back-end/server.js`; `render.yaml` coerente.

- [ ] **Step 1: Mover o `server.js`**

  ```bash
  git mv server.js back-end/server.js
  ```

- [ ] **Step 2: Ajustar `FRONT_END` no `back-end/server.js`**

  ```js
  const FRONT_END = path.join(__dirname, '..', 'front-end');
  ```

  Como o arquivo agora mora um nível mais fundo, o caminho do front-end passa a ser `..`.

- [ ] **Step 3: Endurecer a lista `BLOQUEADOS`**

  Em `back-end/server.js`, acrescentar `'/back-end'` à lista `BLOQUEADOS` e manter o resto
  (`/node_modules`, `/server.js`, `/package.json`, `/package-lock.json`, `/login2.sql`, `/.git`,
  `/.env`). É defesa em profundidade: a raiz estática já é `front-end/`, então `/back-end/…`
  cairia em 404 de qualquer forma.

- [ ] **Step 4: Atualizar o `package.json` da raiz**

  ```json
  "main": "back-end/server.js",
  "scripts": {
    "start": "node back-end/server.js",
    "dev": "nodemon back-end/server.js",
    "verificar": "node scripts/verificar-caminhos.js"
  }
  ```

  Dependências, `devDependencies` e o resto do arquivo **inalterados**.

- [ ] **Step 5: Atualizar o `render.yaml`**

  ```yaml
  startCommand: node back-end/server.js
  ```

  `buildCommand: npm install`, `healthCheckPath: /` e todas as variáveis `DB_*` **inalterados**.

- [ ] **Step 6: Verificar que o servidor sobe pelo novo caminho**

  Run: `npm start`
  Expected: `Servidor rodando em http://localhost:3000`

  ```bash
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/            # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/indexx.html # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/api/status  # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/back-end/server.js  # 403
  ```

  Expected: `200`, `200`, `200`, `403` (a lista `BLOQUEADOS` responde 403, não 404).

- [ ] **Step 7: Verificar que o servidor funciona de outro diretório**

  Derrubar o servidor do Step 6 primeiro (a porta 3000 precisa estar livre). Depois, de um
  diretório que **não** é o do repositório, subir o servidor pelo caminho absoluto:

  ```powershell
  Set-Location $env:TEMP
  node "<caminho-absoluto-do-repo>\back-end\server.js"
  ```

  Expected: sobe na porta 3000 e `GET /` responde **200** — prova de que o caminho do front-end
  não depende de `process.cwd()`, e sim de `__dirname`. Derrubar o servidor em seguida.

- [ ] **Step 8: Rodar o verificador e commitar**

  Run: `node scripts/verificar-caminhos.js`
  Expected: código **1**, reportando **apenas** `anex.html  ->  ./anexos.css`.

  ```bash
  git add -A
  git commit -m "refactor: move o servidor para back-end/ e ajusta o deploy"
  ```

---

### Task 4: Corrigir o `anex.html` e o estilo do título

**Files:**
- Modify: `front-end/anex.html` (linha do `<link rel="stylesheet">`)
- Modify: `front-end/css/style.css` (regras `.navbar .na`)

**Interfaces:**
- Consumes: layout das Tasks 2 e 3.
- Produces: `anex.html` estilizado; verificador com código de saída **0**.

- [ ] **Step 1: Corrigir o `href` do CSS em `front-end/anex.html`**

  ```html
  <link rel="stylesheet" href="./css/style.css">
  ```

  (`./anexos.css` não existe no repositório — era a referência quebrada que o verificador
  detectava desde a Task 1.)

- [ ] **Step 2: Adicionar a regra `.navbar .na` em `front-end/css/style.css`**

  A classe `.na` (usada no `<h4 class="na">` do `anex.html`) não existe em nenhum CSS do
  projeto. Duas alterações:

  1. **Nova regra**, logo abaixo da regra `.navbar .nome` que já existe (na linha 198 do arquivo
     original), copiando as declarações dela — `font-family: var(--font);`,
     `font-size: 18px;`, `font-weight: 700;`, `letter-spacing: -0.01em;`,
     `text-decoration: none;`, `color: var(--text);` — e trocando o seletor para `.navbar .na`.
  2. **Seletor agrupado**, na regra que aplica a tipografia `SquareDance00` (linha 1292 do
     arquivo original): incluir `.navbar .na,` na lista de seletores.

  Não alterar nenhuma outra regra nem o valor de nenhuma outra declaração.

- [ ] **Step 3: Rodar o verificador**

  Run: `node scripts/verificar-caminhos.js`
  Expected: sai com código **0**. Nenhuma referência ausente. O script pode reportar
  `responsivo.html` como órfão — isso é warning, não falha (Review Focus #5).

- [ ] **Step 4: Conferir no navegador**

  Abrir `http://localhost:3000/anex.html`.
  Expected: a navbar aparece **estilizada** (fonte do título, links alinhados, sem o CSS
  padrão do navegador). Na aba Network, nenhuma requisição 404.

- [ ] **Step 5: Commitar**

  ```bash
  git add -A
  git commit -m "fix: corrige o CSS quebrado da pagina de anexos"
  ```

---

### Task 5: README e verificação final ponta a ponta

**Files:**
- Create: `README.md`
- Modify: nada além de `README.md`

**Interfaces:**
- Consumes: tudo das Tasks 1–4.
- Produces: documentação da estrutura nova + evidência de que o site funciona.

- [ ] **Step 1: Escrever o `README.md`**

  Seções obrigatórias:

  1. **Título e uma linha do que o projeto é** — portfólio do José Wilson, front-end estático +
     servidor Express/MySQL.
  2. **Estrutura de pastas** — a árvore final, em bloco de código.
  3. **O que é back-end** — `back-end/server.js` (Express: `/api/login`, `/api/cadastro`,
     `/api/status`, pool MySQL, auto-cria da tabela `usuarios`) e `back-end/database/*.sql`
     (schemas). Registrar explicitamente que **a API MySQL não é consumida pelo front-end hoje**
     — o navegador fala direto com o Supabase — e que a API está disponível para uso futuro.
  4. **O que é front-end** — `front-end/` com `.html` na raiz, `css/`, `js/`, `assets/`;
     login/cadastro e atividades via Supabase (com fallback em `localStorage`).
  5. **Rodar localmente** — `npm install` na raiz; `npm start` → `http://localhost:3000`;
     `npm run dev` com nodemon; Live Server: raiz `front-end/`, porta 5501 (conforme
     `.vscode/settings.json`).
  6. **Banco de dados** — variáveis `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`,
     `DB_SSL`; defaults de desenvolvimento (`localhost`, `3306`, `root`, `12345`, `login`);
     `login2.sql` para o MySQL local e `supabase.sql` para o Supabase.
  7. **Deploy no Render** — `render.yaml`; build `npm install`, start `node back-end/server.js`,
     health check `/`.
  8. **Verificação** — `npm run verificar` (o verificador de referências locais).

- [ ] **Step 2: Verificação estática final**

  Run: `node scripts/verificar-caminhos.js`
  Expected: código **0**.

  Run: `git status --short`
  Expected: nenhuma modificação pendente fora do `README.md` (as Tasks 2–4 já commitaram tudo).

- [ ] **Step 3: Verificação do servidor**

  Run: `npm start` (background)
  Expected: sobe na 3000.

  ```bash
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/                      # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/indexx.html           # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/ling.html              # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/c.hum.html             # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/c.nut.html             # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/mate.html              # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/senai.html             # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/anex.html              # 200
  curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/api/status            # 200
  ```

  Expected: todos `200`.

- [ ] **Step 4: Verificação no navegador (Playwright)**

  Com o servidor rodando:

  1. Abrir `http://localhost:3000/` — a tela de login renderiza com o CSS aplicado
     (fonte monoespaçada carregada, botão "Conectar" visível). Aba Network: **zero 404**.
  2. Abrir `http://localhost:3000/indexx.html` — a cortina/terminal anima e o conteúdo
     carrega. Aba Network: **zero 404**. Console: **sem erros**.
  3. Clicar nos 6 botões de disciplina (`Linguagens`, `C. Humanas`, `C. Natureza`,
     `Matemática`, `Senai`, `anexos`) — cada página abre com as figuras visíveis e o
     `estilo.css` aplicado. Em cada uma: aba Network **zero 404**, console **sem erros**.
  4. Abrir `http://localhost:3000/anex.html` — navbar estilizada, **zero 404**.

- [ ] **Step 5: Commitar**

  ```bash
  git add README.md
  git commit -m "docs: documenta a estrutura back-end e front-end"
  ```

- [ ] **Step 6: Fechar**

  Derrubar o servidor em background. `git status` limpo. `git log --oneline -6` mostra os
  commits das Tasks 1–5.
