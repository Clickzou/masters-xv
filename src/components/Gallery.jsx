import { useCallback, useEffect, useState } from 'react'
import { GALLERY } from '../content.js'

export default function Gallery() {
  const [open, setOpen] = useState(null) // index de la photo agrandie

  const close = useCallback(() => setOpen(null), [])
  const step = useCallback(d => setOpen(i => (i + d + GALLERY.length) % GALLERY.length), [])

  useEffect(() => {
    if (open === null) return
    const onKey = e => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, close, step])

  return (
    <>
      <div className="gallery">
        {GALLERY.map((p, i) => (
          <button
            key={p.src}
            className={`gallery-item reveal gi-${i + 1}`}
            data-reveal="zoom"
            style={{ '--d': `${i * 90}ms` }}
            onClick={() => setOpen(i)}
            aria-label={`Agrandir : ${p.caption}`}
          >
            <img src={p.src} alt={p.caption} loading="lazy" />
            <span className="gallery-caption">{p.caption}</span>
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={GALLERY[open].caption} onClick={close}>
          <figure onClick={e => e.stopPropagation()}>
            <img src={GALLERY[open].src} alt={GALLERY[open].caption} />
            <figcaption>
              <span>{GALLERY[open].caption}</span>
              <small>{open + 1} / {GALLERY.length}</small>
            </figcaption>
          </figure>
          <button className="lb-btn lb-prev" aria-label="Photo précédente" onClick={e => { e.stopPropagation(); step(-1) }}>‹</button>
          <button className="lb-btn lb-next" aria-label="Photo suivante" onClick={e => { e.stopPropagation(); step(1) }}>›</button>
          <button className="lb-btn lb-close" aria-label="Fermer" onClick={close}>×</button>
        </div>
      )}
    </>
  )
}
