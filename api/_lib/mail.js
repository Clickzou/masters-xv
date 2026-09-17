// Envoi des e-mails via Resend (https://resend.com)
// Variables : RESEND_API_KEY, INSCRIPTION_FROM (expéditeur vérifié), INSCRIPTION_TO (organisateurs, séparés par des virgules)

const GREEN = '#0A3A20'
const GOLD = '#D9A83E'
const IVORY = '#F7F2E6'

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export const mailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.INSCRIPTION_FROM)
export const organisers = () => (process.env.INSCRIPTION_TO || '').split(',').map(s => s.trim()).filter(Boolean)

export async function sendMail({ to, subject, html, text, replyTo }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.INSCRIPTION_FROM, to, subject, html, text, reply_to: replyTo }),
  })
  if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`)
  return res.json()
}

// Gabarit commun : bandeau vert, filet or, contenu sur fond ivoire (tables + styles en ligne pour les messageries)
function layout({ preheader, title, body, siteUrl }) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:${IVORY};">
<span style="display:none;max-height:0;overflow:hidden;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${IVORY};padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e6dcc3;">
<tr><td style="background:${GREEN};padding:30px 32px;text-align:center;border-bottom:3px solid ${GOLD};">
${siteUrl ? `<img src="${siteUrl}/og-image.png" width="0" height="0" alt="" style="display:none">` : ''}
<div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;letter-spacing:4px;color:#ffffff;">MASTERS <span style="color:${GOLD};">XV</span></div>
<div style="font-family:Georgia,serif;font-style:italic;font-size:16px;color:${GOLD};margin-top:6px;">${esc(title)}</div>
</td></tr>
<tr><td style="padding:30px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1C2A22;">
${body}
</td></tr>
<tr><td style="background:${GREEN};padding:18px 32px;text-align:center;font-family:Arial,sans-serif;font-size:12px;color:#cfd8cf;">
Masters XV · Golf de Palmola · 14/10/2026<br>CTA Events · Midi Olympique
</td></tr>
</table>
</td></tr></table></body></html>`
}

const rowsTable = rows => `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:14px 0;">
${rows.map(([k, v]) => `<tr><td style="padding:8px 10px 8px 0;border-bottom:1px solid #eee4cc;color:#5B6A60;font-size:13px;white-space:nowrap;vertical-align:top;">${esc(k)}</td><td style="padding:8px 0;border-bottom:1px solid #eee4cc;">${esc(v || '—').replace(/\n/g, '<br>')}</td></tr>`).join('')}
</table>`

// ——— Alerte aux organisateurs
export function organiserEmail(d, { adminUrl } = {}) {
  const rows = [
    ['Nom', `${d.first_name} ${d.last_name}`],
    ['Société', d.company],
    ['E-mail', d.email],
    ['Téléphone', d.phone],
    ['Formule', d.offer_label || d.offer],
    ['Équipes', d.teams],
    ['Niveau', d.level],
    ['Reçu fiscal (CERFA)', d.needs_receipt ? 'Oui' : 'Non'],
    ['Langue', d.lang === 'en' ? 'Anglais' : 'Français'],
    ['Message', d.message],
  ]
  const body = `<p style="margin:0 0 6px;font-size:17px;"><strong>Nouvelle demande d’inscription</strong></p>
<p style="margin:0;color:#5B6A60;">Répondez directement à cet e-mail pour écrire au demandeur.</p>
${rowsTable(rows)}
${adminUrl ? `<p style="text-align:center;margin:24px 0 4px;"><a href="${adminUrl}" style="display:inline-block;background:${GOLD};color:${GREEN};text-decoration:none;font-weight:bold;letter-spacing:2px;font-size:12px;padding:13px 26px;">OUVRIR LE TABLEAU DE BORD</a></p>` : ''}`
  return {
    subject: `Inscription Masters XV – ${d.first_name} ${d.last_name}${d.company ? ` (${d.company})` : ''} – ${d.offer_label || d.offer}`,
    html: layout({ preheader: `${d.first_name} ${d.last_name} – ${d.offer_label || d.offer}`, title: 'Nouvelle demande', body }),
    text: rows.map(([k, v]) => `${k} : ${v || '-'}`).join('\n'),
  }
}

