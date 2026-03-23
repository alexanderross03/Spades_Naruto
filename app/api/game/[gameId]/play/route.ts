import { NextResponse } from 'next/server'
import { getGame, setGame, getHands, setHands } from '@/lib/kv'
import { pusher, gameChannel } from '@/lib/pusher-server'
import { validatePlay, resolveTrick, scoreRound, checkSpadesBroken } from '@/lib/game-engine'
import { Card, Suit } from '@/lib/types'

export async function POST(req: Request, { params }: { params: { gameId: string } }) {
  const { playerId, card }: { playerId: string; card: Card } = await req.json()
  const [state, hands] = await Promise.all([
    getGame(params.gameId),
    getHands(params.gameId),
  ])
  if (!state || !hands) return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  if (state.status !== 'playing') return NextResponse.json({ error: 'Not playing phase' }, { status: 400 })

  const currentSeat = state.currentTrick.length === 0
    ? state.players.find(p => p.id === state.trickLeader)!.seat
    : (state.players.find(p => p.id === state.currentTrick[state.currentTrick.length - 1].playerId)!.seat + 1) % 4
  const expectedPlayer = state.players.find(p => p.seat === currentSeat)!
  if (expectedPlayer.id !== playerId) return NextResponse.json({ error: 'Not your turn' }, { status: 400 })

  const hand = hands[playerId]
  const ledSuit = state.currentTrick.length > 0 ? state.currentTrick[0].card.suit as Suit : null
  const spadesBroken = checkSpadesBroken(state.completedTricks)

  if (!validatePlay(card, hand, ledSuit, spadesBroken)) {
    return NextResponse.json({ error: 'Invalid play' }, { status: 400 })
  }

  // Remove card from hand
  hands[playerId] = hand.filter(c => !(c.suit === card.suit && c.rank === card.rank))
  state.currentTrick.push({ playerId, card })

  await pusher.trigger(gameChannel(params.gameId), 'card-played', { playerId, card })

  if (state.currentTrick.length === 4) {
    // Resolve trick
    const winner = resolveTrick(state.currentTrick)
    state.completedTricks.push({ plays: state.currentTrick, winner })
    state.tricksWon[winner] = (state.tricksWon[winner] ?? 0) + 1
    state.trickLeader = winner
    state.currentTrick = []

    await pusher.trigger(gameChannel(params.gameId), 'trick-complete', {
      winner,
      tricksWon: state.tricksWon,
    })

    if (state.completedTricks.length === 13) {
      // Round over
      const { scores, bags } = scoreRound(
        state.bids, state.tricksWon, state.players, state.bags, state.scores
      )
      state.scores = scores
      state.bags = bags

      const isGameOver = scores.team1 >= 500 || scores.team2 >= 500
        || scores.team1 <= -200 || scores.team2 <= -200

      state.status = isGameOver ? 'game_end' : 'round_end'
      state.dealer = (state.dealer + 1) % 4

      await setGame(params.gameId, state)
      await setHands(params.gameId, hands)

      if (isGameOver) {
        // Determine winner by which team hit the winning threshold (or avoided the losing one)
        const t1wins = scores.team1 >= 500 || scores.team2 <= -200
        const t2wins = scores.team2 >= 500 || scores.team1 <= -200
        const winner: 'team1' | 'team2' =
          t1wins && !t2wins ? 'team1' :
          t2wins && !t1wins ? 'team2' :
          scores.team1 >= scores.team2 ? 'team1' : 'team2'  // tie-break by score
        await pusher.trigger(gameChannel(params.gameId), 'game-over', { winner, scores })
      } else {
        await pusher.trigger(gameChannel(params.gameId), 'round-complete', {
          scores, bags, bids: state.bids, tricksWon: state.tricksWon,
        })
      }
      return NextResponse.json({ ok: true })
    }
  }

  await setGame(params.gameId, state)
  await setHands(params.gameId, hands)
  return NextResponse.json({ ok: true })
}
