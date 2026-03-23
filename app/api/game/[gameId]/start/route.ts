import { NextResponse } from 'next/server'
import { getGame, setGame, setHands } from '@/lib/kv'
import { pusher, gameChannel, privateChannel } from '@/lib/pusher-server'
import { deal } from '@/lib/game-engine'

export async function POST(req: Request, { params }: { params: { gameId: string } }) {
  const { requesterId } = await req.json()
  const state = await getGame(params.gameId)
  if (!state) return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  if (state.hostId !== requesterId) return NextResponse.json({ error: 'Only host can start' }, { status: 403 })
  if (state.players.length < 4) return NextResponse.json({ error: 'Need 4 players' }, { status: 400 })

  const playerIds = state.players.map(p => p.id)
  const hands = deal(playerIds)
  await setHands(params.gameId, hands)

  const bids: Record<string, number> = {}
  const tricksWon: Record<string, number> = {}
  playerIds.forEach(id => { bids[id] = -1; tricksWon[id] = 0 })

  // Increment round counter BEFORE mutating status
  if (state.status === 'round_end') {
    state.round += 1
  }
  state.status = 'bidding'
  state.bids = bids
  state.tricksWon = tricksWon
  state.currentTrick = []
  state.completedTricks = []
  // First bidder is dealer+1
  const firstBidder = state.players[(state.dealer + 1) % 4]
  state.trickLeader = firstBidder.id
  await setGame(params.gameId, state)

  // Send each player their hand privately
  await Promise.all(playerIds.map(id =>
    pusher.trigger(privateChannel(id), 'game-started', { hand: hands[id] })
  ))

  await pusher.trigger(gameChannel(params.gameId), 'bidding-started', {
    currentBidder: firstBidder.id,
    players: state.players,
  })

  return NextResponse.json({ ok: true })
}
