-- ============================================================
--  EXECUTE ESTE SCRIPT NO SUPABASE (SQL Editor > Run)
--  Ele cria as tabelas de atividades e de usuários.
-- ============================================================

-- Tabela de atividades (os trabalhos que você adiciona nos forms)
create table if not exists public.atividades (
    id bigint generated always as identity primary key,
    pagina text not null,
    eixo text not null,
    nome text not null,
    imagem text,
    created_at timestamptz not null default now()
);

-- Tabela de usuários (login/cadastro)
create table if not exists public.usuarios (
    id bigint generated always as identity primary key,
    nome text not null,
    email text not null unique,
    senha text not null,
    created_at timestamptz not null default now()
);