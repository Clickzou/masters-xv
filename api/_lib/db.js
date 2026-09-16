// Accès à la table Supabase « inscriptions » via l'API REST, côté serveur uniquement.
// Variables : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

const cfg = () => ({
  url: (process.env.SUPABASE_URL || '').replace(/\/$/, ''),
  key: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
})

export const dbConfigured = () => Boolean(cfg().url && cfg().key)

async function call(path, { method = 'GET', body, prefer } = {}) {
  const { url, key } = cfg()
  const res = await fetch(`${url}/rest/v1/inscriptions${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`supabase ${res.status}: ${await res.text()}`)
  return res.status === 204 ? null : res.json()
}

export const insertInscription = row => call('', { method: 'POST', body: row, prefer: 'return=representation' }).then(r => r[0])
export const listInscriptions = () => call('?select=*&order=created_at.desc')
export const updateInscription = (id, patch) => call(`?id=eq.${id}`, { method: 'PATCH', body: patch, prefer: 'return=representation' }).then(r => r[0])
export const deleteInscription = id => call(`?id=eq.${id}`, { method: 'DELETE' })

export const STATUSES = ['nouveau', 'contacte', 'confirme', 'paye', 'annule']
export const isUuid = v => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v || '')
