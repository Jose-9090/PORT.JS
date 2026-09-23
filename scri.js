// ============================================================
//  LOGIN/CADASTRO NA NUVEM (Supabase)
//  Se o Supabase ainda não estiver configurado, usa o salvamento
//  local no navegador (comportamento antigo).
// ============================================================

const CHAVE = 'usuarios_portfolio';

function supabaseUrlBase() {
    // Remove "/rest/v1", "/" do final e espaços, para a URL ficar sempre no padrão certo.
    try {
        return new URL(SUPABASE_URL.trim()).origin;
    } catch (err) {
        return '';
    }
}

function supabaseClient() {
    var url = supabaseUrlBase();
    if (typeof SUPABASE_ANON_KEY !== 'undefined' && url && SUPABASE_ANON_KEY.trim()) {
        return supabase.createClient(url, SUPABASE_ANON_KEY.trim());
    }
    return null;
}

function obterUsuarios() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE) || '[]');
    } catch (err) {
        return [];
    }
}

function salvarUsuarios(lista) {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
}

// Guarda quem entrou, para as páginas saberem se podem mostrar o formulário de adicionar.
function registrarLogin(nome, email) {
    try {
        localStorage.setItem('usuario_logado', email);
        localStorage.setItem('usuario_logado_nome', nome || '');
    } catch (err) {
        // sem localStorage, segue o jogo
    }
}

async function logar() {
    var email = document.getElementById("login").value.trim();
    var senha = document.getElementById("senha").value;

    if (!email || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    var banco = supabaseClient();

    // Sem Supabase configurado: usa o navegador
    if (!banco) {
        var usuarios = obterUsuarios();
        var usuario = usuarios.find(function (u) {
            return u.email === email && u.senha === senha;
        });

        if (usuario) {
            registrarLogin(usuario.nome, usuario.email);
            alert("Login realizado com sucesso!");
            window.location.href = "indexx.html";
        } else {
            alert("E-mail ou senha inválidos!");
        }
        return;
    }

    try {
        var resultado = await banco
            .from('usuarios')
            .select('nome, email')
            .eq('email', email)
            .eq('senha', senha)
            .maybeSingle();

        if (resultado.error) throw resultado.error;

        if (resultado.data) {
            registrarLogin(resultado.data.nome, resultado.data.email);
            alert("Login realizado com sucesso!");
            window.location.href = "indexx.html";
        } else {
            alert("E-mail ou senha inválidos!");
        }
    } catch (err) {
        console.error(err);
        alert("Erro ao entrar: " + err.message);
    }
}

async function cadastrar() {
    var nome = document.getElementById("cadNome").value.trim();
    var email = document.getElementById("cadEmail").value.trim();
    var senha = document.getElementById("cadSenha").value;

    if (!nome || !email || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    var banco = supabaseClient();

    // Sem Supabase configurado: usa o navegador
    if (!banco) {
        var usuarios = obterUsuarios();

        var jaExiste = usuarios.some(function (u) {
            return u.email === email;
        });

        if (jaExiste) {
            alert("Este e-mail já está cadastrado!");
            return;
        }

        usuarios.push({ nome: nome, email: email, senha: senha });
        salvarUsuarios(usuarios);

        alert("Cadastro realizado com sucesso! Faça login.");
        document.getElementById("cadNome").value = "";
        document.getElementById("cadEmail").value = "";
        document.getElementById("cadSenha").value = "";
        fecharCadastro();
        return;
    }

    try {
        var existe = await banco
            .from('usuarios')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existe.error) throw existe.error;

        if (existe.data) {
            alert("Este e-mail já está cadastrado!");
            return;
        }

        var inserir = await banco
            .from('usuarios')
            .insert({ nome: nome, email: email, senha: senha });

        if (inserir.error) throw inserir.error;

        alert("Cadastro realizado com sucesso! Faça login.");
        document.getElementById("cadNome").value = "";
        document.getElementById("cadEmail").value = "";
        document.getElementById("cadSenha").value = "";
        fecharCadastro();
    } catch (err) {
        console.error(err);
        alert("Erro ao cadastrar: " + err.message);
    }
}

function cancelar() {
    document.getElementById("login").value = "";
    document.getElementById("senha").value = "";
}

function abrirCadastro() {
    document.getElementById("modalCadastro").classList.add("active");
}

function fecharCadastro() {
    document.getElementById("modalCadastro").classList.remove("active");
}

// ---------- Migração: envia os usuários antigos do navegador para a nuvem ----------
// Quem já tinha criado conta antes (salva só no navegador) passa a funcionar
// em qualquer dispositivo. Nada é apagado antes de dar certo.

async function migrarUsuariosLocais() {
    var banco = supabaseClient();
    if (!banco) return;

    var locais = obterUsuarios();
    if (!locais.length) return;

    var restantes = [];

    for (var i = 0; i < locais.length; i++) {
        var u = locais[i];
        try {
            var existe = await banco
                .from('usuarios')
                .select('id')
                .eq('email', u.email)
                .maybeSingle();

            if (existe.error) throw existe.error;

            if (!existe.data) {
                var inserir = await banco
                    .from('usuarios')
                    .insert({ nome: u.nome, email: u.email, senha: u.senha });

                if (inserir.error) throw inserir.error;
            }
        } catch (err) {
            console.error('Não consegui migrar o usuário ' + u.email + ':', err.message);
            restantes.push(u);
        }
    }

    if (restantes.length === 0) {
        localStorage.removeItem(CHAVE);
    } else {
        salvarUsuarios(restantes);
    }
}

migrarUsuariosLocais();

// ============================================================
//  ABAJUR — puxar o cordão acende e mostra o login
// ============================================================
(function () {
    var lampCena = document.getElementById('lampCena');
    var puxador = document.getElementById('puxador');
    var loginCard = document.getElementById('loginCard');
    if (!lampCena || !puxador || !loginCard) return;

    var ligada = false;
    var ocupado = false;
    var ctxAbajur = null;

    function somToque() {
        try {
            if (!ctxAbajur) {
                ctxAbajur = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (ctxAbajur.state === 'suspended') ctxAbajur.resume();
            var t = ctxAbajur.currentTime;
            var osc = ctxAbajur.createOscillator();
            var ganho = ctxAbajur.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(900, t);
            osc.frequency.exponentialRampToValueAtTime(500, t + 0.06);
            ganho.gain.setValueAtTime(0.08, t);
            ganho.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
            osc.connect(ganho);
            ganho.connect(ctxAbajur.destination);
            osc.start(t);
            osc.stop(t + 0.09);
        } catch (e) {}
    }

    puxador.addEventListener('click', function () {
        if (ocupado) return;
        ocupado = true;
        ligada = !ligada;
        somToque();

        if (ligada) {
            lampCena.classList.add('puxando');
            setTimeout(function () {
                lampCena.classList.remove('puxando');
                lampCena.classList.add('ligada');
                loginCard.classList.add('show');
                ocupado = false;
            }, 280);
        } else {
            loginCard.classList.remove('show');
            lampCena.classList.add('puxando');
            setTimeout(function () {
                lampCena.classList.remove('puxando');
                lampCena.classList.remove('ligada');
                ocupado = false;
            }, 280);
        }
    });
})();