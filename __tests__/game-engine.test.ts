import { deal, validatePlay, resolveTrick, scoreRound } from '@/lib/game-engine'
import { CARDS } from '@/lib/cards'
import { Card, GameState } from '@/lib/types'

// --- deal ---
test('deal produces 4 hands of 13 cards', () => {
  const hands = deal()
  const playerIds = ['p1', 'p2', 'p3', 'p4']
  expect(Object.keys(hands).length).toBe(4)
  playerIds.forEach(id => {
    expect(hands[id].length).toBe(13)
  })
})

test('deal distributes all 52 cards with no duplicates', () => {
  const hands = deal()
  const all = Object.values(hands).flat()
  expect(all.length).toBe(52)
  const keys = all.map(c => `${c.suit}-${c.rank}`)
  expect(new Set(keys).size).toBe(52)
})

// --- validatePlay ---
const spadeCard: Card = { suit: 'spades', rank: 'A', character: 'Naruto' }
const heartCard: Card = { suit: 'hearts', rank: 'K', character: 'Gaara' }
const clubCard: Card = { suit: 'clubs', rank: '2', character: 'Haku' }

test('validatePlay: can lead any non-spade when spades not broken', () => {
  const hand = [heartCard, clubCard]
  expect(validatePlay(heartCard, hand, null, false)).toBe(true)
})

test('validatePlay: cannot lead spades when not broken and have other suits', () => {
  const hand = [spadeCard, heartCard]
  expect(validatePlay(spadeCard, hand, null, false)).toBe(false)
})

test('validatePlay: must follow suit if possible', () => {
  const hand = [heartCard, spadeCard]
  expect(validatePlay(spadeCard, hand, 'hearts', false)).toBe(false)
})

test('validatePlay: can play any card if cannot follow suit', () => {
  const hand = [spadeCard]
  expect(validatePlay(spadeCard, hand, 'hearts', false)).toBe(true)
})

test('validatePlay: can lead spades if only spades remain', () => {
  const hand = [spadeCard]
  expect(validatePlay(spadeCard, hand, null, false)).toBe(true)
})

// --- resolveTrick ---
test('resolveTrick: highest card of led suit wins', () => {
  const trick = [
    { playerId: 'p1', card: { suit: 'hearts' as const, rank: 'K' as const, character: 'Gaara' } },
    { playerId: 'p2', card: { suit: 'hearts' as const, rank: 'A' as const, character: 'Temari' } },
    { playerId: 'p3', card: { suit: 'clubs' as const, rank: 'A' as const, character: 'Zabuza' } },
    { playerId: 'p4', card: { suit: 'hearts' as const, rank: '2' as const, character: 'Rōshi' } },
  ]
  expect(resolveTrick(trick)).toBe('p2')
})

test('resolveTrick: spade beats led suit', () => {
  const trick = [
    { playerId: 'p1', card: { suit: 'hearts' as const, rank: 'A' as const, character: 'Gaara' } },
    { playerId: 'p2', card: { suit: 'spades' as const, rank: '2' as const, character: 'Kiba' } },
    { playerId: 'p3', card: { suit: 'hearts' as const, rank: 'K' as const, character: '4th Kazekage' } },
    { playerId: 'p4', card: { suit: 'hearts' as const, rank: 'Q' as const, character: 'Temari' } },
  ]
  expect(resolveTrick(trick)).toBe('p2')
})

test('resolveTrick: highest spade wins when multiple spades played', () => {
  const trick = [
    { playerId: 'p1', card: { suit: 'spades' as const, rank: '2' as const, character: 'Kiba' } },
    { playerId: 'p2', card: { suit: 'spades' as const, rank: 'A' as const, character: 'Naruto' } },
    { playerId: 'p3', card: { suit: 'hearts' as const, rank: 'A' as const, character: 'Gaara' } },
    { playerId: 'p4', card: { suit: 'spades' as const, rank: 'K' as const, character: 'Minato' } },
  ]
  expect(resolveTrick(trick)).toBe('p2')
})

// --- scoreRound ---
test('scoreRound: team makes bid exactly — no bags', () => {
  // Team 1 = p1 + p3, bid 4+3=7, won 3+4=7
  const result = scoreRound(
    { p1: 4, p2: 3, p3: 3, p4: 4 },
    { p1: 3, p2: 4, p3: 4, p4: 3 },
    [
      { id: 'p1', name: 'A', seat: 0 },
      { id: 'p2', name: 'B', seat: 1 },
      { id: 'p3', name: 'C', seat: 2 },
      { id: 'p4', name: 'D', seat: 3 },
    ],
    { team1: 0, team2: 0 },
    { team1: 100, team2: 80 }
  )
  expect(result.scores.team1).toBe(170)  // 100 + 70
  expect(result.scores.team2).toBe(150)  // 80 + 70
  expect(result.bags.team1).toBe(0)
  expect(result.bags.team2).toBe(0)
})

test('scoreRound: team set (missed bid) loses 10x bid', () => {
  // Team 1 bid 7, won 5 → set, loses 70
  const result = scoreRound(
    { p1: 4, p2: 3, p3: 3, p4: 3 },
    { p1: 2, p2: 4, p3: 3, p4: 6 },
    [
      { id: 'p1', name: 'A', seat: 0 },
      { id: 'p2', name: 'B', seat: 1 },
      { id: 'p3', name: 'C', seat: 2 },
      { id: 'p4', name: 'D', seat: 3 },
    ],
    { team1: 0, team2: 0 },
    { team1: 200, team2: 150 }
  )
  expect(result.scores.team1).toBe(130)  // 200 - 70 (bid=7, won=5, set)
  expect(result.scores.team2).toBe(214)  // 150 + 64 (bid=6 × 10=60, + 4 bags × 1=4)
})

test('scoreRound: 10 bags triggers -100 penalty and resets bags', () => {
  // Team 1: p1 bid 2 won 5, p3 bid 2 won 3 → bid=4, won=8, 4 bags this round
  // Team 1 already has 8 bags → total 12 bags → penalty fires, bags reset to 2
  // Score: +40 (bid) + 4 (bags) - 100 (penalty) = -56 delta → 300 - 56 = 244
  // Team 2: p2 bid 3 won 3, p4 bid 2 won 2 → bid=5, won=5, made exactly, 0 bags
  const result = scoreRound(
    { p1: 2, p2: 3, p3: 2, p4: 2 },
    { p1: 5, p2: 3, p3: 3, p4: 2 },
    [
      { id: 'p1', name: 'A', seat: 0 },
      { id: 'p2', name: 'B', seat: 1 },
      { id: 'p3', name: 'C', seat: 2 },
      { id: 'p4', name: 'D', seat: 3 },
    ],
    { team1: 8, team2: 0 },
    { team1: 300, team2: 200 }
  )
  // Total bags earned: 4. Starting bags: 8. Total: 12. Penalty: -100. Remaining bags: 2.
  expect(result.bags.team1).toBe(2)
  // Score: 300 + 40 (4×10) + 4 (4 bags) - 100 (penalty) = 244
  expect(result.scores.team1).toBe(244)
  expect(result.bags.team2).toBe(0)
  expect(result.scores.team2).toBe(250)  // 200 + 50 (5×10, made exactly)
})
