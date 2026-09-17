import { useCallback, useEffect, useMemo, useState } from 'react'
import { SPONSORS, sponsorBySlug, sponsorSlug } from '../content.js'

// Tableau de bord des organisateurs — /admin
// Deux listes séparées : partenaires payants (table « inscriptions ») et invités gratuits (table « invites »)
// Connexion : prénom et nom de l'organisateur + mot de passe commun.
// Invités : chacun indique « C'est moi qui l'ai invité » ; ensuite lui seul peut le modifier (le serveur le vérifie aussi).
const PW_KEY = 'mxv-admin'
const NAME_KEY = 'mxv-admin-name'
const TAB_KEY = 'mxv-admin-tab'

const OFFER = { sponsor: 'Sponsor', equipe: 'Équipe partenaire' }
const PARTICIPATION = { golf: 'Golf + déjeuner', dejeuner: 'Déjeuner seul' }
const PROFILE = { golfeur: 'Golfeur', rugbyman: 'Joueur de rugby' }

const session = {
  get: k => { try { return sessionStorage.getItem(k) || '' } catch { return '' } },
  set: (k, v) => { try { sessionStorage.setItem(k, v) } catch { /* ignoré */ } },
  del: k => { try { sessionStorage.removeItem(k) } catch { /* ignoré */ } },
}

