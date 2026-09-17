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


-- ————————————————————————————————————————————————————————————————
-- Invités (gratuit) : table séparée des partenaires payants.
-- Le fichier entier peut être relancé sans risque (rien n'est effacé).

create table if not exists public.invites (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  first_name    text not null check (char_length(first_name) between 1 and 120),
  last_name     text not null check (char_length(last_name) between 1 and 120),
  company       text check (char_length(company) <= 200),
  email         text not null check (char_length(email) <= 254),
  phone         text check (char_length(phone) <= 40),

  participation text not null check (participation in ('golf', 'dejeuner')),
  companions    smallint not null default 0 check (companions between 0 and 3),
  level         text check (char_length(level) <= 200),
  diet          text check (char_length(diet) <= 300),
  message       text check (char_length(message) <= 4000),
  lang          text not null default 'fr' check (lang in ('fr', 'en')),
  invited_by    text check (char_length(invited_by) <= 120), -- prénom et nom de l'organisateur, renseigné depuis le tableau de bord
  sponsor       text check (char_length(sponsor) <= 80),      -- carte d'invitation du sponsor (lien /invite/<sponsor>)

  -- Suivi par les organisateurs
  status        text not null default 'nouveau'
                check (status in ('nouveau', 'confirme', 'annule')),
  notes         text check (char_length(notes) <= 4000)
);

alter table public.invites add column if not exists invited_by text check (char_length(invited_by) <= 120);
alter table public.invites add column if not exists sponsor text check (char_length(sponsor) <= 80);
-- Profil choisi au tableau de bord (golfeur ou joueur de rugby) et origine de la ligne
alter table public.invites add column if not exists profile text check (profile in ('golfeur', 'rugbyman'));
alter table public.invites add column if not exists source text not null default 'formulaire' check (source in ('formulaire', 'manuel'));
-- Un rugbyman ajouté à la main peut ne pas avoir d'e-mail
alter table public.invites alter column email drop not null;
-- Partie (équipe de golf) du sponsor dans laquelle l'invité est placé : slug du sponsor, 3 invités maximum
alter table public.invites add column if not exists team text check (char_length(team) <= 80);
-- Numéro de la partie du sponsor (Partie 1, Partie 2…)
alter table public.invites add column if not exists team_no smallint not null default 1 check (team_no between 1 and 20);
create index if not exists invites_created_at_idx on public.invites (created_at desc);

drop trigger if exists invites_touch on public.invites;
create trigger invites_touch before update on public.invites
for each row execute function public.inscriptions_touch();

alter table public.invites enable row level security;
revoke all on public.invites from anon, authenticated;


-- ————————————————————————————————————————————————————————————————
-- Sponsors du site (liste dans src/content.js) : confirmé ou non, depuis le tableau de bord.

create table if not exists public.sponsors (
  slug        text primary key check (char_length(slug) <= 80), -- nom du fichier logo, ex. clickzou
  confirmed   boolean not null default false,
  updated_by  text check (char_length(updated_by) <= 120),
  updated_at  timestamptz not null default now()
);

-- Représentant du sponsor dans sa partie (nom seulement)
alter table public.sponsors add column if not exists representative text check (char_length(representative) <= 120);
-- Sans représentant (ex. Plyz) : la partie compte 4 invités au lieu de 3
alter table public.sponsors add column if not exists has_representative boolean not null default true;
-- Nombre de parties créées pour le sponsor (le représentant joue dans la Partie 1)
alter table public.sponsors add column if not exists teams smallint not null default 1 check (teams between 1 and 20);

alter table public.sponsors enable row level security;
revoke all on public.sponsors from anon, authenticated;
