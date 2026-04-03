'use client'
import { Card as CardType, Suit } from '@/lib/types'
import { CHARACTER_IMAGES, CHARACTER_IMAGE_ADJUSTMENTS, LOCAL_IMAGE_OVERRIDES } from '@/lib/character-images'

interface Props {
  card: CardType
  onClick?: () => void
  disabled?: boolean
  selected?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const THEMES: Record<Suit, { bg1: string; bg2: string; color: string; glowColor: string; faction: string }> = {
  spades: {
    bg1: '#040e08', bg2: '#0a2014',
    color: '#4ade80', glowColor: 'rgba(74,222,128,0.18)',
    faction: 'HIDDEN LEAF',
  },
  hearts: {
    bg1: '#100800', bg2: '#251500',
    color: '#fbbf24', glowColor: 'rgba(251,191,36,0.18)',
    faction: 'HIDDEN SAND',
  },
  diamonds: {
    bg1: '#0e0204', bg2: '#280408',
    color: '#f87171', glowColor: 'rgba(248,113,113,0.18)',
    faction: 'AKATSUKI',
  },
  clubs: {
    bg1: '#010810', bg2: '#041428',
    color: '#60a5fa', glowColor: 'rgba(96,165,250,0.18)',
    faction: 'HIDDEN MIST',
  },
  joker: {
    bg1: '#0f0600', bg2: '#1f0e00',
    color: '#f97316', glowColor: 'rgba(249,115,22,0.25)',
    faction: 'SHINOBI WORLD',
  },
}

const SIZES = {
  sm: { w: 54,  h: 76,  rx: 4, rankFont: 14, nameFont: 6.5, artR: 14 },
  md: { w: 72,  h: 100, rx: 5, rankFont: 18, nameFont: 8,   artR: 18 },
  lg: { w: 100, h: 140, rx: 6, rankFont: 24, nameFont: 10,  artR: 25 },
}

// Image area per size (x, y, w, h)
const IMG_AREA = {
  sm: { x: 5,  y: 18, w: 44, h: 36 },
  md: { x: 6,  y: 23, w: 60, h: 50 },
  lg: { x: 7,  y: 30, w: 86, h: 70 },
}

function FactionArt({ suit, r, color }: { suit: Suit; r: number; color: string }) {
  const s = r / 18

  if (suit === 'spades') {
    return (
      <g>
        <circle r={r} fill="none" stroke={color} strokeWidth={s * 0.6} strokeOpacity={0.25} />
        <path
          d={`M 0 ${-r * 0.88} C ${-r * 0.65} ${-r * 0.5} ${-r * 0.65} ${r * 0.28} 0 ${r * 0.38} C ${r * 0.65} ${r * 0.28} ${r * 0.65} ${-r * 0.5} 0 ${-r * 0.88}Z`}
          fill="none" stroke={color} strokeWidth={1.4 * s}
        />
        <line x1={0} y1={-r * 0.88} x2={0} y2={r * 0.38} stroke={color} strokeWidth={s * 0.8} />
        <path d={`M 0 ${-r * 0.35} C ${-r * 0.38} ${-r * 0.22} ${-r * 0.58} ${-r * 0.04} ${-r * 0.6} ${r * 0.18}`}
          fill="none" stroke={color} strokeWidth={s * 0.7} />
        <path d={`M 0 ${-r * 0.35} C ${r * 0.38} ${-r * 0.22} ${r * 0.58} ${-r * 0.04} ${r * 0.6} ${r * 0.18}`}
          fill="none" stroke={color} strokeWidth={s * 0.7} />
        <line x1={0} y1={r * 0.38} x2={0} y2={r * 0.68} stroke={color} strokeWidth={1.4 * s} strokeLinecap="round" />
        <path d={`M ${r * 0.24} ${r * 0.68} A ${r * 0.24} ${r * 0.24} 0 1 0 0 ${r * 0.92}`}
          fill="none" stroke={color} strokeWidth={1.1 * s} strokeLinecap="round" />
        <path d={`M ${r * 0.12} ${r * 0.68} A ${r * 0.12} ${r * 0.12} 0 1 0 0 ${r * 0.8}`}
          fill="none" stroke={color} strokeWidth={s * 0.8} strokeLinecap="round" />
      </g>
    )
  }

  if (suit === 'hearts') {
    return (
      <g>
        {[r * 0.45, r * 0.72, r * 0.98].map((rad, i) => (
          <path key={i}
            d={`M ${-rad} ${r * 0.12} A ${rad} ${rad} 0 0 1 ${rad} ${r * 0.12}`}
            fill="none" stroke={color} strokeWidth={(2.2 - i * 0.5) * s} strokeLinecap="round"
            strokeOpacity={1 - i * 0.1}
          />
        ))}
        {[-0.95, -0.55, 0, 0.55, 0.95].map((t, i) => (
          <line key={i} x1={0} y1={r * 0.55} x2={t * r * 0.98} y2={r * 0.12}
            stroke={color} strokeWidth={(i === 2 ? 1.1 : 0.7) * s} />
        ))}
        <line x1={0} y1={r * 0.55} x2={0} y2={r * 0.9} stroke={color} strokeWidth={1.8 * s} strokeLinecap="round" />
        <circle cy={r * 0.9} r={2.2 * s} fill={color} />
        <circle cy={r * 0.55} r={1.8 * s} fill={color} />
      </g>
    )
  }

  if (suit === 'diamonds') {
    return (
      <g>
        {[1, 0.68, 0.44, 0.22].map((scale, i) => (
          <circle key={i} r={r * scale} fill="none" stroke={color}
            strokeWidth={(i === 0 ? 1.6 : 1.1) * s} strokeOpacity={1 - i * 0.08} />
        ))}
        {[0, 60, 120].map(angle => {
          const rad = angle * Math.PI / 180
          return (
            <line key={angle}
              x1={Math.cos(rad) * r * 0.22} y1={Math.sin(rad) * r * 0.22}
              x2={Math.cos(rad) * r} y2={Math.sin(rad) * r}
              stroke={color} strokeWidth={s * 0.6} strokeOpacity={0.45} />
          )
        })}
        <circle r={3.5 * s} fill={color} />
      </g>
    )
  }

  return (
    <g>
      <circle r={r} fill="none" stroke={color} strokeWidth={s * 0.5} strokeOpacity={0.2} />
      {[-r * 0.42, 0, r * 0.42].map((yOff, i) => (
        <path key={i}
          d={`M ${-r * 0.95} ${yOff} C ${-r * 0.45} ${yOff - r * 0.38} ${r * 0.45} ${yOff + r * 0.38} ${r * 0.95} ${yOff}`}
          fill="none" stroke={color}
          strokeWidth={(i === 1 ? 2.2 : 1.5) * s}
          strokeLinecap="round"
          strokeOpacity={i === 1 ? 1 : 0.72} />
      ))}
      <circle r={3 * s} fill={color} fillOpacity={0.9} />
    </g>
  )
}

export default function Card({ card, onClick, disabled, selected, size = 'md' }: Props) {
  const theme = THEMES[card.suit as Suit]
  const { w, h, rx, rankFont, nameFont, artR } = SIZES[size]
  const imgArea = IMG_AREA[size]
  const uid = `${card.suit}-${card.rank}`
  const imageUrl = LOCAL_IMAGE_OVERRIDES[card.character] ?? CHARACTER_IMAGES[card.character] ?? null
  const imgAdj = CHARACTER_IMAGE_ADJUSTMENTS[card.character] ?? {}
  const artY = imageUrl ? imgArea.y + imgArea.h / 2 : h * 0.44

  const maxChars = size === 'sm' ? 8 : size === 'md' ? 11 : 14
  const displayName = card.character.length > maxChars
    ? card.character.substring(0, maxChars - 1) + '…'
    : card.character

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      onClick={disabled ? undefined : onClick}
      style={{ cursor: disabled ? 'default' : onClick ? 'pointer' : 'default', flexShrink: 0 }}
      className={`transition-all duration-150 ${selected ? '-translate-y-4' : ''} ${onClick && !disabled ? (selected ? 'hover:-translate-y-6' : 'hover:-translate-y-2') : ''}`}
    >
      <defs>
        <radialGradient id={`bg-${uid}`} cx="50%" cy="40%" r="80%">
          <stop offset="0%" stopColor={theme.bg2} />
          <stop offset="100%" stopColor={theme.bg1} />
        </radialGradient>
        <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={theme.glowColor} stopOpacity="1" />
          <stop offset="100%" stopColor={theme.glowColor} stopOpacity="0" />
        </radialGradient>
        {imageUrl && (
          <>
            {/* Clip to rounded rect for portrait */}
            <clipPath id={`imgclip-${uid}`}>
              <rect x={imgArea.x} y={imgArea.y} width={imgArea.w} height={imgArea.h} rx={3} />
            </clipPath>
            {/* Gradient overlay darkening the bottom of the portrait */}
            <linearGradient id={`imgfade-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="40%" stopColor={theme.bg1} stopOpacity="0" />
              <stop offset="100%" stopColor={theme.bg1} stopOpacity="0.88" />
            </linearGradient>
          </>
        )}
      </defs>

      {/* Card background */}
      <rect width={w} height={h} rx={rx} fill={`url(#bg-${uid})`} />

      {/* ── Portrait image (when available) ── */}
      {imageUrl ? (
        <>
          {/* Character portrait */}
          <image
            href={imageUrl}
            x={imgArea.x + (imgAdj.xShift ?? 0)}
            y={imgArea.y + (imgAdj.yShift ?? 0)}
            width={imgArea.w} height={imgArea.h}
            clipPath={`url(#imgclip-${uid})`}
            preserveAspectRatio="xMidYMin slice"
          />
          {/* Fade overlay so text is readable */}
          <rect
            x={imgArea.x} y={imgArea.y}
            width={imgArea.w} height={imgArea.h}
            rx={3}
            fill={`url(#imgfade-${uid})`}
            clipPath={`url(#imgclip-${uid})`}
          />
          {/* Colored border around portrait */}
          <rect
            x={imgArea.x} y={imgArea.y}
            width={imgArea.w} height={imgArea.h}
            rx={3} fill="none"
            stroke={theme.color} strokeWidth={0.8} strokeOpacity={0.5}
          />
        </>
      ) : (
        /* ── Faction art fallback ── */
        <>
          <ellipse cx={w / 2} cy={artY} rx={artR * 1.6} ry={artR * 1.4} fill={`url(#glow-${uid})`} />
          <g transform={`translate(${w / 2}, ${artY})`}>
            <FactionArt suit={card.suit as Suit} r={artR} color={theme.color} />
          </g>
        </>
      )}

      {/* ── Borders ── */}
      <rect width={w} height={h} rx={rx} fill="none"
        stroke={theme.color}
        strokeWidth={selected ? 2.5 : 1.2}
        strokeOpacity={selected ? 0.95 : 0.6}
      />
      <rect x={3} y={3} width={w - 6} height={h - 6} rx={rx - 1} fill="none"
        stroke={theme.color} strokeWidth={0.5} strokeOpacity={0.25}
      />

      {/* ── Rank top-left ── */}
      <text x={6} y={rankFont + 4} fill={theme.color} fontSize={card.suit === 'joker' ? rankFont * 0.72 : rankFont}
        fontWeight="bold" fontFamily="Georgia, 'Times New Roman', serif">
        {card.suit === 'joker' ? (card.rank === 'HJ' ? 'HIGH' : 'LOW') : card.rank}
      </text>
      {size !== 'sm' && (
        <text x={6} y={rankFont + 4 + nameFont * 1.2} fill={theme.color}
          fontSize={nameFont * 0.72} fontFamily="'Courier New', monospace" opacity={0.55}>
          {card.suit === 'spades' ? '♠' : card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '★'}
        </text>
      )}

      {/* ── Character name ── */}
      <text
        x={w / 2}
        y={imageUrl ? imgArea.y + imgArea.h - (size === 'sm' ? 3 : 5) : h - (size === 'sm' ? 11 : 16)}
        textAnchor="middle"
        fill="#f1f5f9" fontSize={nameFont}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.3"
        style={{ textShadow: '0 1px 3px #000' }}
      >
        {displayName}
      </text>

      {/* ── Faction label (below portrait or near bottom) ── */}
      {size !== 'sm' && (
        <text
          x={w / 2}
          y={imageUrl ? imgArea.y + imgArea.h + nameFont + 3 : h - 5}
          textAnchor="middle"
          fill={theme.color} fontSize={nameFont * 0.68}
          fontFamily="'Courier New', monospace"
          letterSpacing="1.5" opacity={0.65}>
          {theme.faction}
        </text>
      )}

      {/* ── Rank bottom-right ── */}
      <text
        x={w - 5} y={h - 5}
        textAnchor="end"
        dominantBaseline="auto"
        fill={theme.color} fontSize={card.suit === 'joker' ? rankFont * 0.72 : rankFont}
        fontWeight="bold" fontFamily="Georgia, 'Times New Roman', serif"
      >
        {card.suit === 'joker' ? (card.rank === 'HJ' ? 'HIGH' : 'LOW') : card.rank}
      </text>

      {/* ── Disabled overlay ── */}
      {disabled && <rect width={w} height={h} rx={rx} fill="black" fillOpacity={0.55} />}
    </svg>
  )
}
