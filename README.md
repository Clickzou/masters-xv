# Site Masters XV — masters-xv.fr

Site vitrine et d'inscription du tournoi **Masters XV – Legends Golf Trophy · Midi Olympique** (mercredi 14 octobre 2026, golf de Palmola), en français et en anglais.

- React + Vite, hébergé sur Vercel
- Deux parcours séparés :
  - **Partenaires payants** (sponsors, équipes) : page d'accueil `/`, table Supabase `inscriptions`
  - **Invités gratuits** : page miroir **`/invite`** sans les prix (non référencée), table Supabase `invites`
    - Chaque sponsor a sa carte et son lien **`/invite/<sponsor>`** (ex. `/invite/clickzou`, slug = nom du fichier logo) : la page affiche « Midi Olympique et <Société>… » et l'invité est rattaché au sponsor (colonne « Carte » du tableau de bord)
- Inscriptions enregistrées dans **Supabase** (région Francfort)
- E-mails envoyés avec **Resend** : alerte aux organisateurs + confirmation au participant (FR/EN)
- Tableau de bord sur **/admin** : onglets « Partenaires payants » et « Invités », export Excel
  - Connexion : prénom et nom + mot de passe commun
  - Onglet Invités : l'organisateur qui a invité quelqu'un clique sur « C'est moi » ; lui seul peut ensuite modifier ou supprimer cet invité (les autres le voient en lecture seule)

## Modifier les contenus

- Textes, programme, formules, sponsors, galerie : [`src/content.js`](src/content.js) (FR et EN)
- Pages légales : [`src/legal.js`](src/legal.js) — capital social, directeur de la publication et e-mail de contact à compléter

## Mise en service

### 1. Supabase

1. Projet `masters-xv` → **SQL Editor** → coller le contenu de [`supabase/schema.sql`](supabase/schema.sql) → **Run**. Le fichier peut être relancé sans risque (il crée la table `invites` si elle manque, sans rien effacer).
2. **Project Settings → API** : noter l'URL du projet et la clé **service_role** (secrète, jamais dans le code).

### 2. Resend

1. **Domains → Add domain** : `masters-xv.fr`.
2. Ajouter chez **o2switch** (cPanel → Zone DNS) les enregistrements TXT/MX affichés par Resend, puis **Verify**.
3. **API Keys → Create** : noter la clé.

### 3. Vercel — variables d'environnement

*Settings → Environment Variables* (Production), puis redéployer :

| Variable | Valeur |
|---|---|
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | clé service_role Supabase |
| `RESEND_API_KEY` | clé API Resend |
| `INSCRIPTION_FROM` | `Masters XV <inscriptions@masters-xv.fr>` |
| `INSCRIPTION_TO` | adresses des organisateurs, séparées par des virgules |
| `ADMIN_PASSWORD` | mot de passe commun du tableau de bord (10 caractères minimum) |

### 4. Domaine masters-xv.fr (o2switch → Vercel)

Vercel → *Settings → Domains* → ajouter `masters-xv.fr` et `www.masters-xv.fr`, puis dans la zone DNS o2switch :

| Type | Nom | Valeur |
|---|---|---|
| A | `masters-xv.fr.` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com.` |

(Vercel affiche les valeurs exactes à utiliser si elles diffèrent.)

## En local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
```

Les fonctions `/api` (formulaire, tableau de bord) tournent sur Vercel ou avec `npx vercel dev`.

## Visuels

- Logo vectoriel et variantes : `../logo-vectoriel/`
- Cartes d'invitation et image de partage (`public/og-image.png`) : `../invitation/export.mjs` → `partenaires/` (QR code vers `/#inscription`) et `invites/<sponsor>/` (une carte par sponsor, QR code vers `/invite/<sponsor>`)
