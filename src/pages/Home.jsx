import { useEffect } from 'react'
import { useT } from '../i18n.jsx'
import Countdown from '../components/Countdown.jsx'
import Fairways from '../components/Fairways.jsx'
import RegistrationForm from '../components/RegistrationForm.jsx'
import GuestForm from '../components/GuestForm.jsx'
import SponsorsCarousel from '../components/SponsorsCarousel.jsx'
import Gallery from '../components/Gallery.jsx'
import HeroBackdrop from '../components/HeroBackdrop.jsx'
import MapConsent from '../components/MapConsent.jsx'
import PlyzPromo from '../components/PlyzPromo.jsx'

export function Ornament() {
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

// guest : page des invités (/invite), identique mais sans les formules payantes
export default function Home({ guest = false }) {
  const t = useT()
  const { event } = t

  // Apparition douce des blocs au défilement (relancée au changement de langue)
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.is-visible), .reveal-line:not(.is-visible)')
    const io = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && (e.target.classList.add('is-visible'), io.unobserve(e.target))),
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [t.lang])

  return (
    <main id="top">
      {/* ——— Accueil ——— */}
      <section className="hero">
        <HeroBackdrop />
        <div className="hero-frame" aria-hidden="true" />
        <div className="hero-inner">
          <img className="hero-logo" src="/logo/masters-xv-logo-couleur.svg" alt={t.hero.logoAlt} width="880" height="1190" />
          <div className="hero-text">
            <p className="kicker">{guest ? t.guest.heroKicker : t.hero.kicker}</p>
            <h1>{t.hero.title1}<br /><em>{t.hero.title2}</em></h1>
            <p className="hero-org">{t.hero.organisedBy} <strong>CTA Events</strong></p>
            <div className="hero-meta">
              <span>{event.dateLabel}</span>
              <i aria-hidden="true">✦</i>
              <span>{event.venue}</span>
            </div>
            <Countdown target={event.startsAt} />
            <div className="hero-actions">
              <a className="btn btn-gold" href="#inscription">{guest ? t.guest.ctaPrimary : t.hero.ctaPrimary}</a>
              <a className="btn btn-ghost" href="#programme">{t.hero.ctaSecondary}</a>
            </div>
          </div>
        </div>
        <Fairways className="hero-fairways" base="var(--ivory)" />
      </section>

      <section className="sponsors-band paper">
        <SponsorsCarousel />
      </section>

      {/* ——— L'esprit ——— */}
      <section id="esprit" className="section esprit">
        <div className="esprit-bg" aria-hidden="true" />
        <div className="container">
          <SectionTitle kicker={t.esprit.kicker} title={t.esprit.title} light />
          <p className="lead is-light reveal">{t.esprit.lead}</p>
          <div className="pillars">
            {t.esprit.pillars.map((p, i) => (
              <article key={i} className="pillar reveal" style={{ '--d': `${i * 150}ms` }}>
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
          <SectionTitle kicker={event.dateLabel} title={t.programme.title} light />
          <ol className="timeline reveal-line">
            {t.programme.steps.map((step, i) => (
              <li key={i} className="reveal" data-reveal="left" style={{ '--d': `${i * 110}ms` }}>
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
          <SectionTitle kicker={t.formule.kicker} title={event.format} />
          <p className="lead reveal">{t.formule.lead}</p>
          <div className="steps">
            {t.formule.steps.map((s, i) => (
              <div key={s.n} className="step reveal" style={{ '--d': `${i * 130}ms` }}>
                <span className="step-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
          <div className="contests reveal" data-reveal="zoom">
            <div><span className="kicker">{t.formule.contest}</span><strong>{t.formule.drive[0]}</strong><p>{t.formule.drive[1]}</p></div>
            <div className="contests-sep" aria-hidden="true" />
            <div><span className="kicker">{t.formule.contest}</span><strong>{t.formule.precision[0]}</strong><p>{t.formule.precision[1]}</p></div>
          </div>
        </div>
      </section>

      {/* ——— Le lieu ——— */}
      <section id="lieu" className="section green lieu">
        <div className="lieu-bg" aria-hidden="true" />
        <div className="container lieu-inner">
          <div className="lieu-text reveal" data-reveal="left">
            <p className="kicker">{t.lieu.kicker}</p>
            <h2>{event.venue}</h2>
            <Ornament />
            <p>{t.lieu.text}</p>
            <p className="lieu-city">{event.venueCity}</p>
            <a className="btn btn-gold" href={event.mapsUrl} target="_blank" rel="noopener">{t.lieu.directions}</a>
          </div>
        </div>
      </section>

      {/* ——— Plan d'accès (chargé après accord) ——— */}
      <MapConsent />

      {/* ——— Galerie ——— */}
      <section id="galerie" className="section paper galerie">
        <div className="container">
          <SectionTitle kicker={t.gallery.kicker} title={t.gallery.title} />
          <Gallery />
        </div>
      </section>

      {/* ——— Partenaires (masqué pour les invités) ——— */}
      {!guest && <section id="partenaires" className="section paper">
        <div className="container">
          <SectionTitle kicker={t.partners.kicker} title={t.partners.title} />
          <p className="lead reveal">{t.partners.lead}</p>
          <div className="offers">
            {t.offers.map((o, i) => (
              <article key={o.id} className={`offer reveal${o.featured ? ' is-featured' : ''}`} data-reveal="zoom" style={{ '--d': `${i * 140}ms` }}>
                {o.featured && <span className="offer-badge">{t.partners.badge}</span>}
                <h3>{o.name}</h3>
                <p className="offer-price">{o.price}</p>
                <p className="offer-tax">{o.taxNote}</p>
                {o.netNote && <p className="offer-net">{o.netNote}</p>}
                <ul>
                  {o.perks.map(p => <li key={p}>{p}</li>)}
                </ul>
                <a className={`btn ${o.featured ? 'btn-gold' : 'btn-outline'}`} href="#inscription" onClick={() => window.dispatchEvent(new CustomEvent('choose-offer', { detail: o.id }))}>
                  {t.partners.choose}
                </a>
              </article>
            ))}
          </div>
          <p className="offers-note reveal">{t.partners.note}</p>
          <div className="organisers reveal">
            <span>{t.partners.organisation}</span>
            <strong>CTA Events</strong>
            <em>{t.partners.with}</em>
            <strong>Midi Olympique</strong>
            <i aria-hidden="true">×</i>
            <strong>Golf de Palmola</strong>
          </div>
        </div>
      </section>}

      {/* ——— Inscription ——— */}
      <section id="inscription" className="section green inscription">
        <div className="container narrow">
          <SectionTitle kicker={guest ? t.guest.kicker : t.inscription.kicker} title={guest ? t.guest.title : t.inscription.title} light />
          <p className="lead is-light reveal">
            {guest ? t.guest.lead : t.inscription.lead}{event.registrationDeadline ? ` (${t.inscription.before} ${event.registrationDeadline})` : ''}.
          </p>
          {guest ? <GuestForm /> : <RegistrationForm />}
        </div>
        <Fairways className="footer-fairways" base="var(--green-deep)" />
      </section>

      {/* ——— Plyz ——— */}
      <PlyzPromo />
    </main>
  )
}
