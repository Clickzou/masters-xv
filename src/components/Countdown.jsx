import { useEffect, useState } from 'react'

const pad = n => String(n).padStart(2, '0')

export default function Countdown({ target }) {
  const end = new Date(target).getTime()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = Math.max(0, end - now)
  if (diff === 0) return null

  const units = [
    [Math.floor(diff / 86400000), 'jours'],
    [Math.floor(diff / 3600000) % 24, 'heures'],
    [Math.floor(diff / 60000) % 60, 'minutes'],
    [Math.floor(diff / 1000) % 60, 'secondes'],
  ]

  return (
    <div className="countdown" role="timer" aria-label="Compte à rebours avant le départ">
      {units.map(([v, label]) => (
        <div key={label}>
          <strong>{label === 'jours' ? v : pad(v)}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
