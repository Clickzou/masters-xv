import { useEffect, useState } from 'react'
import { CONTENT } from './content.js'
import { LEGAL, LEGAL_SLUGS } from './legal.js'
import { LangContext, detectLang, saveLang, store } from './i18n.jsx'
import { MAP_KEY } from './components/MapConsent.jsx'
import Home from './pages/Home.jsx'
import LegalPage from './pages/LegalPage.jsx'

const legalSlug = () => {
  const slug = window.location.pathname.replace(/^\/|\/$/g, '')
  return LEGAL_SLUGS.includes(slug) ? slug : null
}

export default function App() {
  const [lang, setLang] = useState(detectLang)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState(false)
  const t = CONTENT[lang]
  const slug = legalSlug()
  const base = slug ? '/' : '' // liens d'ancre vers l'accueil depuis une page légale

  // Langue, titre et description de la page
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = slug ? `${LEGAL[lang][slug].title} – Masters XV` : t.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
  }, [lang, slug, t])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // « Gérer les cookies » : efface les choix mémorisés et masque de nouveau la carte
  useEffect(() => {
    const onReset = () => {
      store.del(MAP_KEY)
      window.dispatchEvent(new Event('mxv-cookies-reset'))
      setNotice(true)
      setTimeout(() => setNotice(false), 4000)
    }
    window.addEventListener('mxv-cookies-request-reset', onReset)
    return () => window.removeEventListener('mxv-cookies-request-reset', onReset)
  }, [])

  const switchLang = () => {
    const next = lang === 'fr' ? 'en' : 'fr'
    saveLang(next)
    setLang(next)
    setMenuOpen(false)
  }

  const scrolledClass = scrolled || slug ? ' is-scrolled' : ''

  return (
    <LangContext.Provider value={t}>
      <nav className={`nav${scrolledClass}${menuOpen ? ' is-open' : ''}`}>
        <a href={slug ? '/' : '#top'} className="nav-brand" onClick={() => setMenuOpen(false)}>
          <img src="/logo/masters-xv-logo-couleur.svg" alt="" width="30" height="41" />
          <span>Masters XV</span>
        </a>
        <div className="nav-right">
          <button className="lang-switch" onClick={switchLang} aria-label={t.nav.switchTo} title={t.nav.switchTo}>
            <span className={lang === 'fr' ? 'is-active' : ''}>FR</span>
            <i aria-hidden="true">|</i>
            <span className={lang === 'en' ? 'is-active' : ''}>EN</span>
          </button>
          <button className="nav-toggle" aria-label={t.nav.menu} aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>
            <span /><span />
          </button>
        </div>
        <ul>
          {t.nav.items.map(([id, label]) => (
            <li key={id}><a href={`${base}#${id}`} onClick={() => setMenuOpen(false)}>{label}</a></li>
          ))}
          <li><a href={`${base}#inscription`} className="nav-cta" onClick={() => setMenuOpen(false)}>{t.nav.cta}</a></li>
        </ul>
      </nav>

      {slug ? <LegalPage slug={slug} /> : <Home />}

      <footer className="footer">
        <img src="/logo/masters-xv-logo-1couleur-or.svg" alt="" width="70" height="95" />
        <p className="footer-title">Masters XV</p>
        <p>{t.event.baseline}</p>
        <p>{t.event.dateLabel} · {t.event.venue}</p>
        {(t.event.contactEmail || t.event.contactPhone) && (
          <p className="footer-contact">
            {t.event.contactEmail && <a href={`mailto:${t.event.contactEmail}`}>{t.event.contactEmail}</a>}
            {t.event.contactEmail && t.event.contactPhone && ' · '}
            {t.event.contactPhone && <a href={`tel:${t.event.contactPhone.replace(/\s/g, '')}`}>{t.event.contactPhone}</a>}
          </p>
        )}
        <nav className="footer-legal" aria-label={t.footer.legal}>
          <a href="/mentions-legales">{t.footer.legal}</a>
          <a href="/politique-de-confidentialite">{t.footer.privacy}</a>
          <a href="/politique-cookies">{t.footer.cookies}</a>
          <button onClick={() => window.dispatchEvent(new Event('mxv-cookies-request-reset'))}>{t.footer.manageCookies}</button>
        </nav>
        <p className="footer-small">© {new Date().getFullYear()} Masters XV · CTA Events · Midi Olympique</p>
        <p className="footer-credit">{t.footer.credit} <a href="https://www.clickzou.fr/" target="_blank" rel="noopener">Clickzou</a></p>
      </footer>

      {notice && (
        <div className="toast" role="status">
          {lang === 'fr' ? 'Vos choix de cookies ont été réinitialisés.' : 'Your cookie choices have been reset.'}
        </div>
      )}
    </LangContext.Provider>
  )
}
