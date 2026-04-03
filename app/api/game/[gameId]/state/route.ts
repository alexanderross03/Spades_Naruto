import { NextResponse } from 'next/server'
import { getGame, getHands } from '@/lib/kv'
import { pusher, privateChannel } from '@/lib/pusher-server'

export async function GET(req: Request, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params
  const { searchParams } = new URL(req.url)
  const playerId = searchParams.get('playerId')

  const [state, hands] = await Promise.all([
    getGame(gameId),
    getHands(gameId),
  ])
  if (!state) return NextResponse.json({ error: 'Game not found' }, { status: 404 })

  // Re-send this player's hand privately if game has started (for Pusher listeners)
  if (playerId && hands && hands[playerId]) {
    await pusher.trigger(privateChannel(playerId), 'hand-restored', {
      hand: hands[playerId],
      gameState: state,
    })
  }

  const hand = playerId && hands ? (hands[playerId] ?? null) : null
  return NextResponse.json({ state, hand })
}
