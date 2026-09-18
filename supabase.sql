-- ============================================================
--  EXECUTE ESTE SCRIPT NO SUPABASE
--  Painel do Supabase > SQL Editor > New query > cole tudo > Run
--  Pode rodar quantas vezes quiser (não apaga dados).
-- ============================================================

-- ---------- TABELAS ----------
create table if not exists public.atividades (
    id bigint generated always as identity primary key,
    pagina text not null,
    eixo text not null,
    nome text not null,
    imagem text,
    created_at timestamptz not null default now()
);

create table if not exists public.usuarios (
    id bigint generated always as identity primary key,
    nome text not null,
    email text not null unique,
    senha text not null,
    created_at timestamptz not null default now()
);

-- ---------- PERMISSÕES (ROW LEVEL SECURITY) ----------
-- Permitir que o site (chave pública/anon) leia e escreva nessas tabelas.
alter table public.usuarios enable row level security;
alter table public.atividades enable row level security;

drop policy if exists "portfolio_usuarios" on public.usuarios;
create policy "portfolio_usuarios" on public.usuarios
    for all to anon
    using (true)
    with check (true);

drop policy if exists "portfolio_atividades" on public.atividades;
create policy "portfolio_atividades" on public.atividades
    for all to anon
    using (true)
    with check (true);

-- ---------- STORAGE (bucket das imagens) ----------
-- Cria o bucket "atividades" como público (se já existir, só garante que é público).
insert into storage.buckets (id, name, public)
values ('atividades', 'atividades', true)
on conflict (id) do update set public = true;

-- Permite enviar, ler, atualizar e apagar imagens nesse bucket.
drop policy if exists "portfolio_storage_insert" on storage.objects;
create policy "portfolio_storage_insert" on storage.objects
    for insert to anon
    with check (bucket_id = 'atividades');

drop policy if exists "portfolio_storage_select" on storage.objects;
create policy "portfolio_storage_select" on storage.objects
    for select to anon
    using (bucket_id = 'atividades');

drop policy if exists "portfolio_storage_update" on storage.objects;
create policy "portfolio_storage_update" on storage.objects
    for update to anon
    using (bucket_id = 'atividades');

drop policy if exists "portfolio_storage_delete" on storage.objects;
create policy "portfolio_storage_delete" on storage.objects
    for delete to anon
    using (bucket_id = 'atividades');