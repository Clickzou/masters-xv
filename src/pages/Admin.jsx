import { useCallback, useEffect, useMemo, useState } from 'react'
import { SPONSORS, sponsorBySlug, sponsorSlug } from '../content.js'

// Tableau de bord des organisateurs — /admin
// Deux listes séparées : partenaires payants (table « inscriptions ») et invités gratuits (table « invites »)
// Connexion : prénom et nom de l'organisateur + mot de passe commun.
// Invités : chacun indique « C'est moi qui l'ai invité » ; ensuite lui seul peut le modifier (le serveur le vérifie aussi).
const PW_KEY = 'mxv-admin'
const NAME_KEY = 'mxv-admin-name'
const TAB_KEY = 'mxv-admin-tab'

const OFFER = { sponsor: 'Sponsor 3 000 €', equipe: 'Équipe 1 500 €' }
const PRICE = { sponsor: 3000, equipe: 1500 }
const PARTICIPATION = { golf: 'Golf + déjeuner', dejeuner: 'Déjeuner seul' }

const session = {
  get: k => { try { return sessionStorage.getItem(k) || '' } catch { return '' } },
  set: (k, v) => { try { sessionStorage.setItem(k, v) } catch { /* ignoré */ } },
  del: k => { try { sessionStorage.removeItem(k) } catch { /* ignoré */ } },
}

const fmtDate = iso => new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const euro = n => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const teamCount = t => (parseInt(t, 10) || 1)
const people = r => 1 + (Number(r.companions) || 0)
const tel = p => p.replace(/\s/g, '')
const cleanName = s => String(s ?? '').replace(/\s+/g, ' ').replace(/:/g, '').trim().slice(0, 120)
const sameName = (a, b) => cleanName(a).toLowerCase() === cleanName(b).toLowerCase()
const hostName = n => n || 'Non attribué'
const cardName = slug => sponsorBySlug(slug)?.name || 'Midi Olympique'
const CARDS = Object.fromEntries(SPONSORS.filter(sp => sp.name !== 'Midi Olympique').map(sp => [sponsorSlug(sp), sp.name]))
const userOf = token => { try { return cleanName(new TextDecoder().decode(Uint8Array.from(atob(token), c => c.charCodeAt(0))).split(':')[0]) } catch { return '' } }
const canEdit = (me, tab, r) => tab !== 'invites' || !r.invited_by || sameName(r.invited_by, me)
const local = {
  get: k => { try { return localStorage.getItem(k) || '' } catch { return '' } },
  set: (k, v) => { try { localStorage.setItem(k, v) } catch { /* ignoré */ } },
}

