// Accès aux tables Supabase via l'API REST, côté serveur uniquement.
// « inscriptions » : partenaires payants (sponsors, équipes) · « invites » : invités gratuits
// Variables : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (clé secrète sb_secret_… ou ancienne clé service_role)

const cfg = () => ({
  url: (process.env.SUPABASE_URL || '').replace(/\/$/, ''),
  key: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
})

export const dbConfigured = () => Boolean(cfg().url && cfg().key)

async function call(table, path, { method = 'GET', body, prefer } = {}) {
  const { url, key } = cfg()
  const res = await fetch(`${url}/rest/v1/${table}${path}`, {
    method,
    headers: {
      apikey: key,
      // Ancienne clé service_role (JWT) : aussi en Bearer. Nouvelle clé sb_secret_… : l'en-tête apikey suffit.
      ...(key.startsWith('sb_') ? {} : { Authorization: `Bearer ${key}` }),
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`supabase ${res.status}: ${await res.text()}`)
  return res.status === 204 ? null : res.json()
}

const repo = table => ({
  insert: row => call(table, '', { method: 'POST', body: row, prefer: 'return=representation' }).then(r => r[0]),
  list: () => call(table, '?select=*&order=created_at.desc'),
  get: id => call(table, `?id=eq.${id}&select=*`).then(r => r[0] || null),
  // onlyIf : filtre PostgREST supplémentaire ; renvoie undefined si aucune ligne ne correspond
  update: (id, patch, { onlyIf = '' } = {}) => call(table, `?id=eq.${id}${onlyIf}`, { method: 'PATCH', body: patch, prefer: 'return=representation' }).then(r => r[0]),
  remove: id => call(table, `?id=eq.${id}`, { method: 'DELETE' }),
})

// Liste → table et statuts autorisés
export const LISTS = {
  partenaires: { ...repo('inscriptions'), statuses: ['nouveau', 'contacte', 'confirme', 'paye', 'annule'] },
  invites: { ...repo('invites'), statuses: ['nouveau', 'confirme', 'annule'] },
}

// Statut des sponsors du site (table « sponsors », une ligne par slug de sponsors dans src/content.js)
export const sponsorStatus = {
  list: () => call('sponsors', '?select=*'),
  save: row => call('sponsors', '?on_conflict=slug', { method: 'POST', body: row, prefer: 'resolution=merge-duplicates,return=representation' }).then(r => r[0]),
}

export const isUuid = v => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v || '')
