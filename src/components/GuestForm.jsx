import { useState } from 'react'
import { useT } from '../i18n.jsx'

// Formulaire de réponse des invités (gratuit) — page /invite
const INITIAL = {
  firstName: '', lastName: '', company: '', email: '', phone: '',
  participation: 'golf', companions: '0', level: '', diet: '', message: '', website: '',
}

export default function GuestForm() {
  const t = useT()
  const f = { ...t.form, ...t.guest.form }
  const [data, setData] = useState(INITIAL)
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  const opt = label => <span>{label} <small>({f.optional})</small></span>
  const req = label => <span>{label} *</span>

  // Texte envoyé par e-mail si l'API n'est pas disponible
  const toMailBody = d => [
    `${f.lastName} : ${d.firstName} ${d.lastName}`,
    `${f.company} : ${d.company || '-'}`,
    `${f.email} : ${d.email}`,
    `${f.phone} : ${d.phone || '-'}`,
    `${f.participation} : ${f.participationOptions[d.participation]}`,
    `${f.companions} : ${d.companions}`,
    `${f.level} : ${d.level || '-'}`,
    `${f.diet} : ${d.diet || '-'}`,
    '',
    d.message,
  ].join('\n')

  const set = key => e => setData(d => ({ ...d, [key]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, lang: t.lang }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent')
      setData(INITIAL)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="form-done reveal is-visible" role="status">
        <p className="kicker">{f.doneKicker}</p>
        <h3>{f.doneTitle}</h3>
        <p>{f.doneText}</p>
      </div>
    )
  }

  const mailto = t.event.contactEmail
    ? `mailto:${t.event.contactEmail}?subject=${encodeURIComponent(f.mailSubject)}&body=${encodeURIComponent(toMailBody(data))}`
    : null

  return (
    <form className="form reveal" onSubmit={onSubmit}>
      <p className="form-required">{f.requiredNote}</p>
      <div className="form-grid">
        <label>{req(f.firstName)}<input required autoComplete="given-name" value={data.firstName} onChange={set('firstName')} /></label>
        <label>{req(f.lastName)}<input required autoComplete="family-name" value={data.lastName} onChange={set('lastName')} /></label>
        <label>{req(f.email)}<input required type="email" autoComplete="email" value={data.email} onChange={set('email')} /></label>
        <label>{req(f.phone)}<input required type="tel" autoComplete="tel" pattern="[0-9+().\s-]{6,}" value={data.phone} onChange={set('phone')} /></label>
        <label className="span-2">{opt(f.company)}<input autoComplete="organization" value={data.company} onChange={set('company')} /></label>
        <label className="span-2">{req(f.participation)}
          <select required value={data.participation} onChange={set('participation')}>
            {Object.entries(f.participationOptions).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label>{req(f.companions)}
          <select required value={data.companions} onChange={set('companions')}>
            {f.companionsOptions.map(v => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label>{opt(f.level)}<input placeholder={f.levelPlaceholder} value={data.level} onChange={set('level')} /></label>
        <label className="span-2">{opt(f.diet)}<input placeholder={f.dietPlaceholder} value={data.diet} onChange={set('diet')} /></label>
        <label className="span-2">{opt(f.message)}<textarea rows="3" placeholder={f.messagePlaceholder} value={data.message} onChange={set('message')} /></label>
        {/* Piège anti-robots : champ invisible */}
        <label className="hp" aria-hidden="true">Website<input tabIndex="-1" autoComplete="off" value={data.website} onChange={set('website')} /></label>
      </div>

      {status === 'error' && (
        <p className="form-error" role="alert">
          {f.error}{' '}
          {mailto ? <><a href={mailto}>{f.errorMail}</a>.</> : f.retry}
        </p>
      )}

      <button className="btn btn-gold btn-block" disabled={status === 'sending'}>
        {status === 'sending' ? f.sending : f.send}
      </button>
      <p className="form-privacy">{f.privacy[0]} <a href="/politique-de-confidentialite">{f.privacy[1]}</a>.</p>
    </form>
  )
}
