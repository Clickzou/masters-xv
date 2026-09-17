// Formulaire des invités (gratuit) : enregistrement Supabase « invites » + e-mails Resend
import { dbConfigured, LISTS } from './_lib/db.js'
import { sponsorBySlug, sponsorSlug } from '../src/content.js'
import { mailConfigured, organisers, sendMail, guestOrganiserEmail, guestEmail } from './_lib/mail.js'

const clip = (v, max) => {
  const s = String(v ?? '').trim()
  return s ? s.slice(0, max) : null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' })

  const d = req.body || {}
  if (d.website) return res.status(200).json({ ok: true }) // robot : ignoré sans le signaler

  const companions = Number.parseInt(d.companions, 10)
  const row = {
    first_name: clip(d.firstName, 120),
    last_name: clip(d.lastName, 120),
    company: clip(d.company, 200),
    email: clip(d.email, 254),
    phone: clip(d.phone, 40),
    participation: ['golf', 'dejeuner'].includes(d.participation) ? d.participation : null,
    companions: companions >= 0 && companions <= 3 ? companions : 0,
    level: clip(d.level, 200),
    diet: clip(d.diet, 300),
    message: clip(d.message, 4000),
    lang: d.lang === 'en' ? 'en' : 'fr',
    sponsor: sponsorBySlug(d.sponsor) ? sponsorSlug(sponsorBySlug(d.sponsor)) : null, // carte /invite/<sponsor>
  }
  const required = ['first_name', 'last_name', 'phone', 'participation']
  if (required.some(k => !row[k]) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email || '')) {
    return res.status(400).json({ error: 'invalid' })
  }

  if (!dbConfigured() && !mailConfigured()) return res.status(503).json({ error: 'not-configured' })

  // 1. Enregistrement
  let stored = false
  if (dbConfigured()) {
    try {
      await LISTS.invites.insert(row)
      stored = true
    } catch (err) {
      console.error('[invite] enregistrement impossible', err.message)
    }
  }

  // 2. E-mails (en parallèle, l'échec d'un e-mail ne bloque pas l'autre)
  let alerted = false
  if (mailConfigured()) {
    const host = req.headers['x-forwarded-host'] || req.headers.host
    const adminUrl = host ? `https://${host}/admin` : undefined
    const jobs = []
    if (organisers().length) {
      const m = guestOrganiserEmail(row, { adminUrl })
      jobs.push(sendMail({ to: organisers(), replyTo: row.email, ...m }).then(() => { alerted = true }))
    }
    const c = guestEmail(row)
    jobs.push(sendMail({ to: [row.email], replyTo: organisers()[0], ...c }))
    const results = await Promise.allSettled(jobs)
    results.filter(r => r.status === 'rejected').forEach(r => console.error('[invite] e-mail', r.reason?.message))
  }

  if (!stored && !alerted) return res.status(502).json({ error: 'failed' })
  return res.status(200).json({ ok: true })
}
