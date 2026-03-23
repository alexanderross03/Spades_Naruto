import { NextResponse } from 'next/server'
import { getGame, setGame } from '@/lib/kv'
import { pusher, gameChannel } from '@/lib/pusher-server'

export async function POST(req: Request, { params }: { params: { gameId: string } }) {
  const { requesterId, seatA, seatB } = await req.json()
  const state = await getGame(params.gameId)
  if (!state) return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  if (state.hostId !== requesterId) return NextResponse.json({ error: 'Only host can swap seats' }, { status: 403 })

  const playerA = state.players.find(p => p.seat === seatA)
  const playerB = state.players.find(p => p.seat === seatB)
  if (!playerA || !playerB) return NextResponse.json({ error: 'Invalid seats' }, { status: 400 })

  playerA.seat = seatB
  playerB.seat = seatA
  state.players.sort((a, b) => a.seat - b.seat)
  await setGame(params.gameId, state)

  await pusher.trigger(gameChannel(params.gameId), 'teams-updated', { players: state.players })
  return NextResponse.json({ ok: true })
}
