import { useT } from '../i18n.jsx'

const APP_STORE = 'https://apps.apple.com/app/id6788523821'
const GOOGLE_PLAY = 'https://play.google.com/store/apps/details?id=com.plyz.app'

const TEXT = {
  fr: {
    kicker: 'Partenaire digital',
    title: 'Vos légendes. En vrai. Rien que pour vous.',
    lead: 'Célébrités du rugby, fans et passionnés se retrouvent au Masters XV. Prolongez la rencontre avec Plyz, l’application qui rapproche les stars de leur public.',
    features: [
      ['Dédicaces en direct', 'Recevez une photo signée et dédicacée en direct par votre célébrité.'],
      ['Face-à-face vidéo', 'Un échange privé 1-à-1 en visio avec votre star.'],
      ['Galerie collector', 'Gardez toutes vos dédicaces dans une collection exclusive.'],
    ],
    appStore: ['Télécharger dans', 'l’App Store'],
    googlePlay: ['Disponible sur', 'Google Play'],
    site: 'Découvrir Plyz',
  },
  en: {
    kicker: 'Digital partner',
    title: 'Your legends. For real. Just for you.',
    lead: 'Rugby celebrities, fans and enthusiasts come together at Masters XV. Keep the connection going with Plyz, the app that brings stars closer to their audience.',
    features: [
      ['Live autographs', 'Get a photo signed and dedicated live by your celebrity.'],
      ['Video face-to-face', 'A private 1-to-1 video call with your star.'],
      ['Collector gallery', 'Keep all your autographs in an exclusive collection.'],
    ],
    appStore: ['Download on the', 'App Store'],
    googlePlay: ['Get it on', 'Google Play'],
    site: 'Discover Plyz',
  },
}

export default function PlyzPromo() {
  const t = TEXT[useT().lang]
  return (
    <section className="plyz" aria-labelledby="plyz-title">
      <div className="plyz-glow" aria-hidden="true" />
      <div className="container plyz-inner">
        <div className="plyz-brand reveal" data-reveal="left">
          <a href="https://plyz.io/" target="_blank" rel="noopener" className="plyz-logo">
            <img src="/sponsors/plyz.png" alt="Plyz" width="600" height="214" loading="lazy" />
          </a>
          <ul className="plyz-features">
            {t.features.map(([h, p]) => (
              <li key={h}><strong>{h}</strong><span>{p}</span></li>
            ))}
          </ul>
        </div>
        <div className="plyz-text reveal" data-reveal="right" style={{ '--d': '120ms' }}>
          <p className="kicker">{t.kicker}</p>
          <h2 id="plyz-title">{t.title}</h2>
          <p className="plyz-lead">{t.lead}</p>
          <div className="plyz-stores">
            <a className="store-btn" href={APP_STORE} target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.24 2.73 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.41 1.2-2.47-.03-.01-2.3-.88-2.32-3.52ZM14.2 6.13c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.3-.56.64-1.05 1.68-.92 2.67.97.08 1.96-.49 2.56-1.21Z" /></svg>
              <span><small>{t.appStore[0]}</small>{t.appStore[1]}</span>
            </a>
            <a className="store-btn" href={GOOGLE_PLAY} target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.6 2.3c-.25.26-.4.66-.4 1.18v17.04c0 .52.15.92.4 1.18l.06.05 9.54-9.54v-.22L3.66 2.25l-.06.05Zm12.77 12.9-3.17-3.18v-.22l3.17-3.18.07.04 3.76 2.14c1.07.61 1.07 1.61 0 2.22l-3.76 2.14-.07.04Zm.08-.05L13.2 11.9l-9.6 9.6c.36.38.94.42 1.6.05l11.25-6.4M16.45 8.65 5.2 2.26c-.66-.38-1.24-.33-1.6.05l9.6 9.59 3.25-3.25Z" /></svg>
              <span><small>{t.googlePlay[0]}</small>{t.googlePlay[1]}</span>
            </a>
          </div>
          <a className="plyz-site" href="https://plyz.io/" target="_blank" rel="noopener">{t.site} →</a>
        </div>
      </div>
    </section>
  )
}
