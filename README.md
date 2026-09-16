# Site Masters XV

Site vitrine et d'inscription du tournoi **Masters XV – Le tournoi des légendes Midi Olympique** (mercredi 14 octobre 2026, golf de Palmola).

React + Vite, prêt pour Vercel. Le formulaire d'inscription passe par une fonction serverless (`api/inscription.js`) qui envoie les demandes par e-mail via Resend.

## Modifier les contenus

Toutes les informations (date, lieu, programme, tarif, contact, date limite) sont dans [`src/content.js`](src/content.js). Une valeur à `null` masque l'élément correspondant sur le site.

## En local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # vérifie que le site compile
```

Le formulaire ne fonctionne qu'une fois déployé sur Vercel (ou avec `npx vercel dev`).

## Déployer sur Vercel

1. `npx vercel` depuis ce dossier (connexion au compte Vercel au premier lancement), ou importer le dépôt GitHub sur vercel.com. Vercel détecte Vite automatiquement.
2. Dans *Settings → Environment Variables*, ajouter :
   - `RESEND_API_KEY` : clé API [Resend](https://resend.com)
   - `INSCRIPTION_TO` : adresse(s) qui reçoivent les inscriptions, séparées par des virgules
   - `INSCRIPTION_FROM` : expéditeur vérifié dans Resend, ex. `Masters XV <inscriptions@domaine.fr>`
3. Redéployer (`npx vercel --prod`).

Sans ces variables, le site fonctionne mais le formulaire affiche un message d'erreur. Il propose alors d'écrire par e-mail si `contactEmail` est renseigné dans `src/content.js`.

## Visuels

- Logo vectoriel et variantes : `../logo-vectoriel/`
- Image de partage (`public/og-image.png`) : générée depuis `../invitation/export.mjs`
