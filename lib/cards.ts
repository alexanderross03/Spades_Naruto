import { Card, Suit, Rank } from './types'

const SUIT_CHARACTERS: Record<Suit, Record<Rank, string>> = {
  spades: {
    'A': 'Naruto', 'K': 'Minato', 'Q': 'Tsunade', 'J': 'Kakashi',
    '10': 'Sasuke', '9': 'Sakura', '8': 'Rock Lee', '7': 'Neji',
    '6': 'Hinata', '5': 'Shikamaru', '4': 'Choji', '3': 'Ino', '2': 'Kiba',
  },
  hearts: {
    'A': 'Gaara', 'K': '4th Kazekage', 'Q': 'Temari', 'J': 'Kankuro',
    '10': 'Chiyo', '9': 'Pakura', '8': 'Gari', '7': 'Baki',
    '6': 'Toroi', '5': 'Yugito', '4': 'Han', '3': 'Fū', '2': 'Rōshi',
  },
  diamonds: {
    'A': 'Pain', 'K': 'Madara', 'Q': 'Konan', 'J': 'Itachi',
    '10': 'Kabuto', '9': 'Orochimaru', '8': 'Hidan', '7': 'Kakuzu',
    '6': 'Zetsu', '5': 'Tobi', '4': 'Sasori', '3': 'Deidara', '2': 'Yahiko',
  },
  clubs: {
    'A': 'Zabuza', 'K': 'Yagura', 'Q': 'Mei', 'J': 'Mangetsu',
    '10': 'Suigetsu', '9': 'Chojuro', '8': 'Ao', '7': 'Utakata',
    '6': 'Kisame', '5': 'Tobirama', '4': 'Gengetsu', '3': 'Kagami', '2': 'Haku',
  },
}

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']
const RANKS: Rank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']

export const CARDS: Card[] = SUITS.flatMap(suit =>
  RANKS.map(rank => ({ suit, rank, character: SUIT_CHARACTERS[suit][rank] }))
)

export function getCard(suit: Suit, rank: Rank): Card {
  const card = CARDS.find(c => c.suit === suit && c.rank === rank)
  if (!card) throw new Error(`Card not found: ${suit} ${rank}`)
  return card
}

// Numeric value for trick resolution (higher = better)
const RANK_VALUE: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
}

export function cardValue(card: Card): number {
  return RANK_VALUE[card.rank]
}

export const SUIT_COLORS: Record<Suit, string> = {
  spades: '#16a34a',    // Leaf green
  hearts: '#f59e0b',    // Sand amber
  diamonds: '#dc2626',  // Akatsuki red
  clubs: '#3b82f6',     // Mist blue
}

export const SUIT_FACTION: Record<Suit, string> = {
  spades: 'Hidden Leaf',
  hearts: 'Hidden Sand',
  diamonds: 'Akatsuki',
  clubs: 'Hidden Mist',
}
