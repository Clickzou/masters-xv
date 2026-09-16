// Fonction Vercel : reçoit le formulaire et l'envoie par e-mail via Resend (https://resend.com).
// Variables d'environnement à définir dans Vercel :
//   RESEND_API_KEY   clé API Resend
//   INSCRIPTION_TO   adresse(s) des organisateurs, séparées par des virgules
//   INSCRIPTION_FROM expéditeur vérifié dans Resend, ex. "Masters XV <inscriptions@votre-domaine.fr>"

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' })

  const d = req.body || {}
  if (d.website) return res.status(200).json({ ok: true }) // robot : ignoré sans le signaler
  if (!d.firstName || !d.lastName || !/^\S+@\S+\.\S+$/.test(d.email || '')) {
    return res.status(400).json({ error: 'invalid' })
  }

  const { RESEND_API_KEY, INSCRIPTION_TO, INSCRIPTION_FROM } = process.env
  if (!RESEND_API_KEY || !INSCRIPTION_TO || !INSCRIPTION_FROM) {
    return res.status(503).json({ error: 'not-configured' })
  }

  const rows = [
    ['Nom', `${d.firstName} ${d.lastName}`],
    ['Société', d.company],
    ['E-mail', d.email],
    ['Téléphone', d.phone],
    ["Nombre d'équipes", d.teams],
    ['Index / niveau', d.players],
    ['Reçu fiscal (CERFA)', d.needsReceipt ? 'Oui' : 'Non'],
    ['Message', d.message],
  ]
  const html = `<h2 style="font-family:Georgia,serif;color:#0A3A20">Nouvelle demande d'inscription – Masters XV</h2>
<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
${rows.map(([k, v]) => `<tr><td style="color:#666;vertical-align:top">${k}</td><td>${esc(v || '-').replace(/\n/g, '<br>')}</td></tr>`).join('\n')}
</table>`

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: INSCRIPTION_FROM,
      to: INSCRIPTION_TO.split(',').map(s => s.trim()),
      reply_to: d.email,
      subject: `Inscription Masters XV – ${d.firstName} ${d.lastName}${d.company ? ` (${d.company})` : ''}`,
      html,
    }),
  })

  if (!r.ok) return res.status(502).json({ error: 'send-failed' })
  return res.status(200).json({ ok: true })
}
