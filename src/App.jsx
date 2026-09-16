import { useEffect, useState } from 'react'
import { EVENT, PROGRAMME, PILLARS, FORMAT_STEPS } from './content.js'
import Countdown from './components/Countdown.jsx'
import Fairways from './components/Fairways.jsx'
import RegistrationForm from './components/RegistrationForm.jsx'
import SponsorsCarousel from './components/SponsorsCarousel.jsx'

const NAV = [
  ['esprit', 'L’esprit'],
  ['programme', 'Programme'],
  ['formule', 'La formule'],
  ['lieu', 'Le lieu'],
  ['partenaires', 'Partenaires'],
]

function Ornament() {
  return (
    <div className="ornament" aria-hidden="true">
      <span /><i>✦</i><span />
    </div>
  )
}

function SectionTitle({ kicker, title, light }) {
  return (
    <header className={`section-title reveal${light ? ' is-light' : ''}`} data-reveal="title">
      <p className="kicker">{kicker}</p>
      <h2>{title}</h2>
      <Ornament />
    </header>
  )
}

export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Apparition douce des blocs au défilement
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-line')
    const io = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && (e.target.classList.add('is-visible'), io.unobserve(e.target))),
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <nav className={`nav${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-open' : ''}`}>
        <a href="#top" className="nav-brand" onClick={() => setMenuOpen(false)}>
          <img src="/logo/masters-xv-logo-couleur.svg" alt="" width="30" height="41" />
          <span>Masters XV</span>
        </a>
        <button className="nav-toggle" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>
          <span /><span />
        </button>
        <ul>
          {NAV.map(([id, label]) => (
            <li key={id}><a href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a></li>
          ))}
          <li><a href="#inscription" className="nav-cta" onClick={() => setMenuOpen(false)}>Inscription</a></li>
        </ul>
      </nav>

      <main id="top">
        {/* ——— Accueil ——— */}
        <section className="hero">
          <div className="hero-frame" aria-hidden="true" />
          <div className="hero-inner">
            <img className="hero-logo" src="/logo/masters-xv-logo-couleur.svg" alt="Masters XV – Midi Olympique Golf Tournament" width="880" height="1190" />
            <div className="hero-text">
              <p className="kicker">Midi Olympique présente</p>
              <h1>Le tournoi<br /><em>des légendes</em></h1>
              <p className="hero-org">— organisé par <strong>CTA Events</strong></p>
              <div className="hero-meta">
                <span>{EVENT.dateLabel}</span>
                <i aria-hidden="true">✦</i>
                <span>{EVENT.venue}</span>
              </div>
              <Countdown target={EVENT.startsAt} />
              <div className="hero-actions">
                <a className="btn btn-gold" href="#inscription">Inscrire une équipe</a>
                <a className="btn btn-ghost" href="#programme">Découvrir le programme</a>
              </div>
            </div>
          </div>
          <Fairways className="hero-fairways" base="var(--ivory)" />
        </section>

        {/* ——— L'esprit ——— */}
        <section className="sponsors-band paper">
          <SponsorsCarousel />
        </section>

        <section id="esprit" className="section esprit">
          <div className="esprit-bg" aria-hidden="true" />
          <div className="container">
            <SectionTitle kicker="L’esprit Masters XV" title="Quand l’Ovalie prend le green" light />
            <p className="lead is-light reveal">
              Ni tout à fait un tournoi de golf, ni tout à fait un rendez-vous rugby : Masters XV réunit
              les passionnés des deux univers autour de ce qu’ils partagent — l’esprit d’équipe, le respect
              et le goût de la fête.
            </p>
            <div className="pillars">
              {PILLARS.map((p, i) => (
                <article key={p.title} className="pillar reveal" style={{ '--d': `${i * 150}ms` }}>
                  <span className="pillar-num">{['I', 'II', 'III'][i]}</span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ——— Programme ——— */}
        <section id="programme" className="section green">
          <div className="container narrow">
            <SectionTitle kicker={EVENT.dateLabel} title="Le programme de la journée" light />
            <ol className="timeline reveal-line">
              {PROGRAMME.map((step, i) => (
                <li key={step.title} className="reveal" data-reveal="left" style={{ '--d': `${i * 110}ms` }}>
                  <span className="t-time">{step.time}</span>
                  <span className="t-dot" aria-hidden="true" />
                  <div className="t-body">
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ——— La formule ——— */}
        <section id="formule" className="section paper">
          <div className="container">
            <SectionTitle kicker="La formule" title={EVENT.format} />
            <p className="lead reveal">
              Composez votre équipe de quatre joueurs — partenaires, clients, amis — pour une formule qui marie
              l’esprit collectif du départ et le défi de chacun jusqu’au green.
            </p>
            <div className="steps">
              {FORMAT_STEPS.map((s, i) => (
                <div key={s.n} className="step reveal" style={{ '--d': `${i * 130}ms` }}>
                  <span className="step-n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
            <div className="contests reveal" data-reveal="zoom">
              <div><span className="kicker">Concours</span><strong>Drive</strong><p>Le plus long coup de la journée.</p></div>
              <div className="contests-sep" aria-hidden="true" />
              <div><span className="kicker">Concours</span><strong>Précision</strong><p>La balle la plus proche du drapeau.</p></div>
            </div>
          </div>
        </section>

        {/* ——— Le lieu ——— */}
        <section id="lieu" className="section green lieu">
          <div className="lieu-bg" aria-hidden="true" />
          <div className="container lieu-grid">
            <div className="lieu-text reveal" data-reveal="left">
              <p className="kicker">Le lieu</p>
              <h2>{EVENT.venue}</h2>
              <Ornament />
              <p>
                Un cadre verdoyant et un parcours de caractère, aux portes de la Ville rose, pour accueillir
                la première édition de Masters XV.
              </p>
              <p className="lieu-city">{EVENT.venueCity}</p>
              <a className="btn btn-gold" href={EVENT.mapsUrl} target="_blank" rel="noreferrer">Itinéraire</a>
            </div>
            <div className="lieu-map reveal" data-reveal="right" style={{ '--d': '150ms' }}>
              <iframe title={`Plan d’accès – ${EVENT.venue}`} src={EVENT.mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
        </section>

        {/* ——— Partenaires ——— */}
        <section id="partenaires" className="section paper">
          <div className="container">
            <SectionTitle kicker="Entreprises & partenaires" title="Associez votre marque aux légendes" />
            <div className="partner-grid">
              <article className="partner-card reveal" data-reveal="zoom">
                <h3>Engager une équipe</h3>
                <p>Invitez clients et collaborateurs à vivre une journée d’exception aux côtés des figures du rugby.</p>
                {EVENT.price && <p className="price">{EVENT.price}<small> par équipe</small></p>}
              </article>
              <article className="partner-card is-featured reveal" data-reveal="zoom" style={{ '--d': '120ms' }}>
                <h3>Devenir partenaire</h3>
                <p>Visibilité sur le parcours, lors de la remise des prix et dans les supports Midi Olympique.</p>
              </article>
              <article className="partner-card reveal" data-reveal="zoom" style={{ '--d': '240ms' }}>
                <h3>Avantage fiscal</h3>
                <p>Votre participation peut ouvrir droit à un reçu fiscal (CERFA). Les modalités vous sont précisées lors de l’inscription.</p>
              </article>
            </div>
            <div className="organisers reveal">
              <span>Une organisation</span>
              <strong>Midi Olympique</strong>
              <i aria-hidden="true">×</i>
              <strong>Golf de Palmola</strong>
            </div>
          </div>
        </section>

        {/* ——— Inscription ——— */}
        <section id="inscription" className="section green inscription">
          <div className="container narrow">
            <SectionTitle kicker="Inscription" title="Réservez votre équipe" light />
            <p className="lead is-light reveal">
              Les places sont limitées. Laissez-nous vos coordonnées : l’équipe organisatrice revient vers vous
              pour confirmer votre inscription{EVENT.registrationDeadline ? ` (avant le ${EVENT.registrationDeadline})` : ''}.
            </p>
            <RegistrationForm />
          </div>
          <Fairways className="footer-fairways" base="var(--green-deep)" />
        </section>
      </main>

      <footer className="footer">
        <img src="/logo/masters-xv-logo-1couleur-or.svg" alt="" width="70" height="95" />
        <p className="footer-title">Masters XV</p>
        <p>{EVENT.baseline}</p>
        <p>{EVENT.dateLabel} · {EVENT.venue}</p>
        {(EVENT.contactEmail || EVENT.contactPhone) && (
          <p className="footer-contact">
            {EVENT.contactEmail && <a href={`mailto:${EVENT.contactEmail}`}>{EVENT.contactEmail}</a>}
            {EVENT.contactEmail && EVENT.contactPhone && ' · '}
            {EVENT.contactPhone && <a href={`tel:${EVENT.contactPhone.replace(/\s/g, '')}`}>{EVENT.contactPhone}</a>}
          </p>
        )}
        <p className="footer-small">© {new Date().getFullYear()} Masters XV · Midi Olympique</p>
      </footer>
    </>
  )
}
