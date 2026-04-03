interface Props {
  size?: 'sm' | 'md' | 'lg'
  rotated?: boolean
}

const SIZES = {
  sm: { w: 54, h: 76, rx: 4 },
  md: { w: 72, h: 100, rx: 5 },
  lg: { w: 100, h: 140, rx: 6 },
}

export default function CardBack({ size = 'md', rotated }: Props) {
  const { w: bw, h: bh, rx } = SIZES[size]
  const [w, h] = rotated ? [bh, bw] : [bw, bh]
  const uid = `back-${size}-${rotated ? 'r' : 'n'}`
  const cx = w / 2
  const cy = h / 2
  const spiralR = Math.min(w, h) * 0.28

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
      <defs>
        <radialGradient id={`bbg-${uid}`} cx="50%" cy="40%" r="80%">
          <stop offset="0%" stopColor="#1a0d00" />
          <stop offset="100%" stopColor="#060200" />
        </radialGradient>
        <radialGradient id={`bglow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(249,115,22,0.3)" stopOpacity="1" />
          <stop offset="100%" stopColor="rgba(249,115,22,0)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width={w} height={h} rx={rx} fill={`url(#bbg-${uid})`} />

      {/* Glow */}
      <ellipse cx={cx} cy={cy} rx={spiralR * 2} ry={spiralR * 1.8} fill={`url(#bglow-${uid})`} />

      {/* Outer border */}
      <rect width={w} height={h} rx={rx} fill="none" stroke="#f97316" strokeWidth={1.2} strokeOpacity={0.55} />
      {/* Inner border */}
      <rect x={3} y={3} width={w - 6} height={h - 6} rx={rx - 1} fill="none" stroke="#f97316" strokeWidth={0.5} strokeOpacity={0.22} />

      {/* Corner diamonds */}
      {([8, w - 8] as number[]).map(dx =>
        ([8, h - 8] as number[]).map(dy => (
          <path key={`${dx}-${dy}`}
            d={`M ${dx} ${dy - 3.5} L ${dx + 3.5} ${dy} L ${dx} ${dy + 3.5} L ${dx - 3.5} ${dy} Z`}
            fill="#f97316" fillOpacity={0.38}
          />
        ))
      )}

      {/* Uzumaki spiral (concentric semicircle approximation) */}
      <g transform={`translate(${cx},${cy})`}>
        <circle r={spiralR} fill="none" stroke="#f97316" strokeWidth={1.1} strokeOpacity={0.45} strokeDasharray="4 3" />
        <circle r={spiralR * 0.72} fill="none" stroke="#f97316" strokeWidth={1} strokeOpacity={0.45} strokeDasharray="3 2.5" />
        <circle r={spiralR * 0.46} fill="none" stroke="#f97316" strokeWidth={0.9} strokeOpacity={0.5} />
        <circle r={spiralR * 0.24} fill="none" stroke="#f97316" strokeWidth={0.8} strokeOpacity={0.55} />
        {/* Spiral arms */}
        <path
          d={`M ${spiralR * 0.24} 0
              A ${spiralR * 0.24} ${spiralR * 0.24} 0 1 0 0 ${spiralR * 0.48}
              A ${spiralR * 0.48} ${spiralR * 0.48} 0 1 0 ${-spiralR * 0.72} 0
              A ${spiralR * 0.72} ${spiralR * 0.72} 0 1 0 0 ${-spiralR}`}
          fill="none" stroke="#f97316" strokeWidth={1.5} strokeLinecap="round" strokeOpacity={0.85}
        />
        <circle r={2} fill="#f97316" fillOpacity={0.9} />
      </g>
    </svg>
  )
}
