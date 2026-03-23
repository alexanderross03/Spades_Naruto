import { CARDS, getCard } from '@/lib/cards'

test('deck has exactly 52 cards', () => {
  expect(CARDS.length).toBe(52)
})

test('all character names are unique', () => {
  const names = CARDS.map(c => c.character)
  const unique = new Set(names)
  expect(unique.size).toBe(52)
})

test('each suit has exactly 13 cards', () => {
  const suits = ['spades', 'hearts', 'diamonds', 'clubs']
  suits.forEach(suit => {
    expect(CARDS.filter(c => c.suit === suit).length).toBe(13)
  })
})

test('getCard returns correct card', () => {
  const card = getCard('spades', 'A')
  expect(card.character).toBe('Naruto')
  expect(card.suit).toBe('spades')
})
