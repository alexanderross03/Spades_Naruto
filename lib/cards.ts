import { Card, Suit, Rank } from './types'

const SUIT_CHARACTERS = {
  spades: {
    'A': 'Naruto', 'K': 'Minato', 'Q': 'Tsunade', 'J': 'Kakashi',
    '10': 'Sasuke', '9': 'Sakura', '8': 'Rock Lee', '7': 'Neji',
    '6': 'Hinata', '5': 'Shikamaru', '4': 'Choji', '3': 'Ino', '2': 'Might Guy',
  },
  hearts: {
    'A': 'Gaara', 'K': '4th Kazekage', 'Q': 'Temari', 'J': 'Kankuro',
    '10': 'Chiyo', '9': 'Pakura', '8': 'Gari', '7': 'Baki',
    '6': 'Toroi', '5': 'Yugito', '4': 'Han', '3': 'Fū',
    // 2 of hearts removed (replaced by jokers)
  },
  diamonds: {
    'A': 'Pain', 'K': 'Obito', 'Q': 'Konan', 'J': 'Itachi',
    '10': 'Kabuto', '9': 'Orochimaru', '8': 'Hidan', '7': 'Kakuzu',
    '6': 'Zetsu', '5': 'Tobi', '4': 'Sasori', '3': 'Deidara', '2': 'Madara',
  },
  clubs: {
    'A': 'Zabuza', 'K': 'Yagura', 'Q': 'Mei', 'J': 'Mangetsu',
    '10': 'Suigetsu', '9': 'Chojuro', '8': 'Ao', '7': 'Utakata',
    '6': 'Kisame', '5': 'Tobirama', '4': 'Gengetsu', '3': 'Kagami',
    // 2 of clubs removed (replaced by jokers)
  },
  joker: {
    'HJ': 'Naruto',  // High Joker
    'LJ': 'Sasuke',  // Low Joker
  },
} as const

const RANKS_PER_SUIT: Record<Suit, Rank[]> = {
  spades:   ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'],
  hearts:   ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3'],
  diamonds: ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'],
  clubs:    ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3'],
  joker:    ['HJ', 'LJ'],
}

const ALL_SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs', 'joker']

export const CARDS: Card[] = ALL_SUITS.flatMap(suit =>
  RANKS_PER_SUIT[suit].map(rank => ({
    suit,
    rank,
    character: (SUIT_CHARACTERS[suit] as Record<string, string>)[rank],
  }))
)

export function getCard(suit: Suit, rank: Rank): Card {
  const card = CARDS.find(c => c.suit === suit && c.rank === rank)
  if (!card) throw new Error(`Card not found: ${suit} ${rank}`)
  return card
}

// Numeric value for trick resolution (higher = better)
// Special cards: HJ=100, LJ=99, 2♠=16, 2♦=15, then normal Ace=14 down to 3=3
const RANK_VALUE: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  'LJ': 99, 'HJ': 100,
}

export function cardValue(card: Card): number {
  // Special high cards override the base rank value
  if (card.rank === 'HJ') return 100
  if (card.rank === 'LJ') return 99
  if (card.suit === 'spades' && card.rank === '2') return 16   // Might Guy > Ace of Spades
  if (card.suit === 'diamonds' && card.rank === '2') return 15  // Madara > Ace of Spades
  return RANK_VALUE[card.rank]
}

export const SUIT_COLORS: Record<Suit, string> = {
  spades:   '#16a34a',    // Leaf green
  hearts:   '#f59e0b',    // Sand amber
  diamonds: '#dc2626',    // Akatsuki red
  clubs:    '#3b82f6',    // Mist blue
  joker:    '#f97316',    // Blazing orange
}

export const SUIT_FACTION: Record<Suit, string> = {
  spades:   'Hidden Leaf',
  hearts:   'Hidden Sand',
  diamonds: 'Akatsuki',
  clubs:    'Hidden Mist',
  joker:    'Shinobi World',
}
