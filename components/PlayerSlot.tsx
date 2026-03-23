import CardBack from './CardBack'

interface Props {
  name: string
  bid: number       // -1 = hasn't bid
  tricksWon: number
  cardCount: number
  isCurrentTurn: boolean
  isDisconnected: boolean
  position: 'top' | 'left' | 'right'
}

export default function PlayerSlot({ name, bid, tricksWon, cardCount, isCurrentTurn, isDisconnected, position }: Props) {
  const isHorizontal = position === 'left' || position === 'right'

  return (
    <div className={`flex flex-col items-center gap-1 ${isCurrentTurn ? 'ring-2 ring-orange-400 rounded-lg p-1' : ''}`}>
      <div className="flex items-center gap-1">
        <span className={`text-xs ${isDisconnected ? 'text-slate-600' : 'text-slate-300'}`}>{name}</span>
        {isDisconnected && <span className="text-xs text-red-500">●</span>}
      </div>
      <div className={`flex ${isHorizontal ? 'flex-col' : 'flex-row'} gap-px`}>
        {Array.from({ length: Math.min(cardCount, 5) }).map((_, i) => (
          <CardBack key={i} size="sm" rotated={isHorizontal} />
        ))}
        {cardCount > 5 && <span className="text-slate-500 text-xs self-center">×{cardCount - 5}</span>}
      </div>
      <span className="text-xs text-slate-500">
        {bid === -1 ? '?' : `bid ${bid}`} · won {tricksWon}
      </span>
    </div>
  )
}