// ——— Confirmation au participant (FR / EN)
const CONFIRM = {
  fr: {
    subject: 'Masters XV – Nous avons bien reçu votre demande',
    title: 'Le tournoi des légendes',
    hello: n => `Bonjour ${n},`,
    intro: 'Merci pour votre intérêt pour le <strong>Masters XV</strong>. Nous avons bien reçu votre demande et l’équipe organisatrice revient vers vous très rapidement pour finaliser votre inscription.',
    recap: 'Récapitulatif de votre demande',
    labels: ['Formule', 'Société', 'Équipes', 'Reçu fiscal (CERFA)'],
    yes: 'Oui', no: 'Non',
    when: 'Le rendez-vous',
    event: 'Mercredi 14 octobre 2026 · Golf de Palmola, Route d’Albi, 31660 Buzet-sur-Tarn',
    programme: ['8h00 · Accueil & petit-déjeuner à l’anglaise (œufs brouillés, bacon, saucisses, haricots)', '8h30 · Départ en shamble à 4, concours de drive & de précision', 'Buffet gourmand sur le parcours', '14h00 · Déjeuner & remise des prix'],
    outro: 'Une question ? Répondez simplement à cet e-mail.',
    sign: 'À très bientôt sur le green,<br>L’équipe Masters XV',
  },
  en: {
    subject: 'Masters XV – We have received your request',
    title: 'The Legends’ Tournament',
    hello: n => `Hello ${n},`,
    intro: 'Thank you for your interest in <strong>Masters XV</strong>. We have received your request and the organising team will get back to you shortly to finalise your registration.',
    recap: 'Summary of your request',
    labels: ['Package', 'Company', 'Teams', 'Tax receipt (CERFA)'],
    yes: 'Yes', no: 'No',
    when: 'The event',
    event: 'Wednesday 14 October 2026 · Golf de Palmola, Route d’Albi, 31660 Buzet-sur-Tarn, France',
    programme: ['8:00 am · Welcome & full English breakfast (scrambled eggs, bacon, sausages, beans)', '8:30 am · 4-player shamble tee-off, longest drive & nearest-the-pin', 'Gourmet buffet on the course', '2:00 pm · Lunch & prize-giving'],
    outro: 'Any questions? Simply reply to this email.',
    sign: 'See you soon on the green,<br>The Masters XV team',
  },
}

export function participantEmail(d) {
  const t = CONFIRM[d.lang === 'en' ? 'en' : 'fr']
  const body = `<p style="margin:0 0 14px;">${esc(t.hello(d.first_name))}</p>
<p style="margin:0 0 20px;">${t.intro}</p>
<p style="margin:0;font-family:Georgia,serif;font-size:18px;color:${GREEN};">${t.recap}</p>
${rowsTable([
    [t.labels[0], d.offer_label || d.offer],
    [t.labels[1], d.company],
    [t.labels[2], d.teams],
    [t.labels[3], d.needs_receipt ? t.yes : t.no],
  ])}
<p style="margin:22px 0 6px;font-family:Georgia,serif;font-size:18px;color:${GREEN};">${t.when}</p>
<p style="margin:0 0 8px;">${esc(t.event)}</p>
<ul style="margin:0 0 20px;padding-left:18px;color:#1C2A22;">${t.programme.map(p => `<li style="margin:3px 0;">${esc(p)}</li>`).join('')}</ul>
<p style="margin:0 0 16px;">${t.outro}</p>
<p style="margin:0;font-family:Georgia,serif;font-style:italic;color:${GREEN};">${t.sign}</p>`
  return {
    subject: t.subject,
    html: layout({ preheader: t.subject, title: t.title, body }),
    text: `${t.hello(d.first_name)}\n\n${t.intro.replace(/<[^>]+>/g, '')}\n\n${t.event}\n${t.programme.join('\n')}\n\n${t.outro}`,
  }
}

