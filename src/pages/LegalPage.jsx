import { LEGAL } from '../legal.js'
import { useT } from '../i18n.jsx'

// Rend « https://… » et « www.… » cliquables dans les textes légaux
function Linkify({ text }) {
  const parts = text.split(/(https?:\/\/[^\s;,)]+|www\.[^\s;,)]+\.[a-z]{2,})/g)
  return parts.map((part, i) =>
    /^(https?:\/\/|www\.)/.test(part)
      ? <a key={i} href={part.startsWith('http') ? part : `https://${part}`} target="_blank" rel="noopener">{part}</a>
      : part,
  )
}

export default function LegalPage({ slug }) {
  const t = useT()
  const page = LEGAL[t.lang][slug]

  const resetCookies = () => {
    window.dispatchEvent(new Event('mxv-cookies-request-reset'))
  }

  return (
    <main className="legal">
      <div className="container narrow">
        <a className="legal-back" href="/">← {t.legalPage.back}</a>
        <header className="legal-head">
          <p className="kicker">Masters XV</p>
          <h1>{page.title}</h1>
          <p className="legal-updated">{t.legalPage.updated}</p>
        </header>
        {page.sections.map(s => (
          <section key={s.h} className="legal-section">
            <h2>{s.h}</h2>
            {groupParagraphs(s.p).map((block, i) =>
              Array.isArray(block)
                ? <ul key={i}>{block.map(li => <li key={li}><Linkify text={li.replace(/^•\s*/, '')} /></li>)}</ul>
                : <p key={i}><Linkify text={block} /></p>,
            )}
          </section>
        ))}
        {slug === 'politique-cookies' && (
          <button className="btn btn-outline" onClick={resetCookies}>{t.footer.manageCookies}</button>
        )}
      </div>
    </main>
  )
}

// Regroupe les lignes « • » consécutives en listes
function groupParagraphs(lines) {
  const out = []
  for (const l of lines) {
    if (l.startsWith('•')) {
      if (Array.isArray(out[out.length - 1])) out[out.length - 1].push(l)
      else out.push([l])
    } else out.push(l)
  }
  return out
}
