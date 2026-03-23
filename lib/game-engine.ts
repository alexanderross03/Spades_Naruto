import { Card, Player, Suit } from './types'
import { CARDS, cardValue } from './cards'

// Returns { p1: Card[], p2: Card[], p3: Card[], p4: Card[] }
// playerIds must be exactly 4 in seat order
export function deal(playerIds: string[] = ['p1', 'p2', 'p3', 'p4']): Record<string, Card[]> {
  const shuffled = [...CARDS]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const hands: Record<string, Card[]> = {}
  playerIds.forEach((id, i) => {
    hands[id] = shuffled.slice(i * 13, (i + 1) * 13)
  })
  return hands
}

/**
 * Returns true if the play is legal.
 * @param card       The card the player wants to play
 * @param hand       The player's current hand
 * @param ledSuit    The suit of the first card played this trick (null if leading)
 * @param spadesBroken  Whether spades have been played this round yet
 */
export function validatePlay(
  card: Card,
  hand: Card[],
  ledSuit: Suit | null,
  spadesBroken: boolean
): boolean {
  // Leading a trick
  if (ledSuit === null) {
    if (card.suit !== 'spades') return true
    // Can lead spades only if broken or only spades in hand
    return spadesBroken || hand.every(c => c.suit === 'spades')
  }
  // Following: must follow suit if possible
  const hasSuit = hand.some(c => c.suit === ledSuit)
  if (hasSuit) return card.suit === ledSuit
  return true  // can play anything if void in led suit
}

/**
 * Returns the playerId who wins the trick.
 */
export function resolveTrick(
  trick: { playerId: string; card: Card }[]
): string {
  const ledSuit = trick[0].card.suit
  // Find highest spade, or highest card of led suit
  const spades = trick.filter(p => p.card.suit === 'spades')
  const candidates = spades.length > 0 ? spades : trick.filter(p => p.card.suit === ledSuit)
  return candidates.reduce((best, p) =>
    cardValue(p.card) > cardValue(best.card) ? p : best
  ).playerId
}

/**
 * Calculates scores after a round completes.
 * Returns updated scores and bags.
 */
export function scoreRound(
  bids: Record<string, number>,
  tricksWon: Record<string, number>,
  players: Pick<Player, 'id' | 'seat'>[],
  currentBags: { team1: number; team2: number },
  currentScores: { team1: number; team2: number }
): { scores: { team1: number; team2: number }; bags: { team1: number; team2: number } } {
  const team1 = players.filter(p => p.seat % 2 === 0).map(p => p.id)
  const team2 = players.filter(p => p.seat % 2 === 1).map(p => p.id)

  function calcTeam(ids: string[], bags: number, score: number) {
    // Nil bids are scored separately; exclude from team bid/won
    const nilBidders = ids.filter(id => bids[id] === 0)
    const nonNilBidders = ids.filter(id => bids[id] > 0)
    const nonNilBid = nonNilBidders.reduce((s, id) => s + bids[id], 0)
    const nonNilWon = nonNilBidders.reduce((s, id) => s + tricksWon[id], 0)
    // Nil-breaker tricks count toward team total for bag purposes
    const nilBreakerTricks = nilBidders.reduce((s, id) => s + (tricksWon[id] ?? 0), 0)

    // Score nil bids
    let delta = 0
    nilBidders.forEach(id => {
      delta += (tricksWon[id] ?? 0) === 0 ? 100 : -100
    })

    // Score non-nil bid
    if (nonNilBid > 0) {
      // Include nil-breaker tricks in the team trick total for bag count
      const teamTricks = nonNilWon + nilBreakerTricks
      if (teamTricks >= nonNilBid) {
        const newBags = teamTricks - nonNilBid
        delta += nonNilBid * 10 + newBags  // bid × 10 + 1 per bag
        bags += newBags
      } else {
        delta -= nonNilBid * 10  // set
      }
    }

    score += delta

    // Bag penalty
    if (bags >= 10) {
      score -= 100
      bags -= 10
    }

    return { score, bags }
  }

  const t1 = calcTeam(team1, currentBags.team1, currentScores.team1)
  const t2 = calcTeam(team2, currentBags.team2, currentScores.team2)

  return {
    scores: { team1: t1.score, team2: t2.score },
    bags: { team1: t1.bags, team2: t2.bags },
  }
}

/** Returns true if spades have been broken by the given trick history */
export function checkSpadesBroken(completedTricks: { plays: { card: Card }[] }[]): boolean {
  return completedTricks.some(trick =>
    trick.plays.some(p => p.card.suit === 'spades')
  )
}
