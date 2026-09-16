import { SPONSORS } from '../content.js'
import { useT } from '../i18n.jsx'

function Sponsor({ s }) {
  const content = s.logo
    ? <img src={s.logo} alt={s.name} loading="lazy" />
    : <span>{s.name}</span>
  return s.url
    ? <a className={`sponsor${s.dark ? ' is-dark' : ''}`} href={s.url} target="_blank" rel="noopener" title={s.name}>{content}</a>
    : <div className={`sponsor${s.dark ? ' is-dark' : ''}`}>{content}</div>
}

export default function SponsorsCarousel() {
  const t = useT()
  if (!SPONSORS.length) return null
  // Liste dupliquée pour un défilement continu sans saut
  const loop = [...SPONSORS, ...SPONSORS]
  return (
    <div className="sponsors reveal" aria-label={t.sponsors.aria}>
      <p className="kicker sponsors-title">{t.sponsors.title}</p>
      <div className="sponsors-viewport">
        <div className="sponsors-track" style={{ '--count': SPONSORS.length }}>
          {loop.map((s, i) => (
            <div key={i} className="sponsors-item" aria-hidden={i >= SPONSORS.length || undefined}>
              <Sponsor s={s} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
