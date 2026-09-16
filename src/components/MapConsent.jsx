import { useEffect, useState } from 'react'
import { store, useT } from '../i18n.jsx'

export const MAP_KEY = 'mxv-maps-consent'

// Carte Google Maps chargée uniquement après accord (aucun cookie tiers avant le clic)
export default function MapConsent() {
  const t = useT()
  const [allowed, setAllowed] = useState(() => store.get(MAP_KEY) === 'yes')
  const [remember, setRemember] = useState(false)

  useEffect(() => {
    const onReset = () => setAllowed(false)
    window.addEventListener('mxv-cookies-reset', onReset)
    return () => window.removeEventListener('mxv-cookies-reset', onReset)
  }, [])

  const show = () => {
    if (remember) store.set(MAP_KEY, 'yes')
    setAllowed(true)
  }

  return (
    <section className="map-band" aria-label={t.lieu.mapTitle}>
      {allowed ? (
        <iframe title={`${t.lieu.mapTitle} – ${t.event.venue}`} src={t.event.mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      ) : (
        <div className="map-consent">
          <svg className="map-consent-pin" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
          </svg>
          <p className="map-consent-venue">{t.event.venue}</p>
          <p className="map-consent-text">
            {t.map.text} <a href="/politique-cookies">{t.map.policy}</a>
          </p>
          <button className="btn btn-gold" onClick={show}>{t.map.button}</button>
          <label className="map-consent-remember">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            <span>{t.map.remember}</span>
          </label>
        </div>
      )}
    </section>
  )
}
