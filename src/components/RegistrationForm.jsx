import { useEffect, useState } from 'react'
import { useT } from '../i18n.jsx'

const INITIAL = {
  firstName: '', lastName: '', company: '', email: '', phone: '',
  offer: 'sponsor', teams: '1', players: '', needsReceipt: false, message: '', website: '',
}

export default function RegistrationForm() {
  const t = useT()
  const f = t.form
  const [data, setData] = useState(INITIAL)
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  const offerLabel = id => {
    const o = t.offers.find(x => x.id === id)
    return o ? `${o.name} (${o.price})` : id
  }

  // Texte envoyé par e-mail si l'API n'est pas disponible
  const toMailBody = d => [
    `${f.lastName} : ${d.firstName} ${d.lastName}`,
    `${f.company} : ${d.company || '-'}`,
    `${f.email} : ${d.email}`,
    `${f.phone} : ${d.phone || '-'}`,
    `${f.offer} : ${offerLabel(d.offer)}`,
    `${f.teams} : ${d.teams}`,
    `${f.level} : ${d.players || '-'}`,
    `CERFA : ${d.needsReceipt ? 'oui / yes' : 'non / no'}`,
    '',
    d.message,
  ].join('\n')

  // Bouton « Choisir cette formule » de la section Partenaires
  useEffect(() => {
    const onChoose = e => setData(d => ({ ...d, offer: e.detail }))
    window.addEventListener('choose-offer', onChoose)
    return () => window.removeEventListener('choose-offer', onChoose)
  }, [])

  const set = key => e => setData(d => ({ ...d, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, offerLabel: offerLabel(data.offer), lang: t.lang }),
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
        <label>{f.firstName}<input required autoComplete="given-name" value={data.firstName} onChange={set('firstName')} /></label>
        <label>{f.lastName}<input required autoComplete="family-name" value={data.lastName} onChange={set('lastName')} /></label>
        <label>{f.company}<input required autoComplete="organization" value={data.company} onChange={set('company')} /></label>
        <label>{f.phone}<input required type="tel" autoComplete="tel" pattern="[0-9+().\s-]{6,}" value={data.phone} onChange={set('phone')} /></label>
        <label className="span-2">{f.email}<input required type="email" autoComplete="email" value={data.email} onChange={set('email')} /></label>
        <label className="span-2">{f.offer}
          <select required value={data.offer} onChange={set('offer')}>
            {t.offers.map(o => <option key={o.id} value={o.id}>{o.name} — {o.price}</option>)}
          </select>
        </label>
        <label>{f.teams}
          <select required value={data.teams} onChange={set('teams')}>
            {f.teamsOptions.map(v => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label>{f.level}<input required placeholder={f.levelPlaceholder} value={data.players} onChange={set('players')} /></label>
        <label className="span-2">{f.message}<textarea required rows="4" placeholder={f.messagePlaceholder} value={data.message} onChange={set('message')} /></label>
        <label className="check span-2">
          <input type="checkbox" checked={data.needsReceipt} onChange={set('needsReceipt')} />
          <span>{f.receipt}</span>
        </label>
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
