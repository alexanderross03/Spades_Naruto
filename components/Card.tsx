import { Card as CardType } from '@/lib/types'
import { SUIT_COLORS, SUIT_FACTION } from '@/lib/cards'

interface Props {
  card: CardType
  onClick?: () => void
  disabled?: boolean
  selected?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { width: 40, height: 58, rankSize: 11, nameSize: 7 },
  md: { width: 56, height: 80, rankSize: 16, nameSize: 9 },
  lg: { width: 72, height: 104, rankSize: 20, nameSize: 11 },
}

export default function Card({ card, onClick, disabled, selected, size = 'md' }: Props) {
  const color = SUIT_COLORS[card.suit]
  const { width, height, rankSize, nameSize } = SIZES[size]

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      onClick={disabled ? undefined : onClick}
      style={{ cursor: disabled ? 'default' : onClick ? 'pointer' : 'default' }}
      className={`transition-transform ${selected ? '-translate-y-3' : ''} ${onClick && !disabled ? 'hover:-translate-y-2' : ''}`}
    >
      {/* Card background */}
      <rect width={width} height={height} rx={4} fill="#1e293b" stroke={color} strokeWidth={selected ? 2.5 : 1.5} />

      {/* Faction watermark */}
      <text
        x={width / 2} y={height / 2 + 8}
        textAnchor="middle"
        fill={color}
        fillOpacity={0.12}
        fontSize={nameSize * 2.5}
        fontWeight="bold"
      >
        {card.suit === 'spades' ? '🍃' : card.suit === 'hearts' ? '🏜️' : card.suit === 'diamonds' ? '👁️' : '🌊'}
      </text>

      {/* Rank — top left */}
      <text x={5} y={rankSize + 2} fill={color} fontSize={rankSize} fontWeight="bold" fontFamily="monospace">
        {card.rank}
      </text>

      {/* Character name — centered */}
      <text
        x={width / 2} y={height / 2 + 2}
        textAnchor="middle"
        fill="#e2e8f0"
        fontSize={nameSize}
        fontFamily="sans-serif"
      >
        {card.character.length > 10 ? card.character.substring(0, 9) + '…' : card.character}
      </text>

      {/* Rank — bottom right (rotated) */}
      <text
        x={width - 5} y={height - 4}
        textAnchor="end"
        fill={color}
        fontSize={rankSize}
        fontWeight="bold"
        fontFamily="monospace"
        transform={`rotate(180, ${width - 5}, ${height - 4})`}
      >
        {card.rank}
      </text>

      {/* Disabled overlay */}
      {disabled && <rect width={width} height={height} rx={4} fill="black" fillOpacity={0.45} />}
    </svg>
  )
}
