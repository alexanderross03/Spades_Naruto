'use client'
import Card from './Card'
import { Card as CardType } from '@/lib/types'
import { validatePlay } from '@/lib/game-engine'
import { sortHand } from '@/lib/sort-hand'

interface Props {
  hand: CardType[]
  isMyTurn: boolean
  ledCard: CardType | null
  spadesBroken: boolean
  onPlay: (card: CardType) => void
}

export default function PlayerHand({ hand, isMyTurn, ledCard, spadesBroken, onPlay }: Props) {
  const sorted = sortHand(hand)

  return (
    <div className="flex flex-wrap justify-center gap-1 px-2">
      {sorted.map(card => {
        const playable = isMyTurn && validatePlay(card, hand, ledCard, spadesBroken)
        return (
          <Card
            key={`${card.suit}-${card.rank}`}
            card={card}
            onClick={playable ? () => onPlay(card) : undefined}
            disabled={isMyTurn && !playable}
            size="lg"
          />
        )
      })}
    </div>
  )
}
