import { useCallback, useEffect, useMemo, useState } from 'react'

// Tableau de bord des inscriptions (organisateurs) — /admin
const PW_KEY = 'mxv-admin'
const STATUS = {
  nouveau: 'Nouveau',
  contacte: 'Contacté',
  confirme: 'Confirmé',
  paye: 'Payé',
  annule: 'Annulé',
}
const OFFER = { sponsor: 'Sponsor 3 000 €', equipe: 'Équipe 1 500 €' }
const PRICE = { sponsor: 3000, equipe: 1500 }

const session = {
  get: () => { try { return sessionStorage.getItem(PW_KEY) || '' } catch { return '' } },
  set: v => { try { sessionStorage.setItem(PW_KEY, v) } catch { /* ignoré */ } },
  del: () => { try { sessionStorage.removeItem(PW_KEY) } catch { /* ignoré */ } },
}

const fmtDate = iso => new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const euro = n => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const teamCount = t => (parseInt(t, 10) || 1)

async function api(token, method = 'GET', body, query = '') {
  const res = await fetch(`/api/admin${query}`, {
    method,
    headers: { Authorization: `Basic ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || String(res.status)), { status: res.status })
  return data
}

// Identifiants encodés pour l'en-tête Basic (UTF-8 compris)
const toToken = (email, pw) => btoa(String.fromCharCode(...new TextEncoder().encode(`${email.trim()}:${pw}`)))

function Login({ onLogin, error, busy }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  return (
    <div className="adm-login">
      <form onSubmit={e => { e.preventDefault(); onLogin(toToken(email, pw)) }}>
        <img src="/logo/masters-xv-logo-couleur.svg" alt="Masters XV" width="90" height="122" />
        <h1>Tableau de bord</h1>
        <p>Inscriptions Masters XV</p>
        <label>E-mail
          <input type="email" autoComplete="username" autoFocus value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>Mot de passe
          <input type="password" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} required />
        </label>
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button className="btn btn-gold btn-block" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</button>
      </form>
    </div>
  )
}

async function exportExcel(rows) {
  const { default: writeExcelFile } = await import('write-excel-file/browser')
  const head = text => ({ value: text, fontWeight: 'bold', textColor: '#FFFFFF', backgroundColor: '#0A3A20' })
  const columns = [
    { header: head('Date'), width: 18, cell: r => ({ value: new Date(r.created_at), type: Date, format: 'dd/mm/yyyy hh:mm' }) },
    { header: head('Statut'), width: 12, cell: r => ({ value: STATUS[r.status] || r.status }) },
    { header: head('Prénom'), width: 16, cell: r => ({ value: r.first_name }) },
    { header: head('Nom'), width: 18, cell: r => ({ value: r.last_name }) },
    { header: head('Société'), width: 24, cell: r => ({ value: r.company || '' }) },
    { header: head('E-mail'), width: 30, cell: r => ({ value: r.email }) },
    { header: head('Téléphone'), width: 16, cell: r => ({ value: r.phone || '' }) },
    { header: head('Formule'), width: 22, cell: r => ({ value: r.offer_label || OFFER[r.offer] || r.offer }) },
    { header: head('Équipes'), width: 9, cell: r => ({ value: r.teams || '' }) },
    { header: head('Montant estimé (€)'), width: 18, cell: r => ({ value: (PRICE[r.offer] || 0) * teamCount(r.teams), type: Number, format: '#,##0 €' }) },
    { header: head('Reçu CERFA'), width: 12, cell: r => ({ value: r.needs_receipt ? 'Oui' : 'Non' }) },
    { header: head('Niveau'), width: 18, cell: r => ({ value: r.level || '' }) },
    { header: head('Langue'), width: 8, cell: r => ({ value: (r.lang || 'fr').toUpperCase() }) },
    { header: head('Message'), width: 40, cell: r => ({ value: r.message || '', wrap: true }) },
    { header: head('Notes internes'), width: 40, cell: r => ({ value: r.notes || '', wrap: true }) },
  ]
  const date = new Date().toISOString().slice(0, 10)
  await writeExcelFile(rows, { columns, sheet: 'Inscriptions', stickyRowsCount: 1 }).toFile(`masters-xv-inscriptions-${date}.xlsx`)
}

export default function Admin() {
  const [password, setPassword] = useState(session.get)
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [q, setQ] = useState('')
  const [offer, setOffer] = useState('')
  const [status, setStatus] = useState('')
  const [open, setOpen] = useState(null)
  const [exporting, setExporting] = useState(false)

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
      const data = await api(pw)
      setItems(data.items)
      session.set(pw); setPassword(pw)
    } catch (err) {
      if (err.status === 401) { session.del(); setPassword(''); setError('E-mail ou mot de passe incorrect.') }
      else if (err.message === 'admin-not-configured') setError('ADMIN_EMAIL ou ADMIN_PASSWORD n’est pas défini dans Vercel.')
      else if (err.message === 'db-not-configured') setError('Supabase n’est pas configuré (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).')
      else setError('Impossible de charger les inscriptions. Réessayez.')
    } finally { setBusy(false) }
  }, [])

  useEffect(() => { if (password) load(password) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const patch = async (id, changes) => {
    setItems(list => list.map(r => (r.id === id ? { ...r, ...changes } : r)))
    try {
      const { item } = await api(password, 'PATCH', { id, ...changes })
      setItems(list => list.map(r => (r.id === id ? item : r)))
    } catch { setError('La modification n’a pas été enregistrée.'); load(password) }
  }

  const remove = async r => {
    if (!window.confirm(`Supprimer définitivement la demande de ${r.first_name} ${r.last_name} ?`)) return
    try {
      await api(password, 'DELETE', null, `?id=${r.id}`)
      setItems(list => list.filter(x => x.id !== r.id)); setOpen(null)
    } catch { setError('La suppression a échoué.') }
  }

  const filtered = useMemo(() => {
    if (!items) return []
    const s = q.trim().toLowerCase()
    return items.filter(r =>
      (!offer || r.offer === offer) &&
      (!status || r.status === status) &&
      (!s || [r.first_name, r.last_name, r.company, r.email, r.phone].some(v => (v || '').toLowerCase().includes(s))))
  }, [items, q, offer, status])

  const stats = useMemo(() => {
    const list = (items || []).filter(r => r.status !== 'annule')
    const teams = list.reduce((n, r) => n + teamCount(r.teams), 0)
    const amount = list.reduce((n, r) => n + (PRICE[r.offer] || 0) * teamCount(r.teams), 0)
    const paid = list.filter(r => r.status === 'paye').reduce((n, r) => n + (PRICE[r.offer] || 0) * teamCount(r.teams), 0)
    return {
      total: list.length,
      sponsors: list.filter(r => r.offer === 'sponsor').length,
      teams, players: teams * 4, amount, paid,
      cerfa: list.filter(r => r.needs_receipt).length,
      todo: list.filter(r => r.status === 'nouveau').length,
    }
  }, [items])

  if (!items) return <Login onLogin={load} error={error} busy={busy} />

  const current = open && items.find(r => r.id === open)

  return (
    <div className="adm">
      <header className="adm-top">
        <div className="adm-brand">
          <img src="/logo/masters-xv-logo-couleur.svg" alt="" width="34" height="46" />
          <div><strong>Masters XV</strong><span>Tableau de bord des inscriptions</span></div>
        </div>
        <div className="adm-top-actions">
          <button className="adm-btn" onClick={() => load(password)} disabled={busy}>{busy ? 'Actualisation…' : 'Actualiser'}</button>
          <button className="adm-btn adm-btn-gold" disabled={!filtered.length || exporting}
            onClick={async () => { setExporting(true); try { await exportExcel(filtered) } finally { setExporting(false) } }}>
            {exporting ? 'Export…' : `Exporter Excel (${filtered.length})`}
          </button>
          <button className="adm-btn adm-btn-ghost" onClick={() => { session.del(); setPassword(''); setItems(null) }}>Déconnexion</button>
        </div>
      </header>

      <main className="adm-main">
        {error && <p className="adm-error adm-banner" role="alert">{error}</p>}

        <section className="adm-stats">
          <div><span>Demandes</span><strong>{stats.total}</strong><small>{stats.todo} à traiter</small></div>
          <div><span>Sponsors</span><strong>{stats.sponsors}</strong><small>formule 3 000 €</small></div>
          <div><span>Équipes</span><strong>{stats.teams}</strong><small>{stats.players} joueurs</small></div>
          <div><span>Montant estimé</span><strong>{euro(stats.amount)}</strong><small>dont {euro(stats.paid)} payés</small></div>
          <div><span>Reçus CERFA</span><strong>{stats.cerfa}</strong><small>demandés</small></div>
        </section>

        <section className="adm-filters">
          <input type="search" placeholder="Rechercher un nom, une société, un e-mail…" value={q} onChange={e => setQ(e.target.value)} />
          <select value={offer} onChange={e => setOffer(e.target.value)}>
            <option value="">Toutes les formules</option>
            {Object.entries(OFFER).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </section>

        {filtered.length === 0 ? (
          <p className="adm-empty">{items.length ? 'Aucune demande ne correspond aux filtres.' : 'Aucune demande pour le moment.'}</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Date</th><th>Contact</th><th>Société</th><th>Formule</th><th>Équipes</th><th>CERFA</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} onClick={() => setOpen(r.id)} className={r.status === 'annule' ? 'is-cancelled' : ''}>
                    <td className="nowrap">{fmtDate(r.created_at)}</td>
                    <td>
                      <strong>{r.first_name} {r.last_name}</strong>
                      <a href={`mailto:${r.email}`} onClick={e => e.stopPropagation()}>{r.email}</a>
                      {r.phone && <a href={`tel:${r.phone.replace(/\s/g, '')}`} onClick={e => e.stopPropagation()}>{r.phone}</a>}
                    </td>
                    <td>{r.company || '—'}</td>
                    <td><span className={`adm-offer is-${r.offer}`}>{OFFER[r.offer] || r.offer}</span></td>
                    <td className="center">{r.teams || '—'}</td>
                    <td className="center">{r.needs_receipt ? '✓' : '—'}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <select className={`adm-status is-${r.status}`} value={r.status} onChange={e => patch(r.id, { status: e.target.value })}>
                        {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
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
            <p className="adm-kicker">{fmtDate(current.created_at)}</p>
            <h2>{current.first_name} {current.last_name}</h2>
            <dl>
              <dt>Société</dt><dd>{current.company || '—'}</dd>
              <dt>E-mail</dt><dd><a href={`mailto:${current.email}`}>{current.email}</a></dd>
              <dt>Téléphone</dt><dd>{current.phone ? <a href={`tel:${current.phone.replace(/\s/g, '')}`}>{current.phone}</a> : '—'}</dd>
              <dt>Formule</dt><dd>{current.offer_label || OFFER[current.offer]}</dd>
              <dt>Équipes</dt><dd>{current.teams || '—'}</dd>
              <dt>Niveau</dt><dd>{current.level || '—'}</dd>
              <dt>Reçu CERFA</dt><dd>{current.needs_receipt ? 'Oui' : 'Non'}</dd>
              <dt>Langue</dt><dd>{current.lang === 'en' ? 'Anglais' : 'Français'}</dd>
              <dt>Message</dt><dd className="pre">{current.message || '—'}</dd>
            </dl>
            <label className="adm-field">Statut
              <select value={current.status} onChange={e => patch(current.id, { status: e.target.value })}>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <NotesField key={current.id} value={current.notes || ''} onSave={notes => patch(current.id, { notes })} />
            <button className="adm-delete" onClick={() => remove(current)}>Supprimer cette demande</button>
          </aside>
        </div>
      )}
    </div>
  )
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
