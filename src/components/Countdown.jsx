import { useEffect, useState } from 'react'
import { useT } from '../i18n.jsx'

const pad = n => String(n).padStart(2, '0')

export default function Countdown({ target }) {
  const t = useT()
  const end = new Date(target).getTime()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = Math.max(0, end - now)
  if (diff === 0) return null

  const [d, h, m, s] = t.countdown.units
  const units = [
    [Math.floor(diff / 86400000), d, true],
    [Math.floor(diff / 3600000) % 24, h],
    [Math.floor(diff / 60000) % 60, m],
    [Math.floor(diff / 1000) % 60, s],
  ]

  return (
    <div className="countdown" role="timer" aria-label={t.countdown.label}>
      {units.map(([v, label, isDays]) => (
        <div key={label}>
          <strong>{isDays ? v : pad(v)}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
