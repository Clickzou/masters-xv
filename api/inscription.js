// Formulaire d'inscription : enregistrement Supabase + e-mails Resend (alerte organisateurs, confirmation participant)
import { dbConfigured, insertInscription } from './_lib/db.js'
import { mailConfigured, organisers, sendMail, organiserEmail, participantEmail } from './_lib/mail.js'

const clip = (v, max) => {
  const s = String(v ?? '').trim()
  return s ? s.slice(0, max) : null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' })

  const d = req.body || {}
  if (d.website) return res.status(200).json({ ok: true }) // robot : ignoré sans le signaler

  const row = {
    first_name: clip(d.firstName, 120),
    last_name: clip(d.lastName, 120),
    company: clip(d.company, 200),
    email: clip(d.email, 254),
    phone: clip(d.phone, 40),
    offer: ['sponsor', 'equipe'].includes(d.offer) ? d.offer : null,
    offer_label: clip(d.offerLabel, 120),
    teams: clip(d.teams, 20),
    level: clip(d.players, 200),
    message: clip(d.message, 4000),
    needs_receipt: Boolean(d.needsReceipt),
    lang: d.lang === 'en' ? 'en' : 'fr',
  }
  const required = ['first_name', 'last_name', 'company', 'phone', 'offer', 'teams', 'level', 'message']
  if (required.some(k => !row[k]) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email || '')) {
    return res.status(400).json({ error: 'invalid' })
  }

  if (!dbConfigured() && !mailConfigured()) return res.status(503).json({ error: 'not-configured' })

  // 1. Enregistrement
  let stored = false
  if (dbConfigured()) {
    try {
      await insertInscription(row)
      stored = true
    } catch (err) {
      console.error('[inscription] enregistrement impossible', err.message)
    }
  }

  // 2. E-mails (en parallèle, l'échec d'un e-mail ne bloque pas l'autre)
  let alerted = false
  if (mailConfigured()) {
    const host = req.headers['x-forwarded-host'] || req.headers.host
    const adminUrl = host ? `https://${host}/admin` : undefined
    const jobs = []
    if (organisers().length) {
      const m = organiserEmail(row, { adminUrl })
      jobs.push(sendMail({ to: organisers(), replyTo: row.email, ...m }).then(() => { alerted = true }))
    }
    const c = participantEmail(row)
    jobs.push(sendMail({ to: [row.email], replyTo: organisers()[0], ...c }))
    const results = await Promise.allSettled(jobs)
    results.filter(r => r.status === 'rejected').forEach(r => console.error('[inscription] e-mail', r.reason?.message))
  }

  // La demande est considérée reçue si elle est enregistrée ou si les organisateurs ont été prévenus
  if (!stored && !alerted) return res.status(502).json({ error: 'failed' })
  return res.status(200).json({ ok: true })
}