// ——— Configuration de chaque liste
const LISTS = {
  partenaires: {
    tab: 'Partenaires payants',
    subtitle: 'Sponsors et équipes partenaires',
    file: 'partenaires',
    status: { nouveau: 'Nouveau', contacte: 'Contacté', confirme: 'Confirmé', paye: 'Payé', annule: 'Annulé' },
    filter: { key: 'offer', all: 'Toutes les formules', options: OFFER },
    stats: list => {
      const teams = list.reduce((n, r) => n + teamCount(r.teams), 0)
      const amount = list.reduce((n, r) => n + (PRICE[r.offer] || 0) * teamCount(r.teams), 0)
      const paid = list.filter(r => r.status === 'paye').reduce((n, r) => n + (PRICE[r.offer] || 0) * teamCount(r.teams), 0)
      return [
        ['Demandes', list.length, `${list.filter(r => r.status === 'nouveau').length} à traiter`],
        ['Sponsors', list.filter(r => r.offer === 'sponsor').length, 'formule 3 000 €'],
        ['Équipes', teams, `${teams * 4} joueurs`],
        ['Montant estimé', euro(amount), `dont ${euro(paid)} payés`],
        ['Reçus CERFA', list.filter(r => r.needs_receipt).length, 'demandés'],
      ]
    },
    columns: [
      ['Société', r => r.company || '—'],
      ['Formule', r => <span className={`adm-offer is-${r.offer}`}>{OFFER[r.offer] || r.offer}</span>],
      ['Équipes', r => r.teams || '—', 'center'],
      ['CERFA', r => (r.needs_receipt ? '✓' : '—'), 'center'],
    ],
    details: r => [
      ['Société', r.company],
      ['Formule', r.offer_label || OFFER[r.offer]],
      ['Équipes', r.teams],
      ['Niveau', r.level],
      ['Reçu CERFA', r.needs_receipt ? 'Oui' : 'Non'],
    ],
    excel: [
      ['Société', 24, r => r.company || ''],
      ['Formule', 22, r => r.offer_label || OFFER[r.offer] || r.offer],
      ['Équipes', 9, r => r.teams || ''],
      ['Montant estimé (€)', 18, r => ({ value: (PRICE[r.offer] || 0) * teamCount(r.teams), type: Number, format: '#,##0 €' })],
      ['Reçu CERFA', 12, r => (r.needs_receipt ? 'Oui' : 'Non')],
      ['Niveau', 18, r => r.level || ''],
    ],
  },
  invites: {
    tab: 'Invités',
    subtitle: 'Invitations gratuites',
    file: 'invites',
    status: { nouveau: 'Nouveau', confirme: 'Confirmé', annule: 'Annulé' },
    filter: { key: 'participation', all: 'Toutes les participations', options: PARTICIPATION },
    byHost: true,
    byCard: true,
    stats: list => {
      const golf = list.filter(r => r.participation === 'golf')
      return [
        ['Réponses', list.length, `${list.filter(r => r.status === 'nouveau').length} à traiter`],
        ['Personnes', list.reduce((n, r) => n + people(r), 0), 'invités + accompagnants'],
        ['Golfeurs', golf.length, `${golf.reduce((n, r) => n + (Number(r.companions) || 0), 0)} accompagnants`],
        ['Déjeuner seul', list.filter(r => r.participation === 'dejeuner').reduce((n, r) => n + people(r), 0), 'personnes'],
        ['Régimes', list.filter(r => r.diet).length, 'à signaler au traiteur'],
      ]
    },
    columns: [
      ['Carte', r => cardName(r.sponsor)],
      ['Invité par', r => hostName(r.invited_by)],
      ['Société', r => r.company || '—'],
      ['Participation', r => <span className={`adm-offer is-${r.participation}`}>{PARTICIPATION[r.participation] || r.participation}</span>],
      ['Accomp.', r => r.companions ?? 0, 'center'],
      ['Régime', r => (r.diet ? '✓' : '—'), 'center'],
    ],
    details: r => [
      ['Carte', cardName(r.sponsor)],
      ['Invité par', hostName(r.invited_by)],
      ['Société', r.company],
      ['Participation', PARTICIPATION[r.participation]],
      ['Accompagnants', String(r.companions ?? 0)],
      ['Index / niveau', r.level],
      ['Régime', r.diet],
    ],
    excel: [
      ['Carte d’invitation', 24, r => cardName(r.sponsor)],
      ['Invité par', 22, r => hostName(r.invited_by)],
      ['Société', 24, r => r.company || ''],
      ['Participation', 18, r => PARTICIPATION[r.participation] || r.participation],
      ['Accompagnants', 14, r => ({ value: Number(r.companions) || 0, type: Number })],
      ['Personnes', 11, r => ({ value: people(r), type: Number })],
      ['Index / niveau', 18, r => r.level || ''],
      ['Régime / allergies', 26, r => r.diet || ''],
    ],
  },
}

