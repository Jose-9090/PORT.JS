// ============================================================
//  ATIVIDADES NA NUVEM (Supabase)
//  Usado em todas as páginas de disciplina.
//  Se o Supabase ainda não estiver configurado, funciona como
//  antes (salva só no dispositivo) para não quebrar o site.
// ============================================================

var supabaseClient = null;

function supabaseUrlBase() {
    // Remove "/rest/v1", "/" do final e espaços, para a URL ficar sempre no padrão certo.
    try {
        return new URL(SUPABASE_URL.trim()).origin;
    } catch (err) {
        return '';
    }
}

function supabaseConfigurado() {
    return typeof SUPABASE_ANON_KEY !== 'undefined'
        && supabaseUrlBase()
        && SUPABASE_ANON_KEY.trim();
}

try {
    if (supabaseConfigurado()) {
        supabaseClient = supabase.createClient(supabaseUrlBase(), SUPABASE_ANON_KEY.trim());
    }
} catch (err) {
    console.error('Supabase não configurado ainda:', err.message);
}

// ---------- Permissão: só a conta do aluno pode adicionar ----------

function emailLogado() {
    try {
        return (localStorage.getItem('usuario_logado') || '').trim().toLowerCase();
    } catch (err) {
        return '';
    }
}

function podeAdicionarAtividade() {
    return typeof EMAIL_ADMIN !== 'undefined'
        && emailLogado() === EMAIL_ADMIN.trim().toLowerCase();
}

// ---------- Destaques: melhor atividade de cada eixo ----------

var destaquesAtuais = {};

