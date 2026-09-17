// API du tableau de bord (protégée par mot de passe) : lister, mettre à jour, supprimer
// ?list=partenaires (défaut) ou ?list=invites
// Connexion : prénom et nom de l'organisateur + mot de passe commun (ADMIN_PASSWORD).
// Invités : un organisateur indique « C'est moi qui l'ai invité » (invited_by = son nom).
// Ensuite, seul lui peut modifier ou supprimer cet invité ; les autres le voient en lecture seule.
// Variables : ADMIN_PASSWORD (+ variables Supabase)
import { createHash, timingSafeEqual } from 'node:crypto'
import { dbConfigured, LISTS, isUuid } from './_lib/db.js'

const digest = s => createHash('sha256').update(String(s)).digest()
const sleep = ms => new Promise(r => setTimeout(r, ms))
export const cleanName = s => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, 120)
export const sameName = (a, b) => cleanName(a).toLowerCase() === cleanName(b).toLowerCase()

// En-tête « Authorization: Basic base64(prénom nom:motdepasse) » → nom de l'organisateur, ou null
function authorise(req) {
  const password = process.env.ADMIN_PASSWORD || ''
  if (password.length < 10) return null
  let given = ''
  try { given = Buffer.from((req.headers.authorization || '').replace(/^Basic\s+/i, ''), 'base64').toString('utf8') } catch { return null }
  const sep = given.indexOf(':')
  const name = cleanName(given.slice(0, Math.max(sep, 0)))
  const okPassword = timingSafeEqual(digest(sep >= 0 ? given.slice(sep + 1) : ''), digest(password)) // temps constant
  return okPassword && name.length >= 2 ? name : null
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex')

  if (!process.env.ADMIN_PASSWORD) return res.status(503).json({ error: 'admin-not-configured' })
  const me = authorise(req)
  if (!me) {
    await sleep(900) // ralentit les essais de mot de passe
    return res.status(401).json({ error: 'unauthorised' })
  }
  if (!dbConfigured()) return res.status(503).json({ error: 'db-not-configured' })

  const params = new URL(req.url, 'http://x').searchParams
  const listKey = params.get('list') || 'partenaires'
  const list = LISTS[listKey]
  if (!list) return res.status(400).json({ error: 'list' })
  const guests = listKey === 'invites'

  // Un invité revendiqué par un autre organisateur est en lecture seule
  const check = async id => {
    if (!guests) return { ok: true }
    const row = await list.get(id)
    if (!row) return { code: 404, error: 'missing' }
    if (row.invited_by && !sameName(row.invited_by, me)) return { code: 403, error: 'forbidden' }
    return { ok: true, row }
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ items: await list.list() })
    }

    if (req.method === 'PATCH') {
      const { id, status, notes, claim } = req.body || {}
      if (!isUuid(id)) return res.status(400).json({ error: 'id' })
      const patch = {}
      if (status !== undefined) {
        if (!list.statuses.includes(status)) return res.status(400).json({ error: 'status' })
        patch.status = status
      }
      if (notes !== undefined) patch.notes = String(notes).slice(0, 4000)
      if (guests && claim !== undefined) patch.invited_by = claim ? me : null
      if (!Object.keys(patch).length) return res.status(400).json({ error: 'empty' })

      const c = await check(id)
      if (!c.ok) return res.status(c.code).json({ error: c.error })
      // Invité encore libre : la mise à jour n'a lieu que si personne ne l'a revendiqué entre-temps
      const item = await list.update(id, patch, { onlyIf: guests && !c.row.invited_by ? '&invited_by=is.null' : '' })
      if (!item) return res.status(409).json({ error: 'already-claimed' })
      return res.status(200).json({ item })
    }

    if (req.method === 'DELETE') {
      const id = params.get('id')
      if (!isUuid(id)) return res.status(400).json({ error: 'id' })
      const c = await check(id)
      if (!c.ok) return res.status(c.code).json({ error: c.error })
      await list.remove(id)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'method' })
  } catch (err) {
    console.error('[admin]', err.message)
    return res.status(502).json({ error: 'db' })
  }
}
