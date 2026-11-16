import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const atividadesJs = readFileSync(new URL('../atividades.js', import.meta.url), 'utf8');

const HTML = `<!DOCTYPE html>
<html>
<body>
  <main>
    <section>
      <h1>Linguagens</h1>

      <h3>EIXO 1</h3>
      <div class="container">
        <figure>
          <img src="./img/a.png">
          <figcaption>Atividade A</figcaption>
        </figure>
        <figure>
          <img src="./img/b.png">
          <figcaption>Atividade B</figcaption>
        </figure>
      </div>

      <h3>EIXO 2</h3>
      <div class="container" id="eixo2-ling">
        <figure>
          <img src="./ling/c.png">
          <figcaption>Atividade C</figcaption>
        </figure>
      </div>
    </section>
  </main>
</body>
</html>`;

function criarPagina({ admin = true, destaques = null } = {}) {
  const dom = new JSDOM(HTML, {
    url: 'http://localhost/ling.html',
    runScripts: 'outside-only',
  });

  const { window } = dom;
  window.alert = () => {};

  if (admin) {
    window.EMAIL_ADMIN = 'aluno@gmail.com';
    window.localStorage.setItem('usuario_logado', 'aluno@gmail.com');
  }

  if (destaques) {
    window.localStorage.setItem('destaques_ling', JSON.stringify(destaques));
  }

  window.eval(atividadesJs);
  return dom;
}

function aguardar(ms = 10) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function figurasDaPagina(dom) {
  await dom.window.inicializarPagina('ling');
  return [...dom.window.document.querySelectorAll('.container figure')];
}

function clicarBotao(figura) {
  const botao = figura.querySelector('.btn-destaque');
  assert.ok(botao, 'a atividade deve ter o botão de melhor do eixo');
  botao.click();
}

function destaquesSalvos(dom) {
  return JSON.parse(dom.window.localStorage.getItem('destaques_ling') || '{}');
}

test('admin vê o botão "Melhor do eixo" em todas as atividades', async () => {
  const dom = criarPagina();
  const figuras = await figurasDaPagina(dom);

  assert.equal(figuras.length, 3);
  for (const figura of figuras) {
    assert.ok(figura.querySelector('.btn-destaque'));
  }
});

test('escolher uma atividade destaca e salva no eixo correto', async () => {
  const dom = criarPagina();
  const figuras = await figurasDaPagina(dom);
  const [primeira, segunda] = figuras;

  clicarBotao(primeira);
  await aguardar();

  assert.ok(primeira.classList.contains('destaque'));
  assert.equal(primeira.querySelector('.selo-destaque')?.textContent, 'MELHOR DO EIXO');
  assert.equal(segunda.querySelector('.btn-destaque').style.display, 'none');
  assert.deepEqual(destaquesSalvos(dom).eixo1, {
    nome: 'Atividade A',
    imagem: './img/a.png',
  });
});

test('com destaque no eixo, só a escolhida pode ser removida e as outras ficam sem opção', async () => {
  const dom = criarPagina();
  const figuras = await figurasDaPagina(dom);
  const [primeira, segunda] = figuras;

  clicarBotao(primeira);
  await aguardar();

  assert.equal(primeira.classList.contains('destaque'), true);
  assert.equal(segunda.classList.contains('destaque'), false);
  assert.notEqual(primeira.querySelector('.btn-destaque').style.display, 'none');
  assert.equal(primeira.querySelector('.btn-destaque').textContent.includes('Remover destaque'), true);
  assert.equal(segunda.querySelector('.btn-destaque').style.display, 'none');

  // para trocar, precisa remover primeiro
  clicarBotao(primeira);
  await aguardar();

  assert.notEqual(primeira.querySelector('.btn-destaque').style.display, 'none');
  assert.notEqual(segunda.querySelector('.btn-destaque').style.display, 'none');

  clicarBotao(segunda);
  await aguardar();

  assert.equal(primeira.classList.contains('destaque'), false);
  assert.equal(segunda.classList.contains('destaque'), true);
  assert.equal(dom.window.document.querySelectorAll('.destaque').length, 1);
  assert.equal(destaquesSalvos(dom).eixo1.nome, 'Atividade B');
});

test('eixos diferentes guardam destaques independentes', async () => {
  const dom = criarPagina();
  const figuras = await figurasDaPagina(dom);

  clicarBotao(figuras[0]);
  await aguardar();
  clicarBotao(figuras[2]);
  await aguardar();

  const salvos = destaquesSalvos(dom);
  assert.equal(salvos.eixo1.nome, 'Atividade A');
  assert.equal(salvos.eixo2.nome, 'Atividade C');
  assert.equal(dom.window.document.querySelectorAll('.destaque').length, 2);
});

test('clicar de novo remove o destaque', async () => {
  const dom = criarPagina();
  const figuras = await figurasDaPagina(dom);
  const primeira = figuras[0];

  clicarBotao(primeira);
  await aguardar();
  clicarBotao(primeira);
  await aguardar();

  assert.equal(primeira.classList.contains('destaque'), false);
  assert.equal(primeira.querySelector('.selo-destaque'), null);
  assert.equal(destaquesSalvos(dom).eixo1, undefined);
});

test('visitante não vê botões, mas vê o destaque salvo', async () => {
  const dom = criarPagina({
    admin: false,
    destaques: { eixo1: { nome: 'Atividade A', imagem: './img/a.png' } },
  });
  const figuras = await figurasDaPagina(dom);

  assert.equal(dom.window.document.querySelectorAll('.btn-destaque').length, 0);
  assert.ok(figuras[0].classList.contains('destaque'));
  assert.ok(figuras[0].querySelector('.selo-destaque'));
});