async function api(token, list, method = 'GET', body, query = '') {
  const res = await fetch(`/api/admin?list=${list}${query}`, {
    method,
    headers: { Authorization: `Basic ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || String(res.status)), { status: res.status })
  return data
}

// Identifiants encodés pour l'en-tête Basic (UTF-8 compris)
const toToken = (name, pw) => btoa(String.fromCharCode(...new TextEncoder().encode(`${cleanName(name)}:${pw}`)))

function Login({ onLogin, error, busy }) {
  const [who, setWho] = useState(() => local.get(NAME_KEY))
  const [pw, setPw] = useState('')
  return (
    <div className="adm-login">
      <form onSubmit={e => { e.preventDefault(); local.set(NAME_KEY, cleanName(who)); onLogin(toToken(who, pw)) }}>
        <img src="/logo/masters-xv-logo-couleur.svg" alt="Masters XV" width="90" height="122" />
        <h1>Tableau de bord</h1>
        <p>Inscriptions Masters XV</p>
        <label>Votre prénom et nom
          <input autoComplete="name" autoFocus={!who} value={who} onChange={e => setWho(e.target.value)} required minLength="2" maxLength="120" />
        </label>
        <label>Mot de passe
          <input type="password" autoComplete="current-password" autoFocus={Boolean(who)} value={pw} onChange={e => setPw(e.target.value)} required />
        </label>
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button className="btn btn-gold btn-block" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</button>
      </form>
    </div>
  )
}

async function exportExcel(cfg, rows) {
  const { default: writeExcelFile } = await import('write-excel-file/browser')
  const head = text => ({ value: text, fontWeight: 'bold', textColor: '#FFFFFF', backgroundColor: '#0A3A20' })
  const cell = v => (v && typeof v === 'object' ? v : { value: v })
  const col = (title, width, get, extra = {}) => ({ header: head(title), width, cell: r => ({ ...cell(get(r)), ...extra }) })
  const columns = [
    col('Date', 18, r => ({ value: new Date(r.created_at), type: Date, format: 'dd/mm/yyyy hh:mm' })),
    col('Statut', 12, r => cfg.status[r.status] || r.status),
    col('Prénom', 16, r => r.first_name),
    col('Nom', 18, r => r.last_name),
    col('E-mail', 30, r => r.email),
    col('Téléphone', 16, r => r.phone || ''),
    ...cfg.excel.map(([title, width, get]) => col(title, width, get)),
    col('Langue', 8, r => (r.lang || 'fr').toUpperCase()),
    col('Message', 40, r => r.message || '', { wrap: true }),
    col('Notes internes', 40, r => r.notes || '', { wrap: true }),
  ]
  const date = new Date().toISOString().slice(0, 10)
  await writeExcelFile(rows, { columns, sheet: cfg.tab, stickyRowsCount: 1 }).toFile(`masters-xv-${cfg.file}-${date}.xlsx`)
}

export default function Admin() {
  const [password, setPassword] = useState(() => session.get(PW_KEY))
  const [data, setData] = useState(null) // { partenaires: [...], invites: [...] }
  const [tab, setTab] = useState(() => (LISTS[session.get(TAB_KEY)] ? session.get(TAB_KEY) : 'partenaires'))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [q, setQ] = useState('')
  const [choice, setChoice] = useState('')
  const [host, setHost] = useState('')
  const [card, setCard] = useState('')
  const [status, setStatus] = useState('')
  const [open, setOpen] = useState(null)
  const [exporting, setExporting] = useState(false)

  const cfg = LISTS[tab]
  const me = userOf(password)
  const items = data?.[tab]

  useEffect(() => {
    document.title = 'Tableau de bord – Masters XV'
    const meta = document.createElement('meta')
    meta.name = 'robots'; meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  const load = useCallback(async pw => {
    setBusy(true); setError('')
    try {
      const [p, i] = await Promise.allSettled([api(pw, 'partenaires'), api(pw, 'invites')])
      const failed = [p, i].find(r => r.status === 'rejected')
      if (p.status === 'rejected' && (p.reason.status === 401 || p.reason.status === 503)) throw p.reason
      setData({ partenaires: p.value?.items || [], invites: i.value?.items || [] })
      session.set(PW_KEY, pw); setPassword(pw)
      if (failed) setError(i.status === 'rejected' ? 'Liste des invités indisponible : la table « invites » est-elle créée dans Supabase ?' : 'Liste des partenaires indisponible.')
    } catch (err) {
      if (err.status === 401) { session.del(PW_KEY); setPassword(''); setError('Mot de passe incorrect.') }
      else if (err.message === 'admin-not-configured') setError('ADMIN_PASSWORD n’est pas défini dans Vercel.')
      else if (err.message === 'db-not-configured') setError('Supabase n’est pas configuré (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).')
      else setError('Impossible de charger les inscriptions. Réessayez.')
    } finally { setBusy(false) }
  }, [])

  useEffect(() => { if (password) load(password) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const switchTab = key => {
    setTab(key); session.set(TAB_KEY, key)
    setQ(''); setChoice(''); setHost(''); setCard(''); setStatus(''); setOpen(null)
  }

  const setItems = (list, fn) => setData(d => ({ ...d, [list]: fn(d[list]) }))

  const patch = async (id, changes) => {
    const list = tab
    setItems(list, rows => rows.map(r => (r.id === id ? { ...r, ...changes } : r)))
    try {
      const { item } = await api(password, list, 'PATCH', { id, ...changes })
      setItems(list, rows => rows.map(r => (r.id === id ? item : r)))
    } catch (err) {
      setError(err.status === 403 ? 'Cet invité a été ajouté par un autre organisateur : vous ne pouvez pas le modifier.'
        : err.status === 409 ? 'Un autre organisateur vient d’indiquer qu’il a invité cette personne.'
          : 'La modification n’a pas été enregistrée.')
      load(password)
    }
  }

  const remove = async r => {
    if (!window.confirm(`Supprimer définitivement la demande de ${r.first_name} ${r.last_name} ?`)) return
    const list = tab
    try {
      await api(password, list, 'DELETE', null, `&id=${r.id}`)
      setItems(list, rows => rows.filter(x => x.id !== r.id)); setOpen(null)
    } catch (err) { setError(err.status === 403 ? 'Cet invité a été ajouté par un autre organisateur : vous ne pouvez pas le supprimer.' : 'La suppression a échoué.') }
  }

  const filtered = useMemo(() => {
    if (!items) return []
    const s = q.trim().toLowerCase()
    return items.filter(r =>
      (!choice || r[cfg.filter.key] === choice) &&
      (!card || (card === 'none' ? !r.sponsor : r.sponsor === card)) &&
      (!host || (host === 'none' ? !r.invited_by : host === 'mine' ? sameName(r.invited_by, me) : r.invited_by === host)) &&
      (!status || r.status === status) &&
      (!s || [r.first_name, r.last_name, r.company, r.email, r.phone].some(v => (v || '').toLowerCase().includes(s))))
  }, [items, q, choice, host, card, status, cfg, me])

  const hosts = useMemo(() => [...new Set((data?.invites || []).map(r => r.invited_by).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr')), [data])

  const stats = useMemo(() => cfg.stats((items || []).filter(r => r.status !== 'annule')), [items, cfg])

  if (!data) return <Login onLogin={load} error={error} busy={busy} />

  const current = open && items.find(r => r.id === open)
  const statusOptions = Object.entries(cfg.status).map(([k, v]) => <option key={k} value={k}>{v}</option>)

  return (
    <div className="adm">
      <header className="adm-top">
        <div className="adm-brand">
          <img src="/logo/masters-xv-logo-couleur.svg" alt="" width="34" height="46" />
          <div><strong>Masters XV</strong><span>Connecté : {me || '—'}</span></div>
        </div>
        <div className="adm-top-actions">
          <button className="adm-btn" onClick={() => load(password)} disabled={busy}>{busy ? 'Actualisation…' : 'Actualiser'}</button>
          <button className="adm-btn adm-btn-gold" disabled={!filtered.length || exporting}
            onClick={async () => { setExporting(true); try { await exportExcel(cfg, filtered) } finally { setExporting(false) } }}>
            {exporting ? 'Export…' : `Exporter Excel (${filtered.length})`}
          </button>
          <button className="adm-btn adm-btn-ghost" onClick={() => { session.del(PW_KEY); setPassword(''); setData(null); setError('') }}>Déconnexion</button>
        </div>
      </header>

      <nav className="adm-tabs" aria-label="Listes">
        {Object.entries(LISTS).map(([key, l]) => (
          <button key={key} className={key === tab ? 'is-active' : ''} aria-current={key === tab} onClick={() => switchTab(key)}>
            {l.tab}<span>{data[key].length}</span>
          </button>
        ))}
      </nav>

      <main className="adm-main">
        {error && <p className="adm-error adm-banner" role="alert">{error}</p>}

        {tab === 'invites' && <p className="adm-hint">Les invités s’inscrivent eux-mêmes avec la carte d’invitation. Si c’est vous qui avez invité quelqu’un, cliquez sur <strong>« C’est moi »</strong> : vous seul pourrez ensuite modifier cet invité.</p>}

        <section className="adm-stats" aria-label={cfg.subtitle}>
          {stats.map(([label, value, note]) => <div key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>)}
        </section>

        <section className="adm-filters">
          <input type="search" placeholder="Rechercher un nom, une société, un e-mail…" value={q} onChange={e => setQ(e.target.value)} />
          <select value={choice} onChange={e => setChoice(e.target.value)}>
            <option value="">{cfg.filter.all}</option>
            {Object.entries(cfg.filter.options).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          {cfg.byCard && (
            <select value={card} onChange={e => setCard(e.target.value)}>
              <option value="">Toutes les cartes</option>
              <option value="none">Midi Olympique (sans sponsor)</option>
              {Object.entries(CARDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          )}
          {cfg.byHost && (
            <select value={host} onChange={e => setHost(e.target.value)}>
              <option value="">Tous les organisateurs</option>
              <option value="mine">Mes invités</option>
              <option value="none">Non attribués</option>
              {hosts.filter(n => !sameName(n, me)).map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          )}
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Tous les statuts</option>
            {statusOptions}
          </select>
        </section>

        {filtered.length === 0 ? (
          <p className="adm-empty">{items.length ? 'Aucune demande ne correspond aux filtres.' : 'Aucune demande pour le moment.'}</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Date</th><th>Contact</th>{cfg.columns.map(([title]) => <th key={title}>{title}</th>)}<th>Statut</th></tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} onClick={() => setOpen(r.id)} className={`${r.status === 'annule' ? 'is-cancelled' : ''}${canEdit(me, tab, r) ? '' : ' is-readonly'}`}>
                    <td className="nowrap">{fmtDate(r.created_at)}</td>
                    <td>
                      <strong>{r.first_name} {r.last_name}</strong>
                      <a href={`mailto:${r.email}`} onClick={e => e.stopPropagation()}>{r.email}</a>
                      {r.phone && <a href={`tel:${tel(r.phone)}`} onClick={e => e.stopPropagation()}>{r.phone}</a>}
                    </td>
                    {cfg.columns.map(([title, get, cls]) => <td key={title} className={cls} onClick={title === 'Invité par' ? e => e.stopPropagation() : undefined}>{title === 'Invité par' ? <HostCell r={r} me={me} onClaim={claim => patch(r.id, { claim })} /> : get(r)}</td>)}
                    <td onClick={e => e.stopPropagation()}>
                      <select className={`adm-status is-${r.status}`} value={r.status} disabled={!canEdit(me, tab, r)} title={canEdit(me, tab, r) ? undefined : `Lecture seule : invité de ${r.invited_by}`} onChange={e => patch(r.id, { status: e.target.value })}>
                        {statusOptions}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {current && (
        <div className="adm-drawer-backdrop" onClick={() => setOpen(null)}>
          <aside className="adm-drawer" onClick={e => e.stopPropagation()} aria-label="Détail de la demande">
            <button className="adm-close" onClick={() => setOpen(null)} aria-label="Fermer">×</button>
            <p className="adm-kicker">{cfg.tab} · {fmtDate(current.created_at)}</p>
            <h2>{current.first_name} {current.last_name}</h2>
            <dl>
              <dt>E-mail</dt><dd><a href={`mailto:${current.email}`}>{current.email}</a></dd>
              <dt>Téléphone</dt><dd>{current.phone ? <a href={`tel:${tel(current.phone)}`}>{current.phone}</a> : '—'}</dd>
              {cfg.details(current).map(([k, v]) => <FragmentRow key={k} label={k} value={v} />)}
              <dt>Langue</dt><dd>{current.lang === 'en' ? 'Anglais' : 'Français'}</dd>
              <dt>Message</dt><dd className="pre">{current.message || '—'}</dd>
            </dl>
            {canEdit(me, tab, current) ? (
              <>
                {tab === 'invites' && (
                  <div className="adm-field">Invité par
                    <HostCell r={current} me={me} onClaim={claim => patch(current.id, { claim })} />
                  </div>
                )}
                <label className="adm-field">Statut
                  <select value={current.status} onChange={e => patch(current.id, { status: e.target.value })}>
                    {statusOptions}
                  </select>
                </label>
                <NotesField key={current.id} value={current.notes || ''} onSave={notes => patch(current.id, { notes })} />
                <button className="adm-delete" onClick={() => remove(current)}>Supprimer cette demande</button>
              </>
            ) : (
              <>
                <p className="adm-readonly">Lecture seule : cet invité a été ajouté par <strong>{current.invited_by}</strong>. Lui seul peut le modifier.</p>
                <dl><dt>Statut</dt><dd>{cfg.status[current.status]}</dd><dt>Notes</dt><dd className="pre">{current.notes || '—'}</dd></dl>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}

// « Invité par » : bouton pour revendiquer un invité libre, ou pour se retirer
function HostCell({ r, me, onClaim }) {
  if (!r.invited_by) return <button type="button" className="adm-claim" onClick={() => onClaim(true)}>C’est moi</button>
  if (!sameName(r.invited_by, me)) return <span className="adm-host">{r.invited_by}</span>
  return (
    <span className="adm-host is-me">{r.invited_by}
      <button type="button" className="adm-unclaim" onClick={() => window.confirm('Retirer votre nom de cet invité ?') && onClaim(false)}>retirer</button>
    </span>
  )
}

function FragmentRow({ label, value }) {
  return <><dt>{label}</dt><dd>{value || '—'}</dd></>
}

function NotesField({ value, onSave }) {
  const [v, setV] = useState(value)
  const dirty = v !== value
  return (
    <label className="adm-field">Notes internes
      <textarea rows="5" value={v} onChange={e => setV(e.target.value)} placeholder="Suivi, paiement, joueur pro associé…" />
      <button type="button" className="adm-btn adm-btn-gold" disabled={!dirty} onClick={() => onSave(v)}>{dirty ? 'Enregistrer la note' : 'Note enregistrée'}</button>
    </label>
  )
}
