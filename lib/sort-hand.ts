import { Card } from './types'

// The 2♦ (Madara) counts as a spade for sorting purposes.
// Full order: Jokers → Spades (with 2♦ at top) → Hearts → Diamonds → Clubs
function suitSortKey(card: Card): number {
  if (card.suit === 'joker') return 0
  if (card.suit === 'spades') return 1
  if (card.suit === 'diamonds' && card.rank === '2') return 1  // groups with spades
  if (card.suit === 'hearts') return 2
  if (card.suit === 'diamonds') return 3
  return 4  // clubs
}

const RANK_ORDER = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', 'LJ', 'HJ']

// Special trump rank within the spades group: HJ > LJ > 2♠ > 2♦ > A♠ …
function rankSortKey(card: Card): number {
  if (card.rank === 'HJ') return 100
  if (card.rank === 'LJ') return 99
  if (card.suit === 'spades' && card.rank === '2') return 16
  if (card.suit === 'diamonds' && card.rank === '2') return 15
  return RANK_ORDER.indexOf(card.rank)
}

export function sortHand(hand: Card[]): Card[] {
  return [...hand].sort((a, b) => {
    const sd = suitSortKey(a) - suitSortKey(b)
    if (sd !== 0) return sd
    return rankSortKey(a) - rankSortKey(b)
  })
}
