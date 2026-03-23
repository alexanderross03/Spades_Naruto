interface Props {
  size?: 'sm' | 'md' | 'lg'
  rotated?: boolean  // true for left/right opponent cards
}

const SIZES = {
  sm: { width: 40, height: 58 },
  md: { width: 56, height: 80 },
  lg: { width: 72, height: 104 },
}

export default function CardBack({ size = 'md', rotated }: Props) {
  const { width, height } = SIZES[size]
  const [w, h] = rotated ? [height, width] : [width, height]

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect width={w} height={h} rx={4} fill="#0f2e1a" stroke="#16a34a" strokeWidth={1.5} />
      <text
        x={w / 2} y={h / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#16a34a"
        fillOpacity={0.6}
        fontSize={Math.min(w, h) * 0.45}
      >
        🍃
      </text>
    </svg>
  )
}
