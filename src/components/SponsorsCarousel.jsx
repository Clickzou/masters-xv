import { SPONSORS } from '../content.js'

function Sponsor({ s }) {
  if (s.placeholder) {
    return <a className="sponsor is-placeholder" href="#partenaires">Votre logo ici</a>
  }
  const content = s.logo
    ? <img src={s.logo} alt={s.name} loading="lazy" />
    : <span>{s.name}</span>
  return s.url
    ? <a className="sponsor" href={s.url} target="_blank" rel="noreferrer">{content}</a>
    : <div className="sponsor">{content}</div>
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
