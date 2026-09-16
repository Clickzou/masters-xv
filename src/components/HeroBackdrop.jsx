// Fond animé discret de l'accueil : trajectoires de balle dorées et silhouettes golf / rugby qui flottent
const RugbyBall = () => (
  <g fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M0,-40 C40,-30 40,30 0,40 C-40,30 -40,-30 0,-40 Z" />
    <path d="M0,-40 C-14,-20 -14,20 0,40" />
    <path d="M8,-16 v32 M2,-10 h12 M2,-2 h12 M2,6 h12" />
  </g>
)
const GolfBall = () => (
  <g fill="none" stroke="currentColor" strokeWidth="2">
    <circle r="26" />
    {[[-10, -10], [4, -14], [14, -2], [-2, 2], [-14, 6], [8, 12], [-4, 16]].map(([x, y]) => (
      <circle key={`${x}${y}`} cx={x} cy={y} r="2.6" />
    ))}
  </g>
)
const Flag = () => (
  <g fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M-10,44 V-44 L26,-32 L-10,-20" />
    <ellipse cx="-10" cy="44" rx="22" ry="5" />
  </g>
)

const FLOATERS = [
  { C: RugbyBall, x: 8, y: 22, s: 1.1, d: 0, t: 26 },
  { C: GolfBall, x: 22, y: 78, s: .9, d: -6, t: 22 },
  { C: Flag, x: 46, y: 14, s: .8, d: -12, t: 30 },
  { C: GolfBall, x: 58, y: 86, s: .7, d: -3, t: 24 },
  { C: RugbyBall, x: 88, y: 64, s: 1.3, d: -9, t: 28 },
  { C: Flag, x: 93, y: 20, s: 1, d: -17, t: 32 },
  { C: GolfBall, x: 72, y: 34, s: .6, d: -20, t: 20 },
]

export default function HeroBackdrop() {
  return (
    <div className="hero-backdrop" aria-hidden="true">
      <svg className="hb-arcs" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="arcGold" x1="0" x2="1">
            <stop offset="0" stopColor="#D9A83E" stopOpacity="0" />
            <stop offset=".5" stopColor="#D9A83E" stopOpacity=".55" />
            <stop offset="1" stopColor="#D9A83E" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path id="arc1" className="hb-arc" d="M-60,760 Q520,-120 1500,520" />
        <path id="arc2" className="hb-arc hb-arc-2" d="M-80,860 Q760,120 1520,760" />
        <circle r="4" className="hb-ball">
          <animateMotion dur="11s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".3 .1 .4 1">
            <mpath href="#arc1" />
          </animateMotion>
        </circle>
        <circle r="3" className="hb-ball hb-ball-2">
          <animateMotion dur="15s" begin="-6s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".3 .1 .4 1">
            <mpath href="#arc2" />
          </animateMotion>
        </circle>
      </svg>
      {FLOATERS.map(({ C, x, y, s, d, t }, i) => (
        <svg
          key={i}
          className="hb-float"
          viewBox="-50 -50 100 100"
          style={{ left: `${x}%`, top: `${y}%`, '--s': s, animationDelay: `${d}s`, animationDuration: `${t}s` }}
        >
          <C />
        </svg>
      ))}
    </div>
  )
}
