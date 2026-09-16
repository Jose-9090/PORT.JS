const API_URL = 'http://localhost:3000';

async function logar() {
    var email = document.getElementById("login").value;
    var senha = document.getElementById("senha").value;

    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (data.success) {
            alert("Login realizado com sucesso!");
            window.location.href = "indexx.html";
        } else {
            alert(data.message || "Usuário ou senha incorretos!");
        }
    } catch (error) {
        alert("Erro ao conectar com o servidor. Verifique se o server.js está rodando.");
    }
}

async function cadastrar() {
    var nome = document.getElementById("cadNome").value;
    var email = document.getElementById("cadEmail").value;
    var senha = document.getElementById("cadSenha").value;

    try {
        const response = await fetch(`${API_URL}/api/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();

        if (data.success) {
            alert("Cadastro realizado com sucesso! Faça login.");
            document.getElementById("cadNome").value = "";
            document.getElementById("cadEmail").value = "";
            document.getElementById("cadSenha").value = "";
            fecharCadastro();
        } else {
            alert(data.message || "Erro ao cadastrar!");
        }
    } catch (error) {
        alert("Erro ao conectar com o servidor. Verifique se o server.js está rodando.");
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
