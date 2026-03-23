import { NextResponse } from 'next/server'
import { getGame, setGame } from '@/lib/kv'
import { pusher, gameChannel } from '@/lib/pusher-server'

export async function POST(req: Request, { params }: { params: { gameId: string } }) {
  const { playerId, bid } = await req.json()
  const state = await getGame(params.gameId)
  if (!state) return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  if (state.status !== 'bidding') return NextResponse.json({ error: 'Not bidding phase' }, { status: 400 })
  if (bid < 0 || bid > 13) return NextResponse.json({ error: 'Invalid bid' }, { status: 400 })

  state.bids[playerId] = bid
  const allBid = state.players.every(p => state.bids[p.id] >= 0)

  if (allBid) {
    state.status = 'playing'
    // Trick leader is dealer+1
    const leader = state.players[(state.dealer + 1) % 4]
    state.trickLeader = leader.id
  }

  await setGame(params.gameId, state)
  await pusher.trigger(gameChannel(params.gameId), 'bid-submitted', { playerId, bid })

  if (allBid) {
    await pusher.trigger(gameChannel(params.gameId), 'all-bids-in', {
      bids: state.bids,
      trickLeader: state.trickLeader,
    })
  } else {
    // Next bidder is next seat clockwise from current bidder
    const currentSeat = state.players.find(p => p.id === playerId)!.seat
    const nextPlayer = state.players.find(p => p.seat === (currentSeat + 1) % 4)!
    await pusher.trigger(gameChannel(params.gameId), 'bidding-started', {
      currentBidder: nextPlayer.id,
      players: state.players,
    })
  }

  return NextResponse.json({ ok: true })
}
