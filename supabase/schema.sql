-- Masters XV : table des demandes d'inscription
-- À exécuter une fois dans Supabase → SQL Editor → New query → Run

create table if not exists public.inscriptions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  first_name    text not null check (char_length(first_name) between 1 and 120),
  last_name     text not null check (char_length(last_name) between 1 and 120),
  company       text check (char_length(company) <= 200),
  email         text not null check (char_length(email) <= 254),
  phone         text check (char_length(phone) <= 40),

  offer         text not null check (offer in ('sponsor', 'equipe')),
  offer_label   text,
  teams         text check (char_length(teams) <= 20),
  level         text check (char_length(level) <= 200),
  message       text check (char_length(message) <= 4000),
  needs_receipt boolean not null default false,
  lang          text not null default 'fr' check (lang in ('fr', 'en')),

  -- Suivi par les organisateurs
  status        text not null default 'nouveau'
                check (status in ('nouveau', 'contacte', 'confirme', 'paye', 'annule')),
  notes         text check (char_length(notes) <= 4000)
);

create index if not exists inscriptions_created_at_idx on public.inscriptions (created_at desc);

-- Mise à jour automatique de updated_at
create or replace function public.inscriptions_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists inscriptions_touch on public.inscriptions;
create trigger inscriptions_touch before update on public.inscriptions
for each row execute function public.inscriptions_touch();

-- Chemin de recherche figé (recommandation du linter Supabase)
alter function public.inscriptions_touch() set search_path = '';

-- Sécurité : RLS activée sans aucune politique.
-- La table n'est donc accessible ni avec la clé publique (anon) ni depuis le navigateur :
-- seules les fonctions serveur du site (clé service_role, jamais exposée) peuvent lire et écrire.
alter table public.inscriptions enable row level security;
revoke all on public.inscriptions from anon, authenticated;
