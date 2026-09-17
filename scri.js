// Login e cadastro salvos no navegador (localStorage).
// Funciona no GitHub Pages, sem precisar de servidor nem banco externo.
const CHAVE = 'usuarios_portfolio';

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

async function logar() {
    var email = document.getElementById("login").value.trim();
    var senha = document.getElementById("senha").value;

    if (!email || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    var usuarios = obterUsuarios();
    var usuario = usuarios.find(function (u) {
        return u.email === email && u.senha === senha;
    });

    if (usuario) {
        alert("Login realizado com sucesso!");
        window.location.href = "indexx.html";
    } else {
        alert("E-mail ou senha inválidos!");
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