'use client'
import Card from './Card'
import { Card as CardType, Suit } from '@/lib/types'
import { validatePlay } from '@/lib/game-engine'

interface Props {
  hand: CardType[]
  isMyTurn: boolean
  ledSuit: Suit | null
  spadesBroken: boolean
  onPlay: (card: CardType) => void
}

export default function PlayerHand({ hand, isMyTurn, ledSuit, spadesBroken, onPlay }: Props) {
  const sorted = [...hand].sort((a, b) => {
    const suitOrder = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 }
    if (a.suit !== b.suit) return suitOrder[a.suit] - suitOrder[b.suit]
    const rankOrder = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
    return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank)
  })

  return (
    <div className="flex flex-wrap justify-center gap-1 px-2">
      {sorted.map(card => {
        const playable = isMyTurn && validatePlay(card, hand, ledSuit, spadesBroken)
        return (
          <Card
            key={`${card.suit}-${card.rank}`}
            card={card}
            onClick={playable ? () => onPlay(card) : undefined}
            disabled={isMyTurn && !playable}
            size="md"
          />
        )
      })}
    </div>
  )
}