// ——— Invités (gratuit)
const PARTICIPATION = {
  fr: { golf: 'Tournoi de golf, déjeuner & remise des prix', dejeuner: 'Déjeuner & remise des prix uniquement' },
  en: { golf: 'Golf tournament, lunch & prize-giving', dejeuner: 'Lunch & prize-giving only' },
}

export function guestOrganiserEmail(d, { adminUrl } = {}) {
  const participation = PARTICIPATION.fr[d.participation] || d.participation
  const rows = [
    ['Nom', `${d.first_name} ${d.last_name}`],
    ['Société', d.company],
    ['E-mail', d.email],
    ['Téléphone', d.phone],
    ['Participation', participation],
    ['Accompagnants', String(d.companions ?? 0)],
    ['Index / niveau', d.level],
    ['Régime / allergies', d.diet],
    ['Langue', d.lang === 'en' ? 'Anglais' : 'Français'],
    ['Message', d.message],
  ]
  const body = `<p style="margin:0 0 6px;font-size:17px;"><strong>Nouvelle réponse d’un invité</strong></p>
<p style="margin:0;color:#5B6A60;">Répondez directement à cet e-mail pour écrire à l’invité.</p>
${rowsTable(rows)}
${adminUrl ? `<p style="text-align:center;margin:24px 0 4px;"><a href="${adminUrl}" style="display:inline-block;background:${GOLD};color:${GREEN};text-decoration:none;font-weight:bold;letter-spacing:2px;font-size:12px;padding:13px 26px;">OUVRIR LE TABLEAU DE BORD</a></p>` : ''}`
  return {
    subject: `Invité Masters XV – ${d.first_name} ${d.last_name}${d.company ? ` (${d.company})` : ''} – ${participation}`,
    html: layout({ preheader: `${d.first_name} ${d.last_name} – ${participation}`, title: 'Réponse d’un invité', body }),
    text: rows.map(([k, v]) => `${k} : ${v || '-'}`).join('\n'),
  }
}

const GUEST = {
  fr: {
    subject: 'Masters XV – Merci pour votre réponse',
    intro: 'Merci d’avoir répondu à notre invitation au <strong>Masters XV</strong>. Nous avons bien noté votre présence et l’équipe organisatrice vous enverra prochainement les informations pratiques.',
    recap: 'Votre réponse',
    labels: ['Participation', 'Accompagnants', 'Régime / allergies'],
  },
  en: {
    subject: 'Masters XV – Thank you for your reply',
    intro: 'Thank you for replying to our invitation to <strong>Masters XV</strong>. We have noted your attendance and the organising team will send you the practical details shortly.',
    recap: 'Your reply',
    labels: ['Attendance', 'Accompanying guests', 'Dietary requirements'],
  },
}

export function guestEmail(d) {
  const lang = d.lang === 'en' ? 'en' : 'fr'
  const t = { ...CONFIRM[lang], ...GUEST[lang] }
  const body = `<p style="margin:0 0 14px;">${esc(t.hello(d.first_name))}</p>
<p style="margin:0 0 20px;">${t.intro}</p>
<p style="margin:0;font-family:Georgia,serif;font-size:18px;color:${GREEN};">${t.recap}</p>
${rowsTable([
    [t.labels[0], PARTICIPATION[lang][d.participation]],
    [t.labels[1], String(d.companions ?? 0)],
    [t.labels[2], d.diet],
  ])}
<p style="margin:22px 0 6px;font-family:Georgia,serif;font-size:18px;color:${GREEN};">${t.when}</p>
<p style="margin:0 0 8px;">${esc(t.event)}</p>
<ul style="margin:0 0 20px;padding-left:18px;color:#1C2A22;">${t.programme.map(p => `<li style="margin:3px 0;">${esc(p)}</li>`).join('')}</ul>
<p style="margin:0 0 16px;">${t.outro}</p>
<p style="margin:0;font-family:Georgia,serif;font-style:italic;color:${GREEN};">${t.sign}</p>`
  return {
    subject: t.subject,
    html: layout({ preheader: t.subject, title: t.title, body }),
    text: `${t.hello(d.first_name)}\n\n${t.intro.replace(/<[^>]+>/g, '')}\n\n${t.event}\n${t.programme.join('\n')}\n\n${t.outro}`,
  }
}
