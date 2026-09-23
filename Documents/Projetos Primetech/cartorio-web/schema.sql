-- ==========================================================
-- Schema do "Controle de Processos" para Supabase
-- Rode este arquivo inteiro em: painel do Supabase > SQL Editor > New query
-- ==========================================================

-- ----------------------------------------------------------
-- 1) PROFILES (dados extras de cada usuário logado)
--    A tabela auth.users já existe automaticamente no Supabase
--    e guarda e-mail/senha. Aqui guardamos nome, se é admin, etc.
-- ----------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text,
  is_admin boolean not null default false,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Função auxiliar: verifica se o usuário logado é admin
-- (security definer = ignora RLS só aqui dentro, pra evitar recursão)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Qualquer usuário logado pode VER a lista de perfis (precisa pros
-- seletores de "responsável")
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- Só admin pode editar perfis (nome, is_admin, ativo de qualquer um)
create policy "profiles_update_admin_only"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Quando alguém é criado no painel do Supabase (Authentication > Add user),
-- cria automaticamente a linha correspondente em profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email, is_admin, ativo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email,
    false,
    true
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------
-- 2) CARTÓRIOS
-- ----------------------------------------------------------
create table public.cartorios (
  id bigint generated always as identity primary key,
  nome text not null unique,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

alter table public.cartorios enable row level security;

create policy "cartorios_all_authenticated"
  on public.cartorios for all
  to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------
-- 3) PROCESSOS
-- ----------------------------------------------------------
create table public.processos (
  id bigint generated always as identity primary key,
  identificacao text not null,
  tipo text not null default 'Registro',
  cliente text,
  imovel text,
  observacoes text,

  data_protocolo date,
  numero_protocolo text,
  cartorio_id bigint references public.cartorios(id),
  matricula text,
  banco text,
  data_limite date,
  responsavel_acompanhamento_id uuid references public.profiles(id),

  em_analise boolean not null default false,

  registro_concluido boolean not null default false,
  data_registro date,
  numero_registro_averbacao text,
  matricula_atualizada_recebida boolean not null default false,
  contrato_registrado_recebido boolean not null default false,
  documento_enviado_caixa boolean not null default false,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  criado_por_id uuid references public.profiles(id)
);

alter table public.processos enable row level security;

create policy "processos_all_authenticated"
  on public.processos for all
  to authenticated
  using (true)
  with check (true);

-- Atualiza atualizado_em automaticamente a cada UPDATE
create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger trg_processos_atualizado_em
  before update on public.processos
  for each row execute procedure public.set_atualizado_em();

-- ----------------------------------------------------------
-- 4) EXIGÊNCIAS
-- ----------------------------------------------------------
create table public.exigencias (
  id bigint generated always as identity primary key,
  processo_id bigint not null references public.processos(id) on delete cascade,

  data_exigencia date not null default current_date,
  descricao text not null,
  responsavel_solucao_id uuid references public.profiles(id),
  documento_necessario text,
  data_envio_solucao date,
  cumprida boolean not null default false,
  novo_prazo date,

  criado_em timestamptz not null default now()
);

alter table public.exigencias enable row level security;

create policy "exigencias_all_authenticated"
  on public.exigencias for all
  to authenticated
  using (true)
  with check (true);

-- ==========================================================
-- Fim do schema.
-- Depois de rodar, crie o primeiro usuário em:
--   Authentication > Users > Add user (marque "Auto Confirm User")
-- Depois rode este comando (trocando o e-mail) pra torná-lo admin:
--   update public.profiles set is_admin = true where email = 'seu@email.com';
-- ==========================================================
