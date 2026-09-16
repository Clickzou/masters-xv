// Les collines du logo en transition vers la section suivante (base = couleur de cette section)
export default function Fairways({ className = '', base }) {
  return (
    <svg className={`fairways ${className}`} viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,52 Q360,0 720,60 Q1080,-6 1440,48 L1440,82 Q1080,30 720,92 Q360,36 0,86 Z" fill="var(--fairway)" />
      <path d="M0,104 Q360,58 720,112 Q1080,52 1440,100 L1440,160 L0,160 Z" fill="var(--fairway-2)" />
      <path d="M0,138 Q360,104 720,146 Q1080,100 1440,134 L1440,161 L0,161 Z" fill={base} />
    </svg>
  )
}
