// ============================================================
//  CONFIGURAÇÃO DO SUPABASE  (banco de dados na nuvem, grátis)
// ============================================================
//  PASSO A PASSO:
//   1. Acesse https://supabase.com e faça login (pode ser com GitHub ou Google)
//   2. Clique em "New project" e crie um projeto grátis (digite um nome e uma senha do banco)
//   3. Aguarde terminar de criar.
//   4. No menu da esquerda: Settings (engrenagem) > API
//   5. Copie o "Project URL" e cole em SUPABASE_URL abaixo
//   6. Copie a "anon public key" e cole em SUPABASE_ANON_KEY abaixo
//   7. Rode o script SQL de dentro deste repositório (arquivo "supabase.sql"):
//        No painel do Supabase: SQL Editor > clicar no arquivo "supabase.sql"
//        que você deu upload/colou lá > Run.
//   8. Crie um bucket de imagens: Storage > New bucket > nome exatamente:
//        "atividades"  e marque a opção "Public bucket".
//   9. Salve o arquivo e suba tudo no GitHub. Pronto!
// ============================================================

const SUPABASE_URL = 'https://phphefrsgvuayeczgctx.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_BV411PnUVarbyWTt2h86UA_ml0FK1rh';

// Nome do bucket (pasta) criado no Storage para guardar as imagens.
const SUPABASE_BUCKET = 'atividades';