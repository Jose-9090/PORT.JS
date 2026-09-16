const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345', 
    database: 'login'    
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao MySQL com sucesso!');
});

app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ success: false, message: 'Preencha todos os campos!' });
    }

    const sql = 'SELECT id, nome, email FROM usuarios WHERE email = ? AND senha = ?';

    db.query(sql, [email, senha], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro interno no servidor' });
        }

        if (results.length > 0) {
            return res.json({
                success: true,
                user: results[0]
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'E-mail ou senha inválidos!'
            });
        }
    });
});

app.post('/api/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ success: false, message: 'Preencha todos os campos!' });
    }

    const checkSql = 'SELECT id FROM usuarios WHERE email = ?';

    db.query(checkSql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro interno no servidor' });
        }

        if (results.length > 0) {
            return res.status(409).json({ success: false, message: 'Este e-mail já está cadastrado!' });
        }

        const insertSql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';

        db.query(insertSql, [nome, email, senha], (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário' });
            }

            return res.status(201).json({
                success: true,
                message: 'Cadastro realizado com sucesso!',
                user: { id: result.insertId, nome, email }
            });
        });
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});