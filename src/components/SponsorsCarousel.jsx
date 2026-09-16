import { SPONSORS } from '../content.js'

function Sponsor({ s }) {
  const content = s.logo
    ? <img src={s.logo} alt={s.name} loading="lazy" />
    : <span>{s.name}</span>
  return s.url
    ? <a className={`sponsor${s.dark ? ' is-dark' : ''}`} href={s.url} target="_blank" rel="noopener" title={s.name}>{content}</a>
    : <div className={`sponsor${s.dark ? ' is-dark' : ''}`}>{content}</div>
}

export default function SponsorsCarousel() {
  if (!SPONSORS.length) return null
  // Liste dupliquée pour un défilement continu sans saut
  const loop = [...SPONSORS, ...SPONSORS]
  return (
    <div className="sponsors reveal" aria-label="Nos partenaires">
      <p className="kicker sponsors-title">Les sponsors qui soutiennent activement Masters XV</p>
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