function normalizarTexto(valor) {
    return String(valor || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function eixoDoContainer(container) {
    if (!container) return '';

    var id = container.getAttribute('id') || '';
    var eixoDoId = id.match(/^(eixo\d+)-/i);
    if (eixoDoId) return eixoDoId[1].toLowerCase();

    // Containers estáticos (ex.: EIXO 1) não têm id; o eixo vem do h3 anterior.
    var anterior = container.previousElementSibling;
    while (anterior && anterior.tagName !== 'H3') {
        anterior = anterior.previousElementSibling;
    }
    if (anterior) {
        var eixoDoTitulo = anterior.textContent.match(/EIXO\s*(\d+)/i);
        if (eixoDoTitulo) return 'eixo' + eixoDoTitulo[1];
    }

    return '';
}

function prepararFigura(pagina, figura, eixo) {
    if (!figura) return;

    if (eixo && !figura.dataset.eixo) figura.dataset.eixo = eixo;

    var legenda = figura.querySelector('figcaption');
    if (!figura.dataset.nome) {
        figura.dataset.nome = legenda ? legenda.textContent.trim() : '';
    }

    var imagem = figura.querySelector('img');
    if (!figura.dataset.imagem) {
        figura.dataset.imagem = imagem ? (imagem.getAttribute('src') || '') : '';
    }

    if (!podeAdicionarAtividade()) return;
    if (figura.querySelector('.btn-destaque')) return;

    var botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn-destaque';
    botao.setAttribute('aria-pressed', 'false');
    botao.innerHTML = '<span class="bd-icone" aria-hidden="true">☆</span>' +
        '<span class="bd-texto">Melhor do eixo</span>';
    botao.addEventListener('click', function () {
        alternarDestaque(pagina, figura);
    });

    figura.appendChild(botao);
}

function prepararFiguras(pagina) {
    var containers = document.querySelectorAll('.container');
    for (var i = 0; i < containers.length; i++) {
        var eixo = eixoDoContainer(containers[i]);
        var figuras = containers[i].querySelectorAll('figure');
        for (var j = 0; j < figuras.length; j++) {
            prepararFigura(pagina, figuras[j], eixo);
        }
    }
}

function figuraEhDestaque(figura) {
    var destaque = destaquesAtuais[figura.dataset.eixo];
    if (!destaque) return false;

    var imagem = figura.dataset.imagem || '';
    if (destaque.imagem && imagem && destaque.imagem === imagem) return true;

    var nome = normalizarTexto(figura.dataset.nome);
    return !!nome && nome === normalizarTexto(destaque.nome);
}

function aplicarDestaques(pagina) {
    var figuras = document.querySelectorAll('.container figure');
    for (var i = 0; i < figuras.length; i++) {
        var figura = figuras[i];
        if (!figura.dataset.eixo) continue;

        var destacada = figuraEhDestaque(figura);
        var selo = figura.querySelector('.selo-destaque');
        var botao = figura.querySelector('.btn-destaque');

        figura.classList.toggle('destaque', destacada);

        if (destacada) {
            if (!selo) {
                selo = document.createElement('span');
                selo.className = 'selo-destaque';
                selo.textContent = 'MELHOR DO EIXO';
                figura.insertBefore(selo, figura.firstChild);
            }
        } else if (selo) {
            selo.remove();
        }

        if (botao) {
            var icone = botao.querySelector('.bd-icone');
            var texto = botao.querySelector('.bd-texto');
            var temDestaqueNoEixo = !!destaquesAtuais[figura.dataset.eixo];

            botao.classList.toggle('ativo', destacada);
            botao.setAttribute('aria-pressed', destacada ? 'true' : 'false');
            if (icone) icone.textContent = destacada ? '★' : '☆';
            if (texto) texto.textContent = destacada ? 'Remover destaque' : 'Melhor do eixo';

            // Com destaque no eixo, só a escolhida exibe a opção de remover; as outras somem.
            // Sem destaque no eixo, todas as atividades exibem a opção de escolher.
            botao.style.display = (temDestaqueNoEixo && !destacada) ? 'none' : '';
        }
    }
}

function lerDestaquesLocal(pagina) {
    try {
        var salvos = JSON.parse(localStorage.getItem('destaques_' + pagina) || '{}');
        return salvos && typeof salvos === 'object' ? salvos : {};
    } catch (err) {
        return {};
    }
}

function carregarDestaquesLocal(pagina) {
    var salvos = lerDestaquesLocal(pagina);
    for (var eixo in salvos) {
        if (Object.prototype.hasOwnProperty.call(salvos, eixo) && salvos[eixo] && salvos[eixo].nome) {
            destaquesAtuais[eixo] = {
                nome: salvos[eixo].nome,
                imagem: salvos[eixo].imagem || ''
            };
        }
    }
}

function salvarDestaqueLocal(pagina, eixo, dados) {
    var salvos = lerDestaquesLocal(pagina);
    if (dados) {
        salvos[eixo] = dados;
    } else {
        delete salvos[eixo];
    }
    localStorage.setItem('destaques_' + pagina, JSON.stringify(salvos));
}

async function carregarDestaques(pagina) {
    destaquesAtuais = {};

    if (!supabaseConfigurado()) {
        carregarDestaquesLocal(pagina);
        return;
    }

    try {
        var resultado = await supabaseClient
            .from('destaques')
            .select('eixo, nome, imagem')
            .eq('pagina', pagina);

        if (resultado.error) throw resultado.error;

        for (var i = 0; i < resultado.data.length; i++) {
            var linha = resultado.data[i];
            destaquesAtuais[linha.eixo] = {
                nome: linha.nome,
                imagem: linha.imagem || ''
            };
        }
    } catch (err) {
        console.error('Erro ao carregar destaques:', err.message);
        carregarDestaquesLocal(pagina);
    }
}

async function salvarDestaque(pagina, eixo, dados) {
    if (!supabaseConfigurado()) {
        salvarDestaqueLocal(pagina, eixo, dados);
        return true;
    }

    try {
        var resultado;

        if (dados) {
            resultado = await supabaseClient
                .from('destaques')
                .upsert(
                    { pagina: pagina, eixo: eixo, nome: dados.nome, imagem: dados.imagem || null },
                    { onConflict: 'pagina,eixo' }
                );
        } else {
            resultado = await supabaseClient
                .from('destaques')
                .delete()
                .eq('pagina', pagina)
                .eq('eixo', eixo);
        }

        if (resultado.error) throw resultado.error;
        return true;
    } catch (err) {
        console.error('Erro ao salvar destaque:', {
            message: err && err.message,
            code: err && err.code,
            details: err && err.details,
            hint: err && err.hint
        });

        var detalhe = (err && err.code ? err.code + ': ' : '') + ((err && err.message) || 'erro desconhecido');
        var dica = err && err.hint ? '\n\nDica do Supabase: ' + err.hint : '';
        alert('Não consegui salvar o destaque.\n\n' + detalhe + dica +
            '\n\nSe o código for PGRST205, rode o SQL da tabela "destaques" no SQL Editor do Supabase.');

        return false;
    }
}

async function alternarDestaque(pagina, figura) {
    if (!podeAdicionarAtividade() || !figura) return;

    var eixo = figura.dataset.eixo;
    var nome = figura.dataset.nome;
    if (!eixo || !nome) return;

    var jaEscolhida = figuraEhDestaque(figura);
    var novoDestaque = jaEscolhida ? null : {
        nome: nome,
        imagem: figura.dataset.imagem || ''
    };

    var salvou = await salvarDestaque(pagina, eixo, novoDestaque);
    if (!salvou) return;

    if (novoDestaque) {
        destaquesAtuais[eixo] = novoDestaque;
    } else {
        delete destaquesAtuais[eixo];
    }

    aplicarDestaques(pagina);
}

// ---------- Funções auxiliares ----------

function adicionarFigura(pagina, eixo, nome, imagem) {
    var container = document.getElementById(eixo + '-' + pagina);
    if (!container) return;

    var figure = document.createElement('figure');
    figure.classList.add('atividade-cloud');

    var img = document.createElement('img');
    img.src = imagem;
    img.className = 'rotacionar';
    img.onerror = function () {
        img.style.display = 'none';
    };

    var figcaption = document.createElement('figcaption');
    figcaption.textContent = nome;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    container.appendChild(figure);

    prepararFigura(pagina, figure, eixo);
}

function dataURLparaBlob(dataURL) {
    var partes = dataURL.split(',');
    var mime = partes[0].match(/:(.*?);/)[1];
    var binario = atob(partes[1]);
    var tamanho = binario.length;
    var bytes = new Uint8Array(tamanho);
    for (var i = 0; i < tamanho; i++) {
        bytes[i] = binario.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
}

// ---------- Modo local (quando o Supabase ainda não foi configurado) ----------

function carregarAtividadesLocal(pagina) {
    var chave = 'atividades_' + pagina;
    var salvos = localStorage.getItem(chave);
    if (!salvos) return;

    try {
        var atividades = JSON.parse(salvos);
        for (var i = 0; i < atividades.length; i++) {
            adicionarFigura(pagina, atividades[i].eixo, atividades[i].nome, atividades[i].imagem);
        }
    } catch (err) {
        // dados corrompidos, ignora
    }
}

// ---------- Supabase ----------

async function enviarImagem(pagina, arquivo) {
    var extensao = (String(arquivo.name).split('.').pop() || 'png').toLowerCase();
    var caminho = pagina + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + extensao;

    var upload = await supabaseClient.storage
        .from(SUPABASE_BUCKET)
        .upload(caminho, arquivo, { cacheControl: '3600' });

    if (upload.error) {
        throw new Error('Falha ao enviar a imagem: ' + upload.error.message);
    }

    return supabaseClient.storage.from(SUPABASE_BUCKET).getPublicUrl(caminho).data.publicUrl;
}

async function carregarAtividadesSalvas(pagina) {
    if (!supabaseConfigurado()) {
        carregarAtividadesLocal(pagina);
        return;
    }

    try {
        var resultado = await supabaseClient
            .from('atividades')
            .select('eixo, nome, imagem')
            .eq('pagina', pagina)
            .order('created_at', { ascending: true });

        if (resultado.error) throw resultado.error;

        for (var i = 0; i < resultado.data.length; i++) {
            adicionarFigura(pagina, resultado.data[i].eixo, resultado.data[i].nome, resultado.data[i].imagem);
        }
    } catch (err) {
        console.error('Erro ao carregar do Supabase:', err.message);
        carregarAtividadesLocal(pagina);
    }
}

async function adicionarAtividade(pagina) {
    if (!podeAdicionarAtividade()) {
        alert('Somente a conta do aluno (' + EMAIL_ADMIN + ') pode adicionar atividades.');
        return;
    }

    var eixo = document.getElementById('eixoAtividade-' + pagina).value;
    var nome = document.getElementById('nomeAtividade-' + pagina).value;
    var arquivo = document.getElementById('arquivoAtividade-' + pagina).files[0];

    if (!nome || !arquivo) {
        alert('Preencha o nome e selecione uma imagem!');
        return;
    }

    document.getElementById('nomeAtividade-' + pagina).value = '';
    document.getElementById('arquivoAtividade-' + pagina).value = '';

    if (!supabaseConfigurado()) {
        // Se o Supabase não foi configurado, salva no dispositivo (comportamento antigo)
        var reader = new FileReader();
        reader.onload = function (e) {
            adicionarFigura(pagina, eixo, nome, e.target.result);
            var chave = 'atividades_' + pagina;
            var salvos = JSON.parse(localStorage.getItem(chave) || '[]');
            salvos.push({ eixo: eixo, nome: nome, imagem: e.target.result });
            localStorage.setItem(chave, JSON.stringify(salvos));
            alert('Atividade salva só nesta tela. Configure o Supabase para salvar na nuvem.');
        };
        reader.readAsDataURL(arquivo);
        return;
    }

    try {
        var urlImagem = await enviarImagem(pagina, arquivo);
        var inserir = await supabaseClient
            .from('atividades')
            .insert({ pagina: pagina, eixo: eixo, nome: nome, imagem: urlImagem });

        if (inserir.error) throw inserir.error;

        adicionarFigura(pagina, eixo, nome, urlImagem);
        alert('Atividade adicionada na nuvem!');
    } catch (err) {
        console.error(err);
        alert('Erro ao salvar na nuvem: ' + err.message);
    }
}

// ---------- Migração: envia as atividades antigas do dispositivo para a nuvem ----------

async function migrarAtividadesLocais(pagina) {
    if (!supabaseConfigurado()) return;

    var chave = 'atividades_' + pagina;
    var salvos = JSON.parse(localStorage.getItem(chave) || '[]');
    if (!salvos.length) return;

    var restantes = [];

    for (var i = 0; i < salvos.length; i++) {
        try {
            var arquivo = new File([dataURLparaBlob(salvos[i].imagem)], 'atividade.png', { type: 'image/png' });
            var urlImagem = await enviarImagem(pagina, arquivo);
            var inserir = await supabaseClient
                .from('atividades')
                .insert({ pagina: pagina, eixo: salvos[i].eixo, nome: salvos[i].nome, imagem: urlImagem });

            if (inserir.error) throw inserir.error;
        } catch (err) {
            console.error('Não consegui migrar uma atividade:', err.message);
            restantes.push(salvos[i]);
        }
    }

    if (restantes.length === 0) {
        localStorage.removeItem(chave);
    } else {
        localStorage.setItem(chave, JSON.stringify(restantes));
    }
}

function aplicarPermissao() {
    var form = document.querySelector('.forma');
    if (!form) return;
    // Esconde o formulário de adicionar para quem não é a conta do aluno (ex.: professor).
    form.style.display = podeAdicionarAtividade() ? '' : 'none';
}

async function inicializarPagina(pagina) {
    aplicarPermissao();
    await carregarAtividadesSalvas(pagina);
    await migrarAtividadesLocais(pagina);
    prepararFiguras(pagina);
    await carregarDestaques(pagina);
    aplicarDestaques(pagina);
}