const fmtDate = iso => new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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
    stats: (list, { confirmedSponsors }) => {
      const teams = list.reduce((n, r) => n + teamCount(r.teams), 0)
      return [
        ['Sponsors confirmés', `${confirmedSponsors} / ${SPONSORS.length}`, 'sponsors du site'],
        ['Demandes', list.length, `${list.filter(r => r.status === 'nouveau').length} à traiter`],
        ['Équipes', teams, `${teams * 4} joueurs`],
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
      ['Formule', OFFER[r.offer] || r.offer],
      ['Équipes', r.teams],
      ['Niveau', r.level],
      ['Reçu CERFA', r.needs_receipt ? 'Oui' : 'Non'],
    ],
    excel: [
      ['Société', 24, r => r.company || ''],
      ['Formule', 22, r => OFFER[r.offer] || r.offer],
      ['Équipes', 9, r => r.teams || ''],
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
      return [
        ['Réponses', list.length, `${list.filter(r => r.status === 'nouveau').length} à traiter`],
        ['Personnes', list.reduce((n, r) => n + people(r), 0), 'invités + accompagnants'],
        ['Golfeurs', list.filter(r => r.profile === 'golfeur').length, `${list.filter(r => !r.profile).length} profil(s) à définir`],
        ['Joueurs de rugby', list.filter(r => r.profile === 'rugbyman').length, `${list.filter(r => r.source === 'manuel').length} ajouté(s) à la main`],
        ['Déjeuner seul', list.filter(r => r.participation === 'dejeuner').reduce((n, r) => n + people(r), 0), 'personnes'],
        ['Régimes', list.filter(r => r.diet).length, 'à signaler au traiteur'],
      ]
    },
    columns: [
      ['Profil', (r, x) => (
        <select className={`adm-profile is-${r.profile || 'none'}`} value={r.profile || ''} disabled={!x.editable}
          onChange={e => x.patch(r.id, { profile: e.target.value || null })}>
          <option value="">À définir</option>
          {Object.entries(PROFILE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      ), '', true],
      ['Handicap', r => r.level || '—', 'center'],
      ['Carte', r => (r.source === 'manuel' ? 'Ajout manuel' : cardName(r.sponsor))],
      ['Invité par', (r, x) => <HostCell r={r} me={x.me} onClaim={claim => x.patch(r.id, { claim })} />, '', true],
      ['Société', r => r.company || '—'],
      ['Participation', r => <span className={`adm-offer is-${r.participation}`}>{PARTICIPATION[r.participation] || r.participation}</span>],
      ['Accomp.', r => r.companions ?? 0, 'center'],
      ['Régime', r => (r.diet ? '✓' : '—'), 'center'],
    ],
    details: r => [
      ['Profil', PROFILE[r.profile] || 'À définir'],
      ['Carte', r.source === 'manuel' ? 'Ajout manuel' : cardName(r.sponsor)],
      ['Invité par', hostName(r.invited_by)],
      ['Société', r.company],
      ['Participation', PARTICIPATION[r.participation]],
      ['Accompagnants', String(r.companions ?? 0)],
      ['Handicap / niveau', r.level],
      ['Régime', r.diet],
    ],
    excel: [
      ['Profil', 16, r => PROFILE[r.profile] || 'À définir'],
      ['Carte d’invitation', 24, r => (r.source === 'manuel' ? 'Ajout manuel' : cardName(r.sponsor))],
      ['Invité par', 22, r => hostName(r.invited_by)],
      ['Société', 24, r => r.company || ''],
      ['Participation', 18, r => PARTICIPATION[r.participation] || r.participation],
      ['Accompagnants', 14, r => ({ value: Number(r.companions) || 0, type: Number })],
      ['Personnes', 11, r => ({ value: people(r), type: Number })],
      ['Handicap / niveau', 18, r => r.level || ''],
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
  const [adding, setAdding] = useState(false)

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
      const [p, i, sp] = await Promise.allSettled([api(pw, 'partenaires'), api(pw, 'invites'), api(pw, 'sponsors')])
      if (p.status === 'rejected' && (p.reason.status === 401 || p.reason.status === 503)) throw p.reason
      setData({
        partenaires: p.value?.items || [],
        invites: i.value?.items || [],
        sponsors: Object.fromEntries((sp.value?.items || []).map(r => [r.slug, r])),
      })
      session.set(PW_KEY, pw); setPassword(pw)
      if (p.status === 'rejected') setError('Liste des partenaires indisponible.')
      else if (i.status === 'rejected') setError('Liste des invités indisponible : la table « invites » est-elle créée dans Supabase ?')
      else if (sp.status === 'rejected') setError('Statut des sponsors indisponible : relancez supabase/schema.sql dans Supabase (table « sponsors »).')
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

  const setSponsor = async (slug, confirmed) => {
    const before = data.sponsors[slug]
    setData(d => ({ ...d, sponsors: { ...d.sponsors, [slug]: { ...before, slug, confirmed, updated_by: me } } }))
    try {
      const { item } = await api(password, 'sponsors', 'PATCH', { slug, confirmed })
      setData(d => ({ ...d, sponsors: { ...d.sponsors, [slug]: item } }))
    } catch {
      setData(d => ({ ...d, sponsors: { ...d.sponsors, [slug]: before } }))
      setError('Le statut du sponsor n’a pas été enregistré.')
    }
  }

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

  const stats = useMemo(() => cfg.stats((items || []).filter(r => r.status !== 'annule'), {
    confirmedSponsors: Object.values(data?.sponsors || {}).filter(r => r.confirmed).length,
  }), [items, cfg, data])

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

        {tab === 'invites' && (
          <div className="adm-hint adm-hint-row">
            <p>Les invités s’inscrivent eux-mêmes avec la carte d’invitation. Choisissez leur <strong>profil</strong> (golfeur ou joueur de rugby) et, si c’est vous qui les avez invités, cliquez sur <strong>« C’est moi »</strong> : vous seul pourrez ensuite les modifier.</p>
            <button className="adm-btn adm-btn-gold" onClick={() => setAdding(true)}>+ Ajouter un rugbyman</button>
          </div>
        )}

        <section className="adm-stats" aria-label={cfg.subtitle}>
          {stats.map(([label, value, note]) => <div key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>)}
        </section>

        {tab === 'partenaires' && <SponsorsPanel status={data.sponsors} invites={data.invites} onChange={setSponsor} />}

        {tab === 'partenaires' && <h2 className="adm-h2">Demandes reçues par le site</h2>}

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
                      {r.email && <a href={`mailto:${r.email}`} onClick={e => e.stopPropagation()}>{r.email}</a>}
                      {r.phone && <a href={`tel:${tel(r.phone)}`} onClick={e => e.stopPropagation()}>{r.phone}</a>}
                    </td>
                    {cfg.columns.map(([title, get, cls, interactive]) => (
                      <td key={title} className={cls || undefined} onClick={interactive ? e => e.stopPropagation() : undefined}>
                        {get(r, { me, patch, editable: canEdit(me, tab, r) })}
                      </td>
                    ))}
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

      {adding && (
        <AddPlayer
          onClose={() => setAdding(false)}
          onSave={async body => {
            const { item } = await api(password, 'invites', 'POST', body)
            setItems('invites', rows => [item, ...rows])
            setAdding(false)
          }}
        />
      )}

      {current && (
        <div className="adm-drawer-backdrop" onClick={() => setOpen(null)}>
          <aside className="adm-drawer" onClick={e => e.stopPropagation()} aria-label="Détail de la demande">
            <button className="adm-close" onClick={() => setOpen(null)} aria-label="Fermer">×</button>
            <p className="adm-kicker">{cfg.tab} · {fmtDate(current.created_at)}</p>
            <h2>{current.first_name} {current.last_name}</h2>
            <dl>
              <dt>E-mail</dt><dd>{current.email ? <a href={`mailto:${current.email}`}>{current.email}</a> : '—'}</dd>
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

// Ajout manuel d'un joueur de rugby dans la liste des invités
function AddPlayer({ onClose, onSave }) {
  const [d, setD] = useState({ firstName: '', lastName: '', company: '', email: '', phone: '', participation: 'golf', companions: '0', level: '', status: 'confirme', profile: 'rugbyman', notes: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = k => e => setD(v => ({ ...v, [k]: e.target.value }))
  const submit = async e => {
    e.preventDefault(); setBusy(true); setErr('')
    try { await onSave(d) } catch (x) { setErr(x.message === 'email' ? 'L’adresse e-mail n’est pas valide.' : 'L’ajout a échoué. Réessayez.'); setBusy(false) }
  }
  return (
    <div className="adm-drawer-backdrop" onClick={onClose}>
      <aside className="adm-drawer" onClick={e => e.stopPropagation()} aria-label="Ajouter un joueur">
        <button className="adm-close" onClick={onClose} aria-label="Fermer">×</button>
        <p className="adm-kicker">Invités · ajout manuel</p>
        <h2>Ajouter un rugbyman</h2>
        <form className="adm-form" onSubmit={submit}>
          <label className="adm-field">Prénom *<input required value={d.firstName} onChange={set('firstName')} autoFocus /></label>
          <label className="adm-field">Nom *<input required value={d.lastName} onChange={set('lastName')} /></label>
          <label className="adm-field">Club / société<input value={d.company} onChange={set('company')} placeholder="ex. Stade Toulousain" /></label>
          <label className="adm-field">E-mail<input type="email" value={d.email} onChange={set('email')} /></label>
          <label className="adm-field">Téléphone<input type="tel" value={d.phone} onChange={set('phone')} /></label>
          <label className="adm-field">Profil
            <select value={d.profile} onChange={set('profile')}>{Object.entries(PROFILE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </label>
          <label className="adm-field">Handicap / index<input value={d.level} onChange={set('level')} placeholder="ex. 18, débutant…" /></label>
          <label className="adm-field">Participation
            <select value={d.participation} onChange={set('participation')}>{Object.entries(PARTICIPATION).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </label>
          <label className="adm-field">Accompagnants
            <select value={d.companions} onChange={set('companions')}>{['0', '1', '2', '3'].map(v => <option key={v}>{v}</option>)}</select>
          </label>
          <label className="adm-field">Statut
            <select value={d.status} onChange={set('status')}>{Object.entries(LISTS.invites.status).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </label>
          <label className="adm-field">Notes internes<textarea rows="3" value={d.notes} onChange={set('notes')} placeholder="Palmarès, poste, équipe associée…" /></label>
          {err && <p className="adm-readonly" role="alert">{err}</p>}
          <button className="adm-btn adm-btn-gold" disabled={busy}>{busy ? 'Ajout…' : 'Ajouter à la liste des invités'}</button>
          <p className="adm-muted">Vous serez indiqué comme « Invité par » : vous seul pourrez modifier ce joueur.</p>
        </form>
      </aside>
    </div>
  )
}

// Sponsors du site (src/content.js) : confirmé ou non, et nombre d'invités venus par leur carte
function SponsorsPanel({ status, invites, onChange }) {
  const guests = slug => invites.filter(r => r.sponsor === slug && r.status !== 'annule').reduce((n, r) => n + people(r), 0)
  return (
    <section className="adm-sponsors" aria-label="Sponsors du site">
      <h2 className="adm-h2">Sponsors du site</h2>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Logo</th><th>Sponsor</th><th className="center">Invités</th><th>Statut</th><th>Modifié par</th></tr></thead>
          <tbody>
            {SPONSORS.map(sp => {
              const slug = sponsorSlug(sp)
              const s = status[slug]
              return (
                <tr key={slug} className="is-static">
                  <td><span className={`adm-logo${sp.dark ? ' is-dark' : ''}`}><img src={sp.logo} alt="" /></span></td>
                  <td><strong>{sp.name}</strong><a href={`/invite/${slug}`} target="_blank" rel="noopener">/invite/{slug}</a></td>
                  <td className="center">{guests(slug)}</td>
                  <td>
                    <div className="adm-toggle" role="group" aria-label={`Statut de ${sp.name}`}>
                      <button type="button" className={s?.confirmed ? 'is-on' : ''} aria-pressed={Boolean(s?.confirmed)} onClick={() => !s?.confirmed && onChange(slug, true)}>Confirmé</button>
                      <button type="button" className={!s?.confirmed ? 'is-off' : ''} aria-pressed={!s?.confirmed} onClick={() => s?.confirmed && onChange(slug, false)}>Non confirmé</button>
                    </div>
                  </td>
                  <td className="adm-muted">{s?.updated_by ? `${s.updated_by} · ${fmtDate(s.updated_at)}` : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
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
