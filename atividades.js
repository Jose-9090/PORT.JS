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

async function inicializarPagina(pagina) {
    await carregarAtividadesSalvas(pagina);
    await migrarAtividadesLocais(pagina);
}