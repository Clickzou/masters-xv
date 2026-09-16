// API du tableau de bord (protégée par mot de passe) : lister, mettre à jour, supprimer les inscriptions
// Variables : ADMIN_EMAIL, ADMIN_PASSWORD (+ variables Supabase)
import { createHash, timingSafeEqual } from 'node:crypto'
import { dbConfigured, listInscriptions, updateInscription, deleteInscription, STATUSES, isUuid } from './_lib/db.js'

const digest = s => createHash('sha256').update(String(s)).digest()
const sleep = ms => new Promise(r => setTimeout(r, ms))

// En-tête « Authorization: Basic base64(email:motdepasse) »
function authorised(req) {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD || ''
  if (!email || password.length < 10) return false
  let given = ''
  try { given = Buffer.from((req.headers.authorization || '').replace(/^Basic\s+/i, ''), 'base64').toString('utf8') } catch { return false }
  const sep = given.indexOf(':')
  const givenEmail = given.slice(0, Math.max(sep, 0)).trim().toLowerCase()
  const givenPassword = sep >= 0 ? given.slice(sep + 1) : ''
  // Comparaisons à temps constant (les deux sont toujours évaluées)
  const okEmail = timingSafeEqual(digest(givenEmail), digest(email))
  const okPassword = timingSafeEqual(digest(givenPassword), digest(password))
  return okEmail && okPassword
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex')

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_EMAIL) return res.status(503).json({ error: 'admin-not-configured' })
  if (!authorised(req)) {
    await sleep(900) // ralentit les essais de mot de passe
    return res.status(401).json({ error: 'unauthorised' })
  }
  if (!dbConfigured()) return res.status(503).json({ error: 'db-not-configured' })

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ items: await listInscriptions() })
    }

    if (req.method === 'PATCH') {
      const { id, status, notes } = req.body || {}
      if (!isUuid(id)) return res.status(400).json({ error: 'id' })
      const patch = {}
      if (status !== undefined) {
        if (!STATUSES.includes(status)) return res.status(400).json({ error: 'status' })
        patch.status = status
      }
      if (notes !== undefined) patch.notes = String(notes).slice(0, 4000)
      if (!Object.keys(patch).length) return res.status(400).json({ error: 'empty' })
      return res.status(200).json({ item: await updateInscription(id, patch) })
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id || new URL(req.url, 'http://x').searchParams.get('id')
      if (!isUuid(id)) return res.status(400).json({ error: 'id' })
      await deleteInscription(id)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'method' })
  } catch (err) {
    console.error('[admin]', err.message)
    return res.status(502).json({ error: 'db' })
  }
}
