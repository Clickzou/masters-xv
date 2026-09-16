import { useEffect, useState } from 'react'
import { EVENT, OFFERS } from '../content.js'

const INITIAL = {
  firstName: '', lastName: '', company: '', email: '', phone: '',
  offer: OFFERS[0].id, teams: '1', players: '', needsReceipt: false, message: '', website: '',
}

const offerLabel = id => {
  const o = OFFERS.find(x => x.id === id)
  return o ? `${o.name} (${o.price})` : id
}

// Texte envoyé par e-mail si l'API n'est pas disponible
function toMailBody(d) {
  return [
    `Nom : ${d.firstName} ${d.lastName}`,
    `Société : ${d.company || '-'}`,
    `E-mail : ${d.email}`,
    `Téléphone : ${d.phone || '-'}`,
    `Formule : ${offerLabel(d.offer)}`,
    `Nombre d'équipes : ${d.teams}`,
    `Joueurs : ${d.players || '-'}`,
    `Reçu fiscal (CERFA) souhaité : ${d.needsReceipt ? 'oui' : 'non'}`,
    '',
    d.message,
  ].join('\n')
}

export default function RegistrationForm() {
  const [data, setData] = useState(INITIAL)
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

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
        body: JSON.stringify({ ...data, offerLabel: offerLabel(data.offer) }),
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
        <p className="kicker">Merci</p>
        <h3>Votre demande est bien arrivée</h3>
        <p>L’équipe Masters XV revient vers vous très rapidement pour finaliser votre inscription.</p>
      </div>
    )
  }

  const mailto = EVENT.contactEmail
    ? `mailto:${EVENT.contactEmail}?subject=${encodeURIComponent('Inscription Masters XV')}&body=${encodeURIComponent(toMailBody(data))}`
    : null

  return (
    <form className="form reveal" onSubmit={onSubmit}>
      <div className="form-grid">
        <label>Prénom<input required autoComplete="given-name" value={data.firstName} onChange={set('firstName')} /></label>
        <label>Nom<input required autoComplete="family-name" value={data.lastName} onChange={set('lastName')} /></label>
        <label>Société<input autoComplete="organization" value={data.company} onChange={set('company')} /></label>
        <label>Téléphone<input type="tel" autoComplete="tel" value={data.phone} onChange={set('phone')} /></label>
        <label className="span-2">E-mail<input required type="email" autoComplete="email" value={data.email} onChange={set('email')} /></label>
        <label className="span-2">Formule
          <select value={data.offer} onChange={set('offer')}>
            {OFFERS.map(o => <option key={o.id} value={o.id}>{o.name} — {o.price}</option>)}
          </select>
        </label>
        <label>Nombre d’équipes
          <select value={data.teams} onChange={set('teams')}>
            {['1', '2', '3', '4 ou plus'].map(v => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label>Index / niveau (facultatif)<input placeholder="ex. débutants, index 18…" value={data.players} onChange={set('players')} /></label>
        <label className="span-2">Message<textarea rows="4" placeholder="Noms des joueurs, invités, questions…" value={data.message} onChange={set('message')} /></label>
        <label className="check span-2">
          <input type="checkbox" checked={data.needsReceipt} onChange={set('needsReceipt')} />
          <span>Je souhaite recevoir un reçu fiscal (CERFA)</span>
        </label>
        {/* Piège anti-robots : champ invisible */}
        <label className="hp" aria-hidden="true">Site web<input tabIndex="-1" autoComplete="off" value={data.website} onChange={set('website')} /></label>
      </div>

      {status === 'error' && (
        <p className="form-error" role="alert">
          L’envoi n’a pas abouti.{' '}
          {mailto ? <>Vous pouvez <a href={mailto}>nous écrire directement par e-mail</a>.</> : 'Merci de réessayer dans un instant.'}
        </p>
      )}

      <button className="btn btn-gold btn-block" disabled={status === 'sending'}>
        {status === 'sending' ? 'Envoi en cours…' : 'Envoyer ma demande'}
      </button>
    </form>
  )
}
