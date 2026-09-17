// API du tableau de bord (protégée par mot de passe) : lister, mettre à jour, supprimer
// ?list=partenaires (défaut) ou ?list=invites
// Connexion : prénom et nom de l'organisateur + mot de passe commun (ADMIN_PASSWORD).
// Invités : un organisateur indique « C'est moi qui l'ai invité » (invited_by = son nom).
// Ensuite, seul lui peut modifier ou supprimer cet invité ; les autres le voient en lecture seule.
// Variables : ADMIN_PASSWORD (+ variables Supabase)
import { createHash, timingSafeEqual } from 'node:crypto'
import { dbConfigured, LISTS, isUuid, sponsorStatus } from './_lib/db.js'
import { sponsorBySlug } from '../src/content.js'

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

const clip = (v, max) => {
  const s = String(v ?? '').trim()
  return s ? s.slice(0, max) : null
}
const PROFILES = ['golfeur', 'rugbyman']
// Partie d'un sponsor : 4 joueurs = représentant + 3 invités, ou 4 invités s'il n'a pas de représentant
export const teamCapacity = sponsorRow => (sponsorRow?.has_representative === false ? 4 : 3)

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

  // Sponsors du site : confirmé ou non (modifiable par tous les organisateurs)
  if (listKey === 'sponsors') {
    try {
      if (req.method === 'GET') return res.status(200).json({ items: await sponsorStatus.list() })
      if (req.method === 'PATCH') {
        const { slug, confirmed, representative, hasRepresentative } = req.body || {}
        if (!sponsorBySlug(slug)) return res.status(400).json({ error: 'invalid' })
        const row = { slug, updated_by: me, updated_at: new Date().toISOString() }
        if (confirmed !== undefined) {
          if (typeof confirmed !== 'boolean') return res.status(400).json({ error: 'invalid' })
          row.confirmed = confirmed
        }
        if (representative !== undefined) row.representative = clip(representative, 120)
        if (hasRepresentative !== undefined) {
          if (typeof hasRepresentative !== 'boolean') return res.status(400).json({ error: 'invalid' })
          row.has_representative = hasRepresentative
          if (!hasRepresentative) row.representative = null
        }
        const item = await sponsorStatus.save(row)
        return res.status(200).json({ item })
      }
      return res.status(405).json({ error: 'method' })
    } catch (err) {
      console.error('[admin sponsors]', err.message)
      return res.status(502).json({ error: 'db' })
    }
  }
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

    // Ajout manuel d'un invité (joueur de rugby) : l'organisateur connecté en devient responsable
    if (req.method === 'POST' && guests) {
      const d = req.body || {}
      const companions = Number.parseInt(d.companions, 10)
      const row = {
        first_name: clip(d.firstName, 120),
        last_name: clip(d.lastName, 120),
        company: clip(d.company, 200),
        email: clip(d.email, 254),
        phone: clip(d.phone, 40),
        participation: ['golf', 'dejeuner'].includes(d.participation) ? d.participation : 'golf',
        companions: companions >= 0 && companions <= 3 ? companions : 0,
        level: clip(d.level, 200),
        notes: clip(d.notes, 4000),
        status: list.statuses.includes(d.status) ? d.status : 'confirme',
        profile: PROFILES.includes(d.profile) ? d.profile : 'rugbyman',
        source: 'manuel',
        invited_by: me,
        lang: 'fr',
      }
      if (!row.first_name || !row.last_name) return res.status(400).json({ error: 'invalid' })
      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) return res.status(400).json({ error: 'email' })
      return res.status(201).json({ item: await list.insert(row) })
    }

    if (req.method === 'PATCH') {
      const { id, status, notes, claim, profile, team } = req.body || {}
      if (!isUuid(id)) return res.status(400).json({ error: 'id' })
      const patch = {}
      if (status !== undefined) {
        if (!list.statuses.includes(status)) return res.status(400).json({ error: 'status' })
        patch.status = status
      }
      if (notes !== undefined) patch.notes = String(notes).slice(0, 4000)
      if (guests && claim !== undefined) patch.invited_by = claim ? me : null
      if (guests && profile !== undefined) {
        if (profile !== null && !PROFILES.includes(profile)) return res.status(400).json({ error: 'profile' })
        patch.profile = profile
      }
      if (guests && team !== undefined) {
        if (team !== null && !sponsorBySlug(team)) return res.status(400).json({ error: 'team' })
        if (team) {
          // Partie d'un sponsor : 3 invités (+ représentant) ou 4 invités s'il n'a pas de représentant
          const taken = await list.query(`?select=id&team=eq.${encodeURIComponent(team)}&status=neq.annule&id=neq.${id}`)
          if (taken.length >= teamCapacity(await sponsorStatus.get(team))) return res.status(409).json({ error: 'team-full' })
        }
        patch.team = team
      }
      if (!Object.keys(patch).length) return res.status(400).json({ error: 'empty' })

      const c = await check(id)
      if (!c.ok) return res.status(c.code).json({ error: c.error })
      // Placement dans une partie : seulement par l'organisateur qui a revendiqué l'invité (« C'est moi »)
      if (team !== undefined && !(c.row?.invited_by && sameName(c.row.invited_by, me))) return res.status(403).json({ error: 'claim-first' })
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